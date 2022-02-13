import { CheerioAPI, load } from 'cheerio';
import dayjs from 'dayjs';
import { Message } from 'discord.js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import discordConfig from '../../config/discord';
import { trimNewLines, wait } from '../../helpers/common';
import { computerVision } from '../../helpers/computerVision';
import { getTldFromUrl } from '../../helpers/productUrlHelper';
import { ProductParserInterface } from '../../interfaces/ProductParserInterface';
import { ProductTracker } from './ProductTracker';

const getParsedProductData = ($: CheerioAPI): ProductParserInterface | undefined => {
  try {
    // const htmlLang = $('html').attr('lang');
    const locale = $('.nav-logo-locale').text();
    const title = trimNewLines($('#title #productTitle').text());
    const asin = $('#ASIN') ? '' + $('#ASIN').val() : '';
    const image = $('#imgTagWrapperId #landingImage').attr('src') || $('#imgBlkFront').attr('src');
    const primeOnly = $('#tryPrimeButton_').length > 0;
    const abroad = $('#globalStoreBadgePopoverInsideBuybox_feature_div').text()?.length > 0;
    const shippingFee = $('#mir-layout-DELIVERY_BLOCK-slot-DELIVERY_MESSAGE a').text();

    let priceText = ($('#booksHeaderSection #price').text() || $('#price_inside_buybox').text() || $('#corePrice_feature_div .a-offscreen').text() || $('#corePrice_desktop span[data-a-color=\'price\'] .a-offscreen').first().text()).replace(/[^0-9,.]/g, '');
    if (['.com.tr', '.es', '.fr', '.it', '.de'].includes(locale)) {
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
  const page = await (await productTracker.setBrowser()).newPage();

  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36 NodeAmazonTracker/1.0.0');
  await page.setViewport({ width: 1280, height: 720 })

  try {
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

    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['stylesheet', 'font', 'image'].includes(req.resourceType())) {
        req.abort();
        return;
      }

      req.continue();
    })

    // Navigate to product url
    await page.goto(url, {
      timeout: 60_000
    });

    const cookiesElement = await page.$('#sp-cc-accept');
    if (cookiesElement) {
      // Accept cookies!
      await page.click('#sp-cc-accept');
    }

    // Load the content into cheerio for easier parsing
    const $ = load((await page.content()).replace(/\n\s*\n/gm, ''));

    const captchaElement = await page.$('#captchacharacters');

    if (captchaElement && productTracker) {
      const captchaImg = $('form img').attr('src') ?? '';
      productTracker.updateCaptcha(await computerVision(captchaImg));

      const captchaChannel = productTracker.discord.channels.cache.get(discordConfig.captchaChannelId);
      if (captchaChannel?.isText()) {
        let captchaMessageContent = productTracker.captcha.length > 0 ? 'Azure ile çözüldü! 🙄' : 'Captcha! 😓';
        captchaMessageContent += '\n\n';
        captchaMessageContent += `Ürün: ${url}\n\n${captchaImg}`;
        if (productTracker.captcha.length > 0) {
          captchaMessageContent += `\nAzure Captcha: ${productTracker.captcha}`;
        } else if (discordConfig.captchaNotifyUserId) {
          captchaMessageContent += `\n<@${discordConfig.captchaNotifyUserId}>`;
        }

        const captchaMessage = await captchaChannel.send({
          content: captchaMessageContent,
        });

        if (!productTracker.captcha) {
          captchaMessage.channel.awaitMessages({
            filter: (m: Message) => m.reference?.messageId === captchaMessage.id,
            max: 1
          }).then(async (collected) => {
            const captchaAnswer = collected.first();
            if (captchaAnswer) {
              console.log('Captcha yanıtı geldi.', url, captchaAnswer.content);

              productTracker.updateCaptcha(captchaAnswer.content.trim().toUpperCase());

              await captchaAnswer.delete();
            }
          })
        }

        while (!productTracker.captcha) {
          await wait(1000);
        }

        setTimeout(() => captchaMessage.delete(), 15000);
      }

      await page.type('#captchacharacters', productTracker.captcha);

      productTracker.updateCaptcha('');

      await Promise.all([page.click('button[type="submit"]'), page.waitForNavigation()]);

      const cookieJson = JSON.stringify(await page.cookies())
      writeFileSync(cookieFileName, cookieJson);

      await page.close();

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

      await page.close();

      return;
    }

    await page.close();

    return product;
  } catch (error) {
    console.error('productParser error', error);
    await page.close();
  }
}

export default productParser;
