import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { exit } from 'process';
import { ProductController } from '../../../controller/ProductController';
import { ExitCodes } from '../../../helpers/enum';
import { DiscordCommandInterface } from '../../../interfaces/DiscordCommandInterface';
import { parseAsinFromUrl, parseProductUrls } from '../../product/productUrlHelper';
import productEmbed from '../../../helpers/embeds/product';

const productCommand: DiscordCommandInterface = {
  data: new SlashCommandBuilder()
    .setName('product')
    .setDescription('Parses the product url\'s from text and lists to the user.')
    .addStringOption(option => option.setName('products').setDescription('Message to parse product urls from').setRequired(true)),
  execute: async (interaction: CommandInteraction) => {
    const products = interaction.options.getString('products', true);
    const productAsins = parseProductUrls(products).map(productUrl => parseAsinFromUrl(productUrl));

    if (productAsins.length === 0) {
      await interaction.reply('Girilen mesaj uygun ürün içermiyor 😢');

      return;
    }

    try {
      for (const productAsin of productAsins) {
        const product = await ProductController.findByAsin(productAsin);
        if (!product) {
          // TODO: /product komutundan gelen url'lerde, ürün yoksa takip için eklenmeli mi?
          await interaction.reply('Ürün karşılığı bulunamadı.');
          continue;
        } else if (!interaction.replied) {
          await interaction.reply('Ürün bulundu, sonuçlar getiriliyor...');
        }

        await interaction.channel?.send({
          embeds: product.productDetails.map(productDetail => productEmbed(productDetail))
        })
      }
    } catch (error) {
      console.error('An error happened related to trackCommand.', error);

      exit(ExitCodes.ProductCommandFailed);
    }
  }
}

export default productCommand;
