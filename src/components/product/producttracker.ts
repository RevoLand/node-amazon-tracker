import dayjs from 'dayjs';
import { Client } from 'discord.js';
import { exit } from 'process';
import discordConfig from '../../config/discord';
import { ProductController } from '../../controller/ProductController';
import { Product } from '../../entity/Product';
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

  enabledProductsCount: number;

  status = false;

  captcha: string;

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

    if (this.status) {
      return;
    }

    while (!this.discord.isReady()) {
      console.log('Discord client is not ready!');
      await new Promise(r => setTimeout(r, 1000));
    }

    this.trackingIntervalMinutes = +trackingInterval.value;

    if (typeof this.interval !== 'undefined') {
      clearInterval(this.interval);
    }

    this.interval = setInterval(this.queueProductsForTracking.bind(this), this.trackingIntervalMinutes / 4 * 60 * 1000);

    this.status = true;

    await this.queueProductsForTracking();
    this.tracker();
  }

  async restart() {
    console.log('Restarting Product Tracker... ' + dayjs().toString());
    if (this.status) {
      await this.stop();
    }

    await this.start();
  }

  async stop() {
    console.log('Stopping Product Tracker... ' + dayjs().toString());

    if (typeof this.interval === 'undefined' || !this.status) {
      return;
    }

    clearInterval(this.interval);

    this.interval = undefined;
    this.status = false;
  }

  async queueProductsForTracking() {
    console.log('Queueing products for tracking... ' + dayjs().toString());

    let productsForTracking = await ProductController.getEnabled();
    this.enabledProductsCount = productsForTracking?.length ?? 0;
    this.discord.user?.setActivity(`${this.enabledProductsCount} ürün`, { type: 'WATCHING' });

    if (!productsForTracking || productsForTracking.length === 0) {
      return;
    }

    productsForTracking = productsForTracking.filter(product => dayjs(product.updated_at).isBefore(dayjs().subtract(this.trackingIntervalMinutes, 'm')) && !this.queue.hasProduct(product));

    if (productsForTracking.length === 0) {
      return;
    }

    for (const product of productsForTracking) {
      this.queue.enqueue(product);
    }

    console.log(`Queued ${this.queue.length()} products for tracking.`)
  }

  async tracker() {
    const products: Product[] = [];

    while (!this.queue.isEmpty()) {
      const product = this.queue.dequeue();

      if (!product) {
        console.error('Queue boş olmamasına rağmen ürün gelmedi?', {
          queue_products: this.queue.products
        });

        continue;
      }

      products.push(product);
    }

    for (const product of products) {
      // Reload latest data from database
      product.reload();

      this.discord.user?.setActivity(`Ürüne gidiliyor. | ${this.enabledProductsCount} ürün`, { type: 'WATCHING' });
      const parsedProductData = await productParser(product.getUrl(), this.discord);

      if (!parsedProductData) {
        console.error('Ürün bilgisi ayrıştırılamadı.', product);
        continue;
      }

      // If price is changed
      if (parsedProductData.price && product.current_price != parsedProductData.price) {
        let discordNotification = true;
        const priceHistory = new ProductPriceHistory;
        priceHistory.old_price = product.current_price || 0;
        priceHistory.new_price = parsedProductData.price;
        priceHistory.product = product;
        priceHistory.prime_only = !!parsedProductData.primeOnly;
        await priceHistory.save();

        const priceChange: PriceChangeInterface = {
          product,
          parsedProductData,
          priceHistory,
          priceDiff: +(priceHistory.old_price - priceHistory.new_price).toFixed(2),
          lowestPriceDiff: +((product.lowest_price ?? 0) - priceHistory.new_price).toFixed(2),
          priceDiffPerc: +(100 - (priceHistory.new_price / priceHistory.old_price * 100)).toFixed(2),
          lowestPriceDiffPerc: +(100 - (priceHistory.new_price / (product.lowest_price ?? 0) * 100)).toFixed(2)
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
          console.error('Ayarlar alınamadı!', {
            MinimumPriceDrop,
            MinimumPriceDropPerc,
            OnlyShowLowestPrices
          });
          continue;
        }

        if (priceHistory.new_price < priceHistory.old_price && priceChange.priceDiff >= +MinimumPriceDrop.value) {
          if (OnlyShowLowestPrices.value === '1' && priceHistory.new_price > (product.lowest_price ?? 0)) {
            console.log(`[${product.asin}]:[${product.country}] OnlyShowLowestPrices aktif ve ürünün yeni fiyatı dip fiyatın üzerinde.`);

            discordNotification = false;
          }

          if (MinimumPriceDropPerc.value !== '0' && priceChange.priceDiffPerc < +MinimumPriceDropPerc.value) {
            console.log(`[${product.asin}]:[${product.country}] MinimumPriceDropPerc aktif ve ürünün yeni fiyatı belirtilen yüzdelik indirimin altında.`);

            discordNotification = false;
          }

          if (discordConfig.notifyChannelId && discordNotification) {
            const notifyChannel = this.discord.channels.cache.get(discordConfig.notifyChannelId);
            if (notifyChannel?.isText()) {
              notifyChannel.send({
                embeds: [productPriceDropEmbed(priceChange)]
              })
            }
          }
        }
      }

      const productResult: ProductParseResultInterface = {
        product,
        parsedData: parsedProductData
      };

      this.discord.user?.setActivity(`Ürün kaydediliyor. | ${this.enabledProductsCount} ürün`, { type: 'WATCHING' });
      await ProductController.upsertProductDetail(productResult);
      this.discord.user?.setActivity(`${this.enabledProductsCount} ürün`, { type: 'WATCHING' });
      await new Promise(r => setTimeout(r, 5000));
    }

    await new Promise(r => setTimeout(r, 10000));
    this.tracker();
  }

  updateCaptcha(text: string) {
    this.captcha = text;
  }
}
