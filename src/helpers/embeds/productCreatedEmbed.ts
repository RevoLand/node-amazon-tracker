import { MessageEmbed } from 'discord.js';
import { Product } from '../../entity/Product';

const productCreatedEmbed = (product: Product): MessageEmbed => {
  const embed = new MessageEmbed()
    .setDescription('Ürün takibe alındı.')
    .setTitle(product.name ?? '')
    .setURL(product.getUrl())
    .setAuthor(product.country)
    .setTimestamp(product.updatedAt);

  if (product.currentPrice) {
    embed.addField('Güncel Fiyat', '' + product.currentPrice);
  }

  if (product.image) {
    embed.setThumbnail(product.image);
  }

  if (product.seller) {
    embed.setFooter('Satıcı: ' + product.seller);
  }

  return embed;
}

export default productCreatedEmbed;
