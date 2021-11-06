import { Client, Intents } from 'discord.js';
import { productTrackers } from '../app';
import { readDiscordCommands, registerDiscordCommands } from '../components/discord/discordCommands';
import discordReadyEvent from '../components/discord/events/discordReadyEvent';
import { ProductTracker } from '../components/product/ProductTracker';
import discordConfig from '../config/discord';
import { ProductController } from '../controller/ProductController';
import { SettingController } from '../controller/SettingController';
import productCreatedEmbed from './embeds/productCreatedEmbed';
import productUpdated from './embeds/productUpdatedEmbed';
import { parseProductUrls } from './productUrlHelper';

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

    // TODO:
    // Refactor with commands/track.ts
    client.on('messageCreate', async message => {
      if (message.author.bot || message.content.indexOf('!') !== 0) {
        return;
      }

      if (message.content.startsWith('!track ') || message.content.startsWith('!takip ')) {
        const productUrls = parseProductUrls(message.content);

        if (productUrls.length === 0) {
          await message.reply({
            content: 'Girilen mesaj takibe uygun ürün içermiyor 😢'
          });

          return;
        }

        await message.reply({
          content: `Aşağıdaki ürün(ler) takibe alınacak:\`\`\`${productUrls.join('\n')}\`\`\``
        });

        try {
          const productTracker = productTrackers.find(_productTracker => _productTracker.country === 'discord') ?? new ProductTracker('discord', await SettingController.getAll(), client);

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
            await message.channel.send({
              embeds: [productEmbed]
            })
          }
        } catch (error) {
          console.error('An error happened while executing the !track command function.', error);

          throw new Error('TrackCommandFailed');
        }
      }
    });

    await client.login(discordConfig.botToken);

  } catch (error) {
    console.error('An error happened while connecting to Discord.', error);

    throw new Error('DiscordConnectionFailed');
  }

  return client;
}
