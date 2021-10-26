import { MessageEmbed } from 'discord.js';
import { ProductDetail } from '../../entity/ProductDetail';

const productCreated = (productDetail: ProductDetail): MessageEmbed => {
  const productEmbed = new MessageEmbed()
    .setDescription('Ürün takibe alındı.')
    .setTitle(productDetail.name ?? '')
    .setURL(productDetail.getUrl())
    .addField('Güncel Fiyat', '' + productDetail.current_price)
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

export default productCreated;
