import 'dotenv/config'
import 'reflect-metadata';
import { Connection, createConnection } from 'typeorm';
import database from './config/database';

const main = async () => {
  try {
    const sqlConnection: Connection = await createConnection({
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
    console.error('sql connection error', err);
  }

  console.log('Bağlandık.');
};

main();
