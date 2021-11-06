import { MessageEmbed } from 'discord.js';
import { Settings } from '../../components/Settings';
import { SettingsEnum } from '../enums/SettingsEnum';

const settingsEmbed = (settings: Settings): MessageEmbed => {
  const embed = new MessageEmbed()
    .setTitle('Ayarlar')
    .addField('Takip Aralığı', '' + settings.get(SettingsEnum.trackingInterval)?.value, true)
    .addField('En az fiyat düşüşü', '' + settings.get(SettingsEnum.minimumPriceDrop)?.value, true)
    .addField('En az fiyat düşüşü (yüzde)', settings.get(SettingsEnum.minimumPriceDropPercentage)?.value + '%', true)
    .addField('Yalnızca en düşük fiyat bildirimi', settings.get(SettingsEnum.onlyNotifyLowestPriceDrops)?.value === '1' ? 'Evet' : 'Hayır', true)
    .setTimestamp();

  return embed;
}

export default settingsEmbed;
