import { MessageEmbed } from 'discord.js';
import { Product } from '../../entity/Product';

const productEmbed = (productDetail: Product): MessageEmbed => {
  const embed = new MessageEmbed()
    .setTitle(productDetail.name ?? '')
    .setURL(productDetail.getUrl())
    .addField('Güncel Fiyat', '' + productDetail.current_price, true)
    .addField('En Düşük Fiyat', '' + productDetail.lowest_price, true)
    .addField('Takibe Başlandığı Fiyat', '' + productDetail.price, true)
    .setFooter('Ülke: ' + productDetail.country)
    .setTimestamp(productDetail.updated_at);

  if (productDetail.image) {
    embed.setThumbnail(productDetail.image);
  }

  if (productDetail.seller) {
    embed.setAuthor(productDetail.seller);
  }

  return embed;
}

export default productEmbed;
