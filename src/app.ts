import 'dotenv/config'
import 'reflect-metadata';
import { connectToSql } from './helpers/sql';
import { connectToDiscord } from './helpers/discord';

const main = async () => {
  await connectToSql();
  await connectToDiscord();

  // const products = await ProductController.getAll();

  // console.log('Products', {
  //   products
  // });

  // for (const product of products) {
  //   console.log('Parsing Product:' + product.asin + ' - Countries: ' + product.tracking_countries.join(', '));
  //   for (const productDetail of product.productDetails) {
  //     console.log(`Parsing product for country ${productDetail.country}`);
  //     await productParser(productDetail.getUrl());
  //   }
  // }
  // await productParser('https://www.amazon.com.tr/gp/product/6058821002/ref=ox_sc_act_image_1?smid=A1UNQM1SR2CHM&psc=1');
};

main();
