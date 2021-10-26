import { MessageEmbed } from 'discord.js';
import { Product } from '../../entity/Product';

const productUpdated = (productDetail: Product): MessageEmbed => {
  const productEmbed = new MessageEmbed()
    .setDescription('Ürün zaten takip ediliyor.')
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

export default productUpdated;
