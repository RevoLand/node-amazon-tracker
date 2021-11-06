import dayjs from 'dayjs';
import { Client } from 'discord.js';
import puppeteer from 'puppeteer';
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
import { ProductTrackerQueue } from './ProductTrackerQueue';
import { shuffle } from 'lodash';

export class ProductTracker {
  queue: ProductTrackerQueue;

  browser?: puppeteer.Browser;

  settings: Settings;

  discord: Client;

  trackingIntervalMinutes: number;

  interval?: NodeJS.Timer;

  status = false;

  captcha: string;

  country: string;

  constructor(country: string, settings: Settings, discord: Client) {
    this.country = country;
    this.settings = settings;
    this.discord = discord;
    this.queue = new ProductTrackerQueue;
  }

  async setBrowser() {
    if (this.browser) {
      return this.browser;
    }

    const browser = await puppeteer.launch({
      headless: true
    });

    browser.on('disconnected', () => this.browser = undefined);

    this.browser = browser;

    return browser;
  }

  async start() {
    console.log('Starting Product Tracker... ' + dayjs().toString());

    const trackingInterval = this.settings.get(SettingsEnum.trackingInterval);

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

    this.status = true;
    if (this.country === 'discord') {
      return;
    }
    this.interval = setInterval(this.queueProductsForTracking.bind(this), this.trackingIntervalMinutes / 4 * 60 * 1000);

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
    if (this.browser) {
      await this.browser.close();
      this.browser = undefined;
    }
  }

  async queueProductsForTracking() {
    console.log(`[${this.country}] Queueing products for tracking... ` + dayjs().toString());

    try {
      let productsForTracking = await ProductController.enabledWithCountryAndDateFilter(this.country, dayjs().subtract(this.trackingIntervalMinutes, 'm').toDate());

      if (!productsForTracking || productsForTracking.length === 0) {
        return;
      }

      productsForTracking = productsForTracking.filter(product => !this.queue.hasProduct(product));

      if (productsForTracking.length === 0) {
        return;
      }

      const shuffledProductsList = shuffle(productsForTracking);

      for (const product of shuffledProductsList) {
        this.queue.enqueue(product);
      }
    } catch (error) {
      console.error('Hata - queueProductsForTracking', error);
    }

    console.log(`[${this.country}] Queued ${this.queue.length()} products for tracking.`)
  }

  async tracker() {
    const products: Product[] = [];

    while (!this.queue.isEmpty()) {
      const product = this.queue.dequeue();

      if (!product) {
        console.error('Queue boş olmamasına rağmen ürün gelmedi?', {
          productQueue: this.queue.products,
          country: this.country
        });

        continue;
      }

      products.push(product);
    }

    if (products.length > 0 && !this.browser) {
      await this.setBrowser();
    }

    if (products.length === 0 && this.browser) {
      await this.browser.close();
      this.browser = undefined;
    }

    for (const product of products) {
      // Reload latest data from database
      product.reload();

      const parsedProductData = await productParser(product.getUrl(), this);

      if (!parsedProductData) {
        console.error('Ürün bilgisi ayrıştırılamadı.', product);
        continue;
      }

      // If price is changed
      if (parsedProductData.price && product.currentPrice != parsedProductData.price) {
        let discordNotification = true;
        const priceHistory = new ProductPriceHistory;
        priceHistory.oldPrice = product.currentPrice || 0;
        priceHistory.newPrice = parsedProductData.price;
        priceHistory.product = product;
        priceHistory.primeOnly = !!parsedProductData.primeOnly;
        await priceHistory.save();

        const priceChange: PriceChangeInterface = {
          product,
          parsedProductData,
          priceHistory,
          priceDiff: +(priceHistory.oldPrice - priceHistory.newPrice).toFixed(2),
          lowestPriceDiff: +((product.lowestPrice ?? 0) - priceHistory.newPrice).toFixed(2),
          priceDiffPerc: +(100 - (priceHistory.newPrice / priceHistory.oldPrice * 100)).toFixed(2),
          lowestPriceDiffPerc: +(100 - (priceHistory.newPrice / (product.lowestPrice ?? 0) * 100)).toFixed(2)
        }

        if (discordConfig.botSpamChannelId) {
          const botSpamChannel = this.discord.channels.cache.get(discordConfig.botSpamChannelId);
          if (botSpamChannel?.isText()) {
            botSpamChannel.send({
              embeds: [productPriceChangeEmbed(priceChange)]
            })
          }
        }

        const minimumPriceDrop = this.settings.get(SettingsEnum.minimumPriceDrop);
        const minimumPriceDropPerc = this.settings.get(SettingsEnum.minimumPriceDropPercentage);
        const onlyShowLowestPrices = this.settings.get(SettingsEnum.onlyNotifyLowestPriceDrops);

        if (!minimumPriceDrop || !minimumPriceDropPerc || !onlyShowLowestPrices) {
          console.error('Ayarlar alınamadı!', {
            minimumPriceDrop,
            minimumPriceDropPerc,
            onlyShowLowestPrices
          });

          continue;
        }

        if (priceHistory.newPrice < priceHistory.oldPrice && priceChange.priceDiff >= +minimumPriceDrop.value) {
          if (onlyShowLowestPrices.value === '1' && priceHistory.newPrice > (product.lowestPrice ?? 0)) {
            console.log(`[${product.asin}]:[${product.country}] OnlyShowLowestPrices aktif ve ürünün yeni fiyatı dip fiyatın üzerinde.`);

            discordNotification = false;
          }

          if (minimumPriceDropPerc.value !== '0' && priceChange.priceDiffPerc < +minimumPriceDropPerc.value) {
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

      await ProductController.upsertProduct(productResult);
      await new Promise(r => setTimeout(r, 10000));
    }

    await new Promise(r => setTimeout(r, 10000));
    this.tracker();
  }

  updateCaptcha(text: string) {
    this.captcha = text;
  }
}
