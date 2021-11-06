import { CheerioAPI, load } from 'cheerio';
import dayjs from 'dayjs';
import { Message } from 'discord.js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import discordConfig from '../../config/discord';
import { trimNewLines } from '../../helpers/common';
import { getTldFromUrl } from '../../helpers/productUrlHelper';
import { ProductParserInterface } from '../../interfaces/ProductParserInterface';
import { ProductTracker } from './producttracker';

export const getParsedProductData = ($: CheerioAPI): ProductParserInterface | undefined => {
  try {
    // const htmlLang = $('html').attr('lang');
    const locale = $('.nav-logo-locale').text();
    const title = trimNewLines($('#title #productTitle').text());
    const asin = $('#ASIN') ? '' + $('#ASIN').val() : '';
    const image = $('#imgTagWrapperId #landingImage').attr('src') || $('#imgBlkFront').attr('src');
    const primeOnly = $('#tryPrimeButton_').length > 0;
    const abroad = $('#globalStoreBadgePopoverInsideBuybox_feature_div').text()?.length > 0;
    const shippingFee = $('#mir-layout-DELIVERY_BLOCK-slot-DELIVERY_MESSAGE a').text();

    let priceText = ($('#booksHeaderSection #price').text() || $('#price_inside_buybox').text() || $('#corePrice_desktop span[data-a-color=\'price\'] .a-offscreen').first().text()).replace(/[^0-9,.]/g, '');
    if (['.com.tr', '.es', '.fr', '.it'].includes(locale)) {
      priceText = priceText.replace(/\./g, '').replace(',', '.');
    }
    const price = priceText.length > 0 ? +parseFloat(priceText).toFixed(2) : undefined;

    const stockText = $('#availability_feature_div > #availability').text() || $('form#addToCart #availability').text();
    const stock = (stockText?.replace(/[^0-9]/g, '')) ? Number(stockText.replace(/[^0-9]/g, '')) : undefined;
    const sellerText = $('#merchant-info span') ?? $('div[tabular-attribute-name="Venditore"] span') ?? $('div[tabular-attribute-name="Sold by"] span') ??
      $('div[tabular-attribute-name="Vendu par"] span') ?? $('div[tabular-attribute-name="Vendido por"] span');
    const seller = trimNewLines(sellerText.first().text() || sellerText.text());

    const product: ProductParserInterface = {
      title,
      asin,
      image,
      locale: locale === '.us' ? '.com' : locale,
      primeOnly,
      abroad,
      shippingFee,

      price,

      stockText,
      stock,
      seller
    };

    return product;
  } catch (error) {
    console.error('getParsedProductData error', error);
  }
}

const productParser = async (url: string, productTracker: ProductTracker): Promise<ProductParserInterface | undefined> => {
  console.log(dayjs().toString() + ' | Parsing product:', url);
  try {
    const pages = await productTracker.browser.pages();
    // Open a new page in puppeteer
    const page = pages.length > 0 ? pages[0] : await productTracker.browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36 NodeAmazonTracker/1.0.0');

    await page.setViewport({ width: 1280, height: 720 })

    const tld = getTldFromUrl(url);
    const cookieFileName = `cookies${tld}.json`;
    try {
      if (existsSync(cookieFileName)) {
        const cookies = readFileSync(cookieFileName, 'utf8');

        if (cookies) {
          await page.setCookie(...JSON.parse(cookies));
        }
      }
    } catch (error) {
      console.error('cookie parse error', error);
    }

    // Navigate to product url
    await page.goto(url);

    const cookiesElement = await page.$('#sp-cc-accept');
    if (cookiesElement) {
      // Accept cookies!
      await page.click('#sp-cc-accept');
    }

    // Load the content into cheerio for easier parsing
    const $ = load((await page.content()).replace(/\n\s*\n/gm, ''));

    const captchaElement = await page.$('#captchacharacters');

    // TODO
    // productTracker CAPTCHA ?!!?!
    if (captchaElement && productTracker) {
      console.log('Captcha geldi.');
      const captchaImg = $('form img').attr('src');

      const captchaChannel = productTracker.discord.channels.cache.get(discordConfig.captchaChannelId);
      if (captchaChannel?.isText()) {
        const captchaMessage = await captchaChannel.send({
          content: `Captcha!\n\nÜrün: ${url}\n\n${captchaImg}` + (discordConfig.captchaNotifyUserId ? `\n<@${discordConfig.captchaNotifyUserId}>` : ''),
        });

        console.log('Captcha mesajı gönderildi, mesaj id: ', captchaMessage.id);

        captchaMessage.channel.awaitMessages({
          filter: (m: Message) => m.reference?.messageId === captchaMessage.id,
          max: 1
        }).then((collected) => {
          const captchaAnswer = collected.first();
          if (captchaAnswer) {
            console.log('Captcha yanıtı geldi.', url, captchaAnswer.content);

            productTracker.updateCaptcha(captchaAnswer.content.trim().toUpperCase());
          }
        })
      }

      while (!productTracker.captcha) {
        await new Promise(r => setTimeout(r, 1000));
      }

      await page.type('#captchacharacters', productTracker.captcha);
      await page.click('button[type="submit"]');

      productTracker.updateCaptcha('');

      await page.waitForNavigation();

      const cookieJson = JSON.stringify(await page.cookies())
      writeFileSync(cookieFileName, cookieJson)

      return await productParser(url, productTracker);
    }

    const product = getParsedProductData($);

    if (product?.asin.includes('undefined')) {
      if (!existsSync('products')) {
        mkdirSync('products');
      }

      await page.screenshot({
        path: `products/${dayjs().unix()}.png`
      })

      writeFileSync(`products/${dayjs().unix()}.html`, await page.content());
      console.error('ASIN BULUNAMADI??', {
        product,
        url
      })

      return;
    }

    return product;
  } catch (error) {
    console.error('productParser error', error);
  }
}

export default productParser;
