const puppeteer = require('puppeteer');
const cheerio = require('cheerio')

/** @param {string} text */
const trimNewLines = (text) => text.replace(/\n/g, '');

/**
 * @param {cheerio.CheerioAPI} $
*/
const getAvailability = async ($) => {
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

/**
 * @param {cheerio.CheerioAPI} $
*/
const getProductPrice = async ($) => {
  const price = trimNewLines($('#booksHeaderSection > #price').text() || $('#priceInsideBuyBox_feature_div #price_inside_buybox').text());

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

/**
 * @param {cheerio.CheerioAPI} $
*/
const getProduct = async ($) => {
  const title = trimNewLines($('#title #productTitle').text());
  const asin = $('#ASIN').val();
  const image = $('#imgTagWrapperId #landingImage').attr('src') || $('#imgBlkFront').attr('src');

  return {
    title,
    asin,
    image
  };
}

const productParser = async (url) => {
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

module.exports = productParser;
