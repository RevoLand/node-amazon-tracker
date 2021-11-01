import dayjs, { Dayjs } from 'dayjs';
import { Client } from 'discord.js';
import { exit } from 'process';
import discordConfig from '../../config/discord';
import { ProductController } from '../../controller/ProductController';
import { ProductPriceHistory } from '../../entity/ProductPriceHistory';
import productPriceChangeEmbed from '../../helpers/embeds/productPriceChangeEmbed';
import productPriceDropEmbed from '../../helpers/embeds/productPriceDropEmbed';
import { SettingsEnum } from '../../helpers/enums/SettingsEnum';
import { PriceChangeInterface } from '../../interfaces/PriceChangeInterface';
import { ProductParseResultInterface } from '../../interfaces/ProductParseResultInterface';
import { Settings } from '../Settings';
import productParser from './productParser';
import { ProductTrackerQueue } from './producttrackerqueue';

export class ProductTracker {
  queue: ProductTrackerQueue;

  settings: Settings;

  discord: Client;

  trackingIntervalMinutes: number;

  interval: NodeJS.Timer | undefined;

  latestUpdate: Dayjs | undefined;

  enabledProductsCount: number;

  constructor(settings: Settings, discord: Client) {
    this.settings = settings;
    this.discord = discord;
    this.queue = new ProductTrackerQueue;
  }

  async start() {
    console.log('Starting Product Tracker... ' + dayjs().toString());

    const trackingInterval = this.settings.get(SettingsEnum.TrackingInterval);

    if (!trackingInterval) {
      exit();
    }

    while (!this.discord.isReady()) {
      console.log('Discord client is not ready!');
      await new Promise(r => setTimeout(r, 1000));
    }

    this.trackingIntervalMinutes = +trackingInterval.value;

    if (typeof this.interval !== 'undefined') {
      clearInterval(this.interval);
    }

    this.queueProductsForTracking();

    this.interval = setInterval(this.queueProductsForTracking.bind(this), this.trackingIntervalMinutes * 60 * 1000);

    this.tracker();
  }

  async stop() {
    if (typeof this.interval === 'undefined') {
      return;
    }

    clearInterval(this.interval);

    this.interval = undefined;
  }

  async queueProductsForTracking() {
    console.log('Queueing products for tracking... ' + dayjs().toString());

    let productsForTracking = await ProductController.getEnabled();
    this.enabledProductsCount = productsForTracking?.length ?? 0;

    if (!productsForTracking || productsForTracking.length === 0) {
      console.log('No products found for tracking.');
      return;
    }

    productsForTracking = productsForTracking.filter(product => dayjs(product.updated_at).isBefore(dayjs().subtract(this.trackingIntervalMinutes, 'm')) && !this.queue.hasProduct(product));

    if (productsForTracking.length === 0) {
      console.log('No products found for tracking, matching the interval settings');
      return;
    }

    for (const product of productsForTracking) {
      console.log(`Queueing product for tracking... ${product.asin}`);
      this.queue.enqueue(product);
    }

    console.log(`Queued ${this.queue.length()} products for tracking.`)
  }

  async tracker() {
    while (!this.queue.isEmpty()) {
      const product = this.queue.dequeue();

      if (!product) {
        console.error('Queue boş olmamasına rağmen ürün gelmedi?', {
          queue_products: this.queue.products
        });
        exit();
      }

      this.discord.user?.setActivity(`Ürüne gidiliyor. | ${this.enabledProductsCount} ürün`, { type: 'WATCHING' });
      const parsedProductData = await productParser(product.getUrl());

      if (!parsedProductData) {
        console.error('Ürün bilgisi ayrıştırılamadı.', product);
        continue;
      }

      const productResult: ProductParseResultInterface = {
        product: product,
        parsedData: parsedProductData
      };

      // If price is changed
      if (parsedProductData.price && product.current_price != parsedProductData.price) {
        const priceHistory = new ProductPriceHistory;
        priceHistory.old_price = product.current_price || 0;
        priceHistory.new_price = parsedProductData.price;
        priceHistory.product = product;
        await priceHistory.save();

        const priceChange: PriceChangeInterface = {
          product,
          priceHistory,
          priceDiff: priceHistory.old_price - priceHistory.new_price,
          lowestPriceDiff: (product.lowest_price ?? 0) - priceHistory.new_price,
          priceDiffPerc: 100 - (priceHistory.new_price / priceHistory.old_price * 100),
          lowestPriceDiffPerc: 100 - (priceHistory.new_price / (product.lowest_price ?? 0) * 100)
        }

        if (discordConfig.botSpamChannelId) {
          const botSpamChannel = this.discord.channels.cache.get(discordConfig.botSpamChannelId);
          if (botSpamChannel?.isText()) {
            botSpamChannel.send({
              embeds: [productPriceChangeEmbed(priceChange)]
            })
          }
        }

        const MinimumPriceDrop = this.settings.get(SettingsEnum.MinimumPriceDrop);
        const MinimumPriceDropPerc = this.settings.get(SettingsEnum.MinimumPriceDropPercentage);
        const OnlyShowLowestPrices = this.settings.get(SettingsEnum.OnlyNotifyLowestPriceDrops);

        if (!MinimumPriceDrop || !MinimumPriceDropPerc || !OnlyShowLowestPrices) {
          continue;
        }

        if (priceHistory.new_price < priceHistory.old_price && priceChange.priceDiff >= +MinimumPriceDrop.value) {
          if (OnlyShowLowestPrices.value === '1' && priceHistory.new_price > (product.lowest_price ?? 0)) {
            console.log(`[${product.asin}]:[${product.country}] OnlyShowLowestPrices aktif ve ürünün yeni fiyatı dip fiyatın üzerinde.`);
            continue;
          }

          if (MinimumPriceDropPerc.value !== '0' && priceChange.priceDiffPerc < +MinimumPriceDropPerc.value) {
            console.log(`[${product.asin}]:[${product.country}] MinimumPriceDropPerc aktif ve ürünün yeni fiyatı belirtilen yüzdelik indirimin altında.`);
            continue;
          }

          if (discordConfig.notifyChannelId) {
            const notifyChannel = this.discord.channels.cache.get(discordConfig.notifyChannelId);
            if (notifyChannel?.isText()) {
              notifyChannel.send({
                embeds: [productPriceDropEmbed(priceChange)]
              })
            }
          }
        }
      }

      this.discord.user?.setActivity(`Ürün kaydediliyor. | ${this.enabledProductsCount} ürün`, { type: 'WATCHING' });
      await ProductController.upsertProductDetail(productResult);
    }

    await new Promise(r => setTimeout(r, 1000));
    this.tracker();
  }
}
