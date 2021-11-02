import { MessageEmbed } from 'discord.js';
import { PriceChangeInterface } from '../../interfaces/PriceChangeInterface';

const productPriceChangeEmbed = (priceChange: PriceChangeInterface): MessageEmbed => {
  const embed = new MessageEmbed()
    .setTitle(priceChange.product.name ?? '')
    .setURL(priceChange.product.getUrl())
    .addField('Takibe Başlandığı Fiyat', '' + priceChange.product.price, true)
    .addField('Bilinen En Düşük Fiyat', `${priceChange.product.lowest_price}`, true)
    .addField('Önceki Fiyat', `${priceChange.priceHistory.old_price}`, true)
    .addField('Yeni Fiyat', `${priceChange.priceHistory.new_price} (${priceChange.priceDiff})`, true)
    .addField('En Düşük Fiyata Olan Fark', `${priceChange.lowestPriceDiff} (% ${priceChange.lowestPriceDiffPerc})`, true)
    .setAuthor(priceChange.product.country)
    .setTimestamp();

  if (priceChange.priceHistory.prime_only) {
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

export default productPriceChangeEmbed;
