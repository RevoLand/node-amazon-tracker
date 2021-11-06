import 'dotenv/config'
import 'reflect-metadata';
import { connectToSql } from './helpers/sql';
import { connectToDiscord } from './helpers/discord';
import { SettingController } from './controller/SettingController';
import { ProductTracker } from './components/product/producttracker';
import countries from './config/countries';

export const productTrackers: ProductTracker[] = [];

const main = async () => {
  await connectToSql();

  const settings = await SettingController.getAll();
  if (!settings.count()) {
    await SettingController.insertDefaultSettings();
  }

  const discord = await connectToDiscord();

  countries.allowed_countries.forEach(country => {
    const productTracker = new ProductTracker(country, settings, discord);

    productTrackers.push(productTracker);

    productTracker.start();
  });

  const productTracker = new ProductTracker('discord', settings, discord);

  productTrackers.push(productTracker);

  productTracker.setBrowser();
};

main();
