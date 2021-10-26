import { MessageEmbed } from 'discord.js';
import { ProductDetail } from '../../entity/ProductDetail';

const product = (productDetail: ProductDetail): MessageEmbed => {
  const productEmbed = new MessageEmbed()
    .setTitle(productDetail.name ?? '')
    .setURL(productDetail.getUrl())
    .addField('Güncel Fiyat', '' + productDetail.current_price, true)
    .addField('En Düşük Fiyat', '' + productDetail.lowest_price, true)
    .addField('Takibe Başlandığı Fiyat', '' + productDetail.price, true)
    .setFooter('Ülke: ' + productDetail.country)
    .setTimestamp(productDetail.updated_at);

  if (productDetail.image) {
    productEmbed.setThumbnail(productDetail.image);
  }

  if (productDetail.seller) {
    productEmbed.setAuthor(productDetail.seller);
  }

  return productEmbed;
}

export default product;
