import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { productTrackerMain } from '../../../app';
import { DiscordCommandInterface } from '../../../interfaces/DiscordCommandInterface';

const captchaCommand: DiscordCommandInterface = {
  data: (new SlashCommandBuilder()
    .setName('captcha')
    .setDescription('Enters captcha text')
    .addStringOption(option => option.setName('captcha').setDescription('Captcha value').setRequired(true))),
  execute: async (interaction: CommandInteraction) => {
    productTrackerMain.updateCaptcha(interaction.options.getString('captcha', true).toUpperCase());

    await interaction.reply({
      content: 'Captcha girildi.',
      ephemeral: false
    });
  }
}

export default captchaCommand;
