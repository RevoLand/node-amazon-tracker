import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { ProductController } from '../../../controller/ProductController';
import productCreatedEmbed from '../../../helpers/embeds/productCreatedEmbed';
import productUpdated from '../../../helpers/embeds/productUpdatedEmbed';
import { DiscordCommandInterface } from '../../../interfaces/DiscordCommandInterface';
import { parseProductUrls } from '../../../helpers/productUrlHelper';
import { productTrackers } from '../../../app';
import { ProductTracker } from '../../product/ProductTracker';
import { SettingController } from '../../../controller/SettingController';

const trackCommand: DiscordCommandInterface = {
  data: new SlashCommandBuilder()
    .setName('track')
    .setDescription('Parses the product url\'s from text and lists to the user.')
    .addStringOption(option => option.setName('products').setDescription('Message to parse product urls from').setRequired(true)),
  execute: async (interaction: CommandInteraction) => {
    const productUrls = parseProductUrls(interaction.options.getString('products', true));

    if (productUrls.length === 0) {
      await interaction.reply({
        content: 'Girilen mesaj takibe uygun ürün içermiyor 😢',
        ephemeral: true
      });

      return;
    }

    try {
      await interaction.reply({
        content: `Aşağıdaki ürün(ler) takibe alınacak:\`\`\`${productUrls.join('\n')}\`\`\``,
        ephemeral: true
      });

      const productTracker = productTrackers.find(_productTracker => _productTracker.country === 'discord') ?? new ProductTracker('discord', await SettingController.getAll(), interaction.client);

      if (!productTracker.browser) {
        await productTracker.setBrowser();
      }

      for (const productUrl of productUrls) {
        const createProductResult = await ProductController.createProductFromUrl(productUrl, productTracker);
        if (!createProductResult) {
          console.error('No product detail returned for product url, skipping.', productUrl);
          continue;
        }

        const productEmbed = createProductResult.existingProduct ?
          productUpdated(createProductResult.productDetail) :
          productCreatedEmbed(createProductResult.productDetail);
        await interaction.channel?.send({
          embeds: [productEmbed]
        })
      }
    } catch (error) {
      console.error('An error happened while executing the track command function.', error);

      throw new Error('TrackCommandFailed');
    }
  }
}

export default trackCommand;
