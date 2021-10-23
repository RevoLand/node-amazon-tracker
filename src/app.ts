import 'dotenv/config'
import 'reflect-metadata';
import { Connection, createConnection } from 'typeorm';
import database from './config/database';
import { Product } from './entity/Product';

const main = async () => {

  try {
    const connection: Connection = await createConnection({
      type: 'mysql',
      host: database.hostname,
      port: database.port,
      username: database.user,
      password: database.password,
      database: database.name,
      entities: [
        __dirname + '/entity/*.ts'
      ],
      synchronize: true,
      logging: false
    });
  } catch (err) {
    console.error('main -> connection error', err);
  }

  console.log('Bağlandık.');
};

main();
