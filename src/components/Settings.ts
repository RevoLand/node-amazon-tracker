import { Setting } from '../entity/Setting';
import { SettingsEnum } from '../helpers/enums/SettingsEnum';

export class Settings {
  private settings: Setting[];

  constructor(settings: Setting[]) {
    this.settings = settings;
  }

  get(key: SettingsEnum) {
    return this.settings.find(setting => setting.key === key);
  }

  getAll() {
    return this.settings;
  }

  count() {
    return this.settings.length;
  }

  async update(key: SettingsEnum, value: string) {
    const setting = this.get(key);
    if (!setting) {
      return;
    }

    setting.value = value;
    await setting.save();

    return setting;
  }
}
