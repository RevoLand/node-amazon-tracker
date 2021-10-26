import { MessageEmbed } from 'discord.js';
import { Product } from '../../entity/Product';

const productTrackingStoppedEmbed = (product: Product): MessageEmbed => {
  const productEmbed = new MessageEmbed()
    .setDescription('Ürünün takibi bırakıldı.')
    .setTitle(product.name ?? '')
    .setURL(product.getUrl())
    .addField('Güncel Fiyat', '' + product.current_price, true)
    .addField('En Düşük Fiyat', '' + product.lowest_price, true)
    .addField('Takibe Başlandığı Fiyat', '' + product.price, true)
    .setFooter('Ülke: ' + product.country)
    .setTimestamp(product.updated_at);

  if (product.image) {
    productEmbed.setThumbnail(product.image);
  }

  if (product.seller) {
    productEmbed.setAuthor(product.seller);
  }


  return productEmbed;
}

export default productTrackingStoppedEmbed;
