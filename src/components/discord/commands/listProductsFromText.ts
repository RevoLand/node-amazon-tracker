import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { DiscordCommandInterface } from '../../../interfaces/DiscordCommandInterface';
import parseProductUrls from '../../product/productUrlHelper';


const listProductsFromTextCommand: DiscordCommandInterface = {
  data: new SlashCommandBuilder()
    .setName('listproductsfromtext')
    .setDescription('Parses the product url\'s from text and lists to the user.')
    .addStringOption(option => option.setName('message').setDescription('Message to parse product urls from').setRequired(true)),
  execute: async (interaction: CommandInteraction) => {
    const message = interaction.options.getString('message') ?? '';
    const productUrls = parseProductUrls(message);

    await interaction.reply({
      content: productUrls.join('\n'),
      ephemeral: true
    })
  }
}

export default listProductsFromTextCommand;
