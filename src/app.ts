// var database = require('./config/database');
import parseProductUrls from './components/product/productUrlHelper';
import productParser from './components/product/productParser';

const main = async () => {
  const testProducts = [
    'https://www.amazon.com.tr/gp/product/B091Q7CG4N/ref=ox_sc_saved_image_3?smid=&psc=1', // stok dışı
    'https://www.amazon.com.tr/gp/product/B08XZR8PD5/ref=ox_sc_act_image_10?smid=A1UNQM1SR2CHM&psc=1', // çay
    'https://www.amazon.com.tr/gp/product/6052998385/ref=ox_sc_saved_image_4?smid=A1UNQM1SR2CHM&psc=1', // kitap
    'https://www.amazon.com.tr/gp/product/B08BHTY15P/ref=ox_sc_saved_image_6?smid=A1UNQM1SR2CHM&psc=1', // ayakkabı
    'https://www.amazon.com.tr/gp/product/B08J45VJ8Y/ref=ox_sc_saved_image_6?smid=A1UNQM1SR2CHM&psc=1', // mutfak
    'https://www.amazon.com.tr/gp/product/B08P23Y9YR/ref=ox_sc_saved_image_8?smid=A1HN1W25VYST46&psc=1', // farklı satıcı ama prime
    'https://www.amazon.com.tr/gp/product/B07CVBSCCH/ref=ox_sc_saved_image_7?smid=A3O5TP4R0OZYXZ&psc=1' // yurtdışı ürün
  ].join(' ');
  const parsedProductUrls = parseProductUrls(testProducts);

  for (const productUrl of parsedProductUrls) {
    await productParser(productUrl);
    await new Promise(r => setTimeout(r, 800));
  }
};

main();
