import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { exit } from 'process';
import { ExitCodes } from '../../../helpers/enums';
import { DiscordCommandInterface } from '../../../interfaces/DiscordCommandInterface';
import { parseProductUrlsWithTlds } from '../../../helpers/productUrlHelper';
import { ProductController } from '../../../controller/ProductController';
import productTrackingStoppedEmbed from '../../../helpers/embeds/productTrackingStoppedEmbed';

const productCommand: DiscordCommandInterface = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Parses the product url\'s from text and stops the tracking.')
    .addStringOption(option => option.setName('products').setDescription('Message to parse product urls from').setRequired(true)),
  execute: async (interaction: CommandInteraction) => {
    const products = parseProductUrlsWithTlds(interaction.options.getString('products', true));

    if (products.length === 0) {
      await interaction.reply({
        content: 'Girilen mesaj takibe uygun ürün içermiyor 😢',
        ephemeral: true
      });

      return;
    }

    try {
      for (const parsedProductInfo of products) {
        const product = await ProductController.findByAsinAndLocale(parsedProductInfo.asin, parsedProductInfo.locale);
        if (!product) {
          // TODO: /product komutundan gelen url'lerde, ürün yoksa takip için eklenmeli mi?
          await interaction.reply({
            content: 'Ürün karşılığı bulunamadı.',
            ephemeral: true
          });
          continue;
        } else if (!interaction.replied && product.enabled) {
          await interaction.reply({
            content: 'Ürün bulundu, takipten çıkartılıyor...',
            ephemeral: true
          });
        }

        await interaction.channel?.send({
          embeds: [productTrackingStoppedEmbed(product)]
        })
      }
    } catch (error) {
      console.error('An error happened while executing the stop command function.', error);

      exit(ExitCodes.StopCommandFailed);
    }
  }
}

export default productCommand;
