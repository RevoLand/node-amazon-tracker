
import { Client, Intents } from 'discord.js';
import { exit } from 'process';
import { readDiscordCommands, registerDiscordCommands } from '../components/discord/discordCommands';
import discordReadyEvent from '../components/discord/events/discordReadyEvent';
import discordConfig from '../config/discord';
import { ExitCodes } from './enums';

export const connectToDiscord = async (): Promise<Client> => {
  if (!discordConfig.bot_token) {
    console.error('Discord bot token is not set.');

    exit(ExitCodes.DiscordBotTokenNotSet);
  }

  console.log('Preparing Discord connection.');

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
