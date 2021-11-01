import { MessageEmbed } from 'discord.js';
import { PriceChangeInterface } from '../../interfaces/PriceChangeInterface';

const productPriceDropEmbed = (priceChange: PriceChangeInterface): MessageEmbed => {
  let descriptionText = `**%${priceChange.priceDiffPerc} İNDİRİM**`;

  if (priceChange.priceDiffPerc >= 90) {
    descriptionText += '\n:fire::fire::fire:';
  } else if (priceChange.priceDiffPerc >= 60) {
    descriptionText += '\n:fire::fire:';
  } else if (priceChange.priceDiffPerc >= 30) {
    descriptionText += '\n:fire:';
  }

  if (priceChange.priceDiffPerc >= 25) {
    descriptionText += '\n\n';
    descriptionText += '@everyone';
  }

  const embed = new MessageEmbed()
    .setTitle(priceChange.product.name ?? '')
    .setDescription(descriptionText)
    .setURL(priceChange.product.getUrl())
    .addField('Takibe Başlandığı Fiyat', '' + priceChange.product.price, true)
    .addField('Bilinen En Düşük Fiyat', `${priceChange.product.lowest_price}`, true)
    .addField('Önceki Fiyat', `${priceChange.priceHistory.old_price}`, true)
    .addField('Yeni Fiyat', `${priceChange.priceHistory.new_price} (-${priceChange.priceDiff})`, true)
    .addField('En Düşük Fiyata Olan Fark', `${priceChange.lowestPriceDiff} (% ${priceChange.lowestPriceDiffPerc})`, true)
    .setAuthor(priceChange.product.country)
    .setTimestamp(priceChange.product.updated_at);

  if (priceChange.priceHistory.prime_only) {
    embed.addField('Prime Özel', 'Evet', true);
  }


  if (priceChange.product.image) {
    embed.setThumbnail(priceChange.product.image);
  }

  if (priceChange.product.seller) {
    embed.setFooter('Satıcı: ' + priceChange.product.seller);
  }

  return embed;
}

export default productPriceDropEmbed;
