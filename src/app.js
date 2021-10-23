// var database = require('./config/database');
const { parseProductUrls } = require('./components/product/productUrlHelper');
const productParser = require('./components/product/productParser');

const textWithProductUrl = 'Ben bir sürü ürün içeriyorum! https://www.amazon.com.tr/gp/product/6052998385/ref=ox_sc_saved_image_4?smid=A1UNQM1SR2CHM&psc=1 https://www.amazon.com.tr/gp/product/B091Q7CG4N/ref=ox_sc_saved_image_3?smid=&psc=1 https://www.amazon.com.tr/gp/product/B08MVBTSGL/ref=ox_sc_saved_image_7?smid=A1UNQM1SR2CHM&psc=1 https://www.amazon.com.tr/gp/product/B08XZR8PD5/ref=ox_sc_act_image_11?smid=A1UNQM1SR2CHM&psc=1';
const parsedProductUrls = parseProductUrls(textWithProductUrl);

parsedProductUrls.forEach(async productUrl => {
  await productParser(productUrl);
  await new Promise(r => setTimeout(r, 1000));
});
