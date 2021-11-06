import Collection from '@discordjs/collection';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { readdirSync } from 'fs';
import discordConfig from '../../config/discord';
import { DiscordCommandInterface } from '../../interfaces/DiscordCommandInterface';
import { resolve } from 'path';

export const readDiscordCommands = async (): Promise<Collection<string, DiscordCommandInterface>> => {
  console.log('Reading available Discord commands.');

  const commands = new Collection<string, DiscordCommandInterface>();
  const commandFiles = readdirSync(resolve(__dirname, './commands')).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

  for (const file of commandFiles) {
    const command: DiscordCommandInterface = (await import(resolve(__dirname, `./commands/${file}`))).default;

    // Set a new item in the Collection
    // With the key as the command name and the value as the exported module
    commands.set(command.data.name, command);

    console.log(`Discord command found: /${command.data.name}`);
  }

  return commands;
}

export const registerDiscordCommands = async (commands: object[]) => {
  // TODO
  // Initialization mechanism as this function should only be called once a new command added or when an existing command is updated.
  const rest = new REST({ version: '9' }).setToken(discordConfig.botToken);

  console.log('Registering Discord Commands.')

  try {
    // TODO applicationGuildCommands yerine applicationCommands kullanılabilir.
    // https://discordjs.guide/interactions/registering-slash-commands.html#global-commands
    await rest.put(Routes.applicationGuildCommands(discordConfig.clientId, discordConfig.guildId), { body: commands });

  } catch (error) {
    console.error('An error happened while registering Discord commands.', error);

    throw new Error('RegisteringDiscordCommandsFailed');
  }

  console.log('Discord commands registered.');
}
