import { CheerioAPI } from "cheerio";

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { trimNewLines } = require('../../helpers/common');

const getAvailability = async ($: CheerioAPI) => {
  const stockText = $('#availability_feature_div > #availability').text() || $('form#addToCart #availability').text();
  const stock = stockText.match(/\d+/)?.join('') ?? '';
  const seller = trimNewLines($('#merchant-info > span').text());

  return {
    available: stockText.includes('Stokta'),
    stock,
    seller,
    stockText,
  }
}

const getProductPrice = async ($: CheerioAPI) => {
  const price = trimNewLines($('#booksHeaderSection #price').text() || $('#priceInsideBuyBox_feature_div #price_inside_buybox').text());

  try {
    return {
      price
    }
  } catch (err) {
    return {
      error: true,
      err
    }
  }
}

const getProduct = async ($: CheerioAPI) => {
  const title = trimNewLines($('#title #productTitle').text());
  const asin = $('#ASIN').val();
  const image = $('#imgTagWrapperId #landingImage').attr('src') || $('#imgBlkFront').attr('src');
  const primeOnly = $('#tryPrimeButton_').length > 0;
  const abroad = $('#globalStoreBadgePopoverInsideBuybox_feature_div').text();
  const shippingFee = $('#mir-layout-DELIVERY_BLOCK-slot-DELIVERY_MESSAGE a').text();

  return {
    title,
    asin,
    image,
    primeOnly,
    abroad,
    shippingFee
  };
}

const productParser = async (url: string) => {
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
    const $ = cheerio.load(content);

    const product = await getProduct($);
    const price = await getProductPrice($);
    const availability = await getAvailability($);

    console.log('product', {
      url,
      product,
      price,
      availability
    });

    // Take a screenshot of the page for testing purposes
    await page.screenshot({
      path: `products/${product.asin}.png`
    });

    // Close the browser
    await browser.close();
  } catch (err) {
    console.log('hata', err);
    return false;
  }
}

export default productParser;
