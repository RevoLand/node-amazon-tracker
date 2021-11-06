import { getRepository } from 'typeorm';
import { Settings } from '../components/Settings';
import { Setting } from '../entity/Setting';
import { SettingsEnum } from '../helpers/enums/SettingsEnum';

export class SettingController {
  static getAll = async () => new Settings(await getRepository(Setting).find());

  static insertDefaultSettings = async () => {
    const defaultSettings = [
      {
        name: SettingsEnum.trackingInterval,
        value: '20'
      },
      {
        name: SettingsEnum.minimumPriceDrop,
        value: '10'
      },
      {
        name: SettingsEnum.minimumPriceDropPercentage,
        value: '3'
      },
      {
        name: SettingsEnum.onlyNotifyLowestPriceDrops,
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

      throw new Error('CouldntInsertDefaultSettings')
    }
  }
}
