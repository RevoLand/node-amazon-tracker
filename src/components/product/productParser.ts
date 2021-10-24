import { CheerioAPI, load } from 'cheerio';
import puppeteer from 'puppeteer';
import { trimNewLines } from '../../helpers/common';

export interface ProductParser {
  title: string,
  asin: string,
  image?: string,
  locale: string,
  primeOnly?: boolean,
  abroad?: boolean,
  shippingFee?: string,

  price?: number,

  stock?: number,
  stockText?: string,
  seller?: string,
  available?: boolean
}


const getParsedProductData = ($: CheerioAPI): ProductParser | undefined => {
  try {
    // const htmlLang = $('html').attr('lang');
    const locale = $('.nav-logo-locale').text();
    const title = trimNewLines($('#title #productTitle').text());
    const asin = '' + $('#ASIN').val();
    const image = $('#imgTagWrapperId #landingImage').attr('src') || $('#imgBlkFront').attr('src');
    const primeOnly = $('#tryPrimeButton_').length > 0;
    const abroad = $('#globalStoreBadgePopoverInsideBuybox_feature_div').text()?.length > 0;
    const shippingFee = $('#mir-layout-DELIVERY_BLOCK-slot-DELIVERY_MESSAGE a').text();

    const priceText = ($('#booksHeaderSection #price').text() || $('#priceInsideBuyBox_feature_div #price_inside_buybox').text()).replace(/[^0-9,.]/g, '').replace(/\./g, '').replace(',', '.');
    const price = priceText.length > 0 ? parseFloat(priceText) : undefined;

    const stockText = $('#availability_feature_div > #availability').text() || $('form#addToCart #availability').text();
    const stock = (stockText?.replace(/[^0-9]/g, '')) ? Number(stockText.replace(/[^0-9]/g, '')) : undefined;
    const seller = trimNewLines($('#merchant-info > span').text());

    const product: ProductParser = {
      title,
      asin,
      image,
      locale,
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

const productParser = async (url: string): Promise<ProductParser | undefined> => {
  console.log('Parsing product:', url);
  try {
    const browser = await puppeteer.launch({
      headless: true
    });

    // Open a new page in puppeteer
    const page = await browser.newPage();

    // Navigate to product url
    await page.goto(url);

    // Accept cookies!
    await page.click('#sp-cc-accept');

    // Get page content and replace newlines
    const content = (await page.content()).replace(/\n\s*\n/gm, '');

    // Load the content into cheerio for easier parsing
    const $ = load(content);

    const product = getParsedProductData($);

    // Close the browser
    await browser.close();

    return product;
  } catch (error) {
    console.log('productParser error', error);
  }
}

export default productParser;
