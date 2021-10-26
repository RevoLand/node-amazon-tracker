import { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export interface DiscordCommandInterface {
  data: Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'> | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder,
  execute: (interaction: CommandInteraction) => Promise<void>
}
