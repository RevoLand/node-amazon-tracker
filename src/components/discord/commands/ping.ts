import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { DiscordCommandInterface } from '../../../interfaces/DiscordCommandInterface';


const pingCommand: DiscordCommandInterface = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  execute: async (interaction: CommandInteraction) => {
    await interaction.reply('Pong! deneme123');
  }
}

export default pingCommand;
