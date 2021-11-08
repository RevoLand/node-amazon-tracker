import { CacheType, Client, CommandInteraction, Intents, Message } from 'discord.js';
import { productTrackers } from '../app';
import { readDiscordCommands, registerDiscordCommands } from '../components/discord/discordCommands';
import discordReadyEvent from '../components/discord/events/discordReadyEvent';
import discordConfig from '../config/discord';
import { ProductController } from '../controller/ProductController';
import { ProductUrlInterface } from '../interfaces/ProductUrlInterface';
import productCreatedEmbed from './embeds/productCreatedEmbed';
import productTrackingStoppedEmbed from './embeds/productTrackingStoppedEmbed';
import productUpdated from './embeds/productUpdatedEmbed';
import { parseProductUrls, parseProductUrlsWithTlds } from './productUrlHelper';

export const trackProducts = async (productUrls: string[], interaction: CommandInteraction<CacheType> | Message<boolean>) => {
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

    const productTracker = productTrackers.find(_productTracker => _productTracker.country === 'discord');

    if (!productTracker) {
      console.error('discord productTracker bulunamadı?!');
      return;
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

export const stopTrackingProducts = async (products: ProductUrlInterface[], interaction: CommandInteraction<CacheType> | Message<boolean>) => {
  if (products.length === 0) {
    await interaction.reply({
      content: 'Girilen mesaj takibe uygun ürün içermiyor 😢',
      ephemeral: true
    });

    return;
  }

  await interaction.reply({
    content: 'Ürün bulundu, takipten çıkartılıyor...',
    ephemeral: true
  });

  try {
    for (const parsedProductInfo of products) {
      const product = await ProductController.byAsinAndLocale(parsedProductInfo.asin, parsedProductInfo.locale);
      if (!product) {
        // TODO: /product komutundan gelen url'lerde, ürün yoksa takip için eklenmeli mi?
        continue;
      }

      await ProductController.disableProductTracking(product);

      productTrackers.find(productTracker => productTracker.country === product.country)?.queue.removeProductFromQueue(product);

      await interaction.channel?.send({
        embeds: [productTrackingStoppedEmbed(product)]
      })
    }
  } catch (error) {
    console.error('An error happened while executing the stop command function.', error);

    throw new Error('StopCommandFailed');
  }
}

export const connectToDiscord = async (): Promise<Client> => {
  if (!discordConfig.botToken) {
    console.error('Discord bot token is not set.');

    throw new Error('DiscordBotTokenNotSet');
  }

  console.log('Preparing Discord connection.');

  const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
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

    client.on('messageCreate', async message => {
      if (message.author.bot || message.content.indexOf('!') !== 0) {
        return;
      }

      const args = message.content.slice(1).trim().split(/ +/g);
      const command = args.shift()?.toLowerCase();

      if (!command) {
        return;
      }

      switch (command) {
        case 'track':
        case 'takip':
        case 't':
          await trackProducts(parseProductUrls(message.content), message);
          return;
        case 'stop':
        case 'takipsil':
        case 'sil':
          await stopTrackingProducts(parseProductUrlsWithTlds(message.content), message);
          return;
      }
    });

    await client.login(discordConfig.botToken);
  } catch (error) {
    console.error('An error happened while connecting to Discord.', error);

    throw new Error('DiscordConnectionFailed');
  }

  return client;
}
