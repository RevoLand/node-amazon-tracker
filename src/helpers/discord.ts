
import { Client, Intents, MessageEmbed } from 'discord.js';
import { exit } from 'process';
import { readDiscordCommands, registerDiscordCommands } from '../components/discord/discordCommands';
import discordReadyEvent from '../components/discord/events/discordReadyEvent';
import discordConfig from '../config/discord';
import { Product } from '../entity/Product';
import { ProductDetail } from '../entity/ProductDetail';
import { CreateProductFromUrlResultInterface } from '../interfaces/CreateProductFromUrlResultInterface';
import { ExitCodes } from './enum';

export const connectToDiscord = async (): Promise<Client> => {
  if (!discordConfig.bot_token) {
    console.error('Discord bot token is not set.');

    exit(ExitCodes.DiscordBotTokenNotSet);
  }

  const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
  const commands = await readDiscordCommands();

  // Register commands
  await registerDiscordCommands(commands.map(command => command.data.toJSON()));

  try {
    client.once('ready', () => discordReadyEvent(client));

    client.on('interactionCreate', async interaction => {
      if (!interaction.isCommand()) {
        return;
      }

      const command = commands.get(interaction.commandName);

      if (!command) {
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    });

    await client.login(discordConfig.bot_token);

  } catch (error) {
    console.error('An error happened while connecting to Discord.', error);

    exit(ExitCodes.DiscordConnectionFailed);
  }

  return client;
}

// TODO: refactor
export const generateProductEmbedFromTrackResult = (trackResult: CreateProductFromUrlResultInterface): MessageEmbed => {
  const productEmbed = new MessageEmbed()
    .setDescription(trackResult.existing_product_detail ? 'Ürün zaten takip ediliyor!' : 'Ürün takibe alındı.')
    .setTitle(trackResult.productDetail.name ?? '')
    .setURL(trackResult.productDetail.getUrl())
    .addField('Güncel Fiyat', '' + trackResult.productDetail.current_price)
    .setFooter('Ülke: ' + trackResult.productDetail.country)
    .setTimestamp();

  if (trackResult.productDetail.image) {
    productEmbed.setThumbnail(trackResult.productDetail.image);
  }

  if (trackResult.productDetail.seller) {
    productEmbed.setAuthor(trackResult.productDetail.seller);
  }


  return productEmbed;
}

export const generateProductEmbedFromDetail = (productDetail: ProductDetail): MessageEmbed => {
  const productEmbed = new MessageEmbed()
    .setTitle(productDetail.name ?? '')
    .setURL(productDetail.getUrl())
    .addField('Güncel Fiyat', '' + productDetail.current_price)
    .setFooter('Ülke: ' + productDetail.country)
    .setTimestamp();

  if (productDetail.image) {
    productEmbed.setThumbnail(productDetail.image);
  }

  if (productDetail.seller) {
    productEmbed.setAuthor(productDetail.seller);
  }


  return productEmbed;
}

export const generateProductEmbed = (product: Product): MessageEmbed => {
  const productEmbed = new MessageEmbed().setTitle(product.asin).setTimestamp();

  for (const productDetail of product.productDetails) {
    productEmbed.addField(productDetail.country, '' + productDetail.current_price, true);
  }

  return productEmbed;
}
