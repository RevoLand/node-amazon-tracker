import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { ProductController } from '../../../controller/ProductController';
import { DiscordCommandInterface } from '../../../interfaces/DiscordCommandInterface';
import { parseProductUrlsWithTlds } from '../../../helpers/productUrlHelper';
import productEmbed from '../../../helpers/embeds/productEmbed';

const productCommand: DiscordCommandInterface = {
  data: (new SlashCommandBuilder()
    .setName('product')
    .setDescription('Product related commands')
    .addSubcommand(subCommand => subCommand.setName('get')
      .setDescription('Gets current status of product')
      .addStringOption(option => option.setName('product').setDescription('Message to parse product url from').setRequired(true)))
    .addSubcommand(subCommand => subCommand.setName('set')
      .setDescription('Sets product information')
      .addStringOption(option => option.setName('product').setDescription('Message to parse product url from').setRequired(true))
      .addStringOption(option => option.setName('info').setDescription('The product information to change').setRequired(true)
        .addChoice('Dip Fiyat', 'lowest_price')
        .addChoice('Takibe Başlandığı Fiyat', 'price')
        .addChoice('Güncel Fiyat', 'current_price'))
      .addStringOption(option => option.setName('value').setDescription('The value to set').setRequired(true)))
  ),
  execute: async (interaction: CommandInteraction) => {
    const products = parseProductUrlsWithTlds(interaction.options.getString('product', true));

    if (products.length === 0) {
      await interaction.reply({
        content: 'Girilen mesaj takibe uygun ürün içermiyor 😢',
        ephemeral: true
      });

      return;
    }

    try {
      const product = await ProductController.byAsinAndLocale(products[0].asin, products[0].locale);
      if (!product) {
        // TODO: /product komutundan gelen url'lerde, ürün yoksa takip için eklenmeli mi?
        await interaction.reply({
          content: 'Ürün karşılığı bulunamadı.',
          ephemeral: true
        });
        return;
      }

      const subCommand = interaction.options.getSubcommand();

      if (subCommand === 'get') {
        await interaction.reply({
          embeds: [productEmbed(product)],
          ephemeral: true
        });

        return;
      }

      const info = interaction.options.getString('info', true);
      const value = interaction.options.getString('value', true);

      switch (info) {
        case 'lowest_price':
          product.lowestPrice = +value;
          break;
        case 'price':
          product.price = +value;
          break;
        case 'current_price':
          product.currentPrice = +value;
          break;
      }

      await product.save();
      await interaction.reply({
        embeds: [productEmbed(product)],
        ephemeral: true
      });
    } catch (error) {
      console.error('An error happened while executing the product command function', error);

      throw new Error('ProductCommandFailed');
    }
  }
}

export default productCommand;
