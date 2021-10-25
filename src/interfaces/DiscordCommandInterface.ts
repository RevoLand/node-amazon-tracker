import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export interface DiscordCommandInterface {
  data: SlashCommandBuilder,
  execute: (interaction: CommandInteraction) => Promise<void>
}
