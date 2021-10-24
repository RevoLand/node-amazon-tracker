import 'dotenv/config'
import 'reflect-metadata';
import { ProductController } from './controller/ProductController';
import { createDemoProductData } from './helpers/demo';
import { connectToSql } from './helpers/sql';

const main = async () => {
  await connectToSql();

  // await createDemoProductData();

  const products = await ProductController.getAll();

  console.log('Products', {
    products
  });
  // await productParser('https://www.amazon.com.tr/gp/product/6058821002/ref=ox_sc_act_image_1?smid=A1UNQM1SR2CHM&psc=1');
};

main();
