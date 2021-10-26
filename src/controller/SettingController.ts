import { exit } from 'process';
import { getRepository } from 'typeorm';
import { Settings } from '../components/Settings';
import { Setting } from '../entity/Setting';
import { ExitCodesEnum } from '../helpers/enums/ExitCodesEnum';
import { SettingsEnum } from '../helpers/enums/SettingsEnum';

export class SettingController {
  static getAll = async () => new Settings(await getRepository(Setting).find());

  static insertDefaultSettings = async () => {
    const defaultSettings = [
      {
        name: SettingsEnum.TrackingInterval,
        value: '20'
      },
      {
        name: SettingsEnum.MinimumPriceDrop,
        value: '10'
      },
      {
        name: SettingsEnum.MinimumPriceDropPercentage,
        value: '3'
      },
      {
        name: SettingsEnum.OnlyNotifyLowestPriceDrops,
        value: '1'
      },
    ];
    try {
      for (const defaultSetting of defaultSettings) {
        const setting = new Setting;
        setting.key = defaultSetting.name
        setting.value = defaultSetting.value;
        await setting.save();
      }

      console.log('Default settings inserted to database.');
    } catch (error) {
      console.error('An error happened while inserting default settings.', error);

      exit(ExitCodesEnum.CouldntInsertDefaultSettings)
    }
  }
}
