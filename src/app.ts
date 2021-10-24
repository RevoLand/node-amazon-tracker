import 'dotenv/config'
import 'reflect-metadata';
import { connectToSql } from './helpers/sql';

const main = async () => {
  const sqlConnection = await connectToSql();
  // await productParser('https://www.amazon.com.tr/gp/product/6058821002/ref=ox_sc_act_image_1?smid=A1UNQM1SR2CHM&psc=1');
};

main();
