import { exit } from 'process';
import { Connection, createConnection } from 'typeorm';
import database from '../config/database';
import { ExitCodes } from './enum';

export const connectToSql = async (): Promise<Connection | undefined> => {
  try {
    console.log('Connecting to SQL.');

    const sqlConnection = await createConnection({
      type: 'mysql',
      host: database.hostname,
      port: database.port,
      username: database.user,
      password: database.password,
      database: database.name,
      entities: [
        __dirname + '/../entity/*.ts'
      ],
      synchronize: true,
      logging: false
    });

    console.log('SQL Connection established.');

    return sqlConnection;
  } catch (error) {
    console.error('An error happened while connecting to SQL.', error);

    exit(ExitCodes.SQLConnectionFailed);
  }
};
