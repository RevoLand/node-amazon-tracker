import 'dotenv/config'
import 'reflect-metadata';
import { connectToSql } from './helpers/sql';
import { connectToDiscord } from './helpers/discord';
import { SettingController } from './controller/SettingController';

const main = async () => {
  await connectToSql();

  const settings = await SettingController.getAll();
  if (!settings.count()) {
    await SettingController.insertDefaultSettings();
  }

  await connectToDiscord();
};

main();
