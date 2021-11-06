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
    .addField('Bilinen En Düşük Fiyat', `${priceChange.product.lowestPrice}`, true)
    .addField('Önceki Fiyat', `${priceChange.priceHistory.oldPrice}`, true)
    .addField('Yeni Fiyat', `${priceChange.priceHistory.newPrice} (-${priceChange.priceDiff})`, true)
    .addField('En Düşük Fiyata Olan Fark', `${priceChange.lowestPriceDiff} (% ${priceChange.lowestPriceDiffPerc})`, true)
    .setAuthor(priceChange.product.country)
    .setTimestamp();

  if (priceChange.priceHistory.primeOnly) {
    embed.addField('Prime Özel', 'Evet', true);
  }


  if (priceChange.product.image) {
    embed.setThumbnail(priceChange.product.image);
  }

  if (priceChange.parsedProductData.seller) {
    embed.setFooter('Satıcı: ' + priceChange.parsedProductData.seller);
  }

  return embed;
}

export default productPriceDropEmbed;
