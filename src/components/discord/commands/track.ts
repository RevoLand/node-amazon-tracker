import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { exit } from 'process';
import { ProductController } from '../../../controller/ProductController';
import productCreated from '../../../helpers/embeds/productCreated';
import productUpdated from '../../../helpers/embeds/productUpdated';
import { ExitCodes } from '../../../helpers/enum';
import { DiscordCommandInterface } from '../../../interfaces/DiscordCommandInterface';
import { parseProductUrls } from '../../product/productUrlHelper';

const trackCommand: DiscordCommandInterface = {
  data: new SlashCommandBuilder()
    .setName('track')
    .setDescription('Parses the product url\'s from text and lists to the user.')
    .addStringOption(option => option.setName('products').setDescription('Message to parse product urls from').setRequired(true)),
  execute: async (interaction: CommandInteraction) => {
    const products = interaction.options.getString('products', true);
    const productUrls = parseProductUrls(products);

    if (productUrls.length === 0) {
      await interaction.reply('Girilen mesaj takibe uygun ürün içermiyor 😢');

      return;
    }

    try {
      await interaction.reply({
        content: `Aşağıdaki ürün(ler) takibe alınacak:\`\`\`${productUrls.join('\n')}\`\`\``,
        ephemeral: true
      });

      for (const productUrl of productUrls) {
        const createProductResult = await ProductController.createProductFromUrl(productUrl);
        if (!createProductResult) {
          console.error('No product detail returned for product url, skipping.', productUrl);
          continue;
        }

        const productEmbed = createProductResult.existing_product_detail ? productUpdated(createProductResult.productDetail) : productCreated(createProductResult.productDetail);
        await interaction.channel?.send({
          embeds: [productEmbed]
        })
      }
    } catch (error) {
      console.error('An error happened related to trackCommand.', error);

      exit(ExitCodes.TrackCommandFailed);
    }
  }
}

export default trackCommand;
