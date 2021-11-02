import 'dotenv/config'
import 'reflect-metadata';
import { connectToSql } from './helpers/sql';
import { connectToDiscord } from './helpers/discord';
import { SettingController } from './controller/SettingController';
import { ProductTracker } from './components/product/producttracker';

export let productTrackerMain: ProductTracker;

const main = async () => {
  await connectToSql();

  const settings = await SettingController.getAll();
  if (!settings.count()) {
    await SettingController.insertDefaultSettings();
  }

  const discord = await connectToDiscord();

  productTrackerMain = new ProductTracker(settings, discord);
  productTrackerMain.start();
};

main();
