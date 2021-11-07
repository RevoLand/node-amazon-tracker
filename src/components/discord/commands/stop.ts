import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { DiscordCommandInterface } from '../../../interfaces/DiscordCommandInterface';
import { parseProductUrlsWithTlds } from '../../../helpers/productUrlHelper';
import { stopTrackingProducts } from '../../../helpers/discord';

const productCommand: DiscordCommandInterface = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Parses the product url\'s from text and stops the tracking.')
    .addStringOption(option => option.setName('products').setDescription('Message to parse product urls from').setRequired(true)),
  execute: async (interaction: CommandInteraction) => {
    const products = parseProductUrlsWithTlds(interaction.options.getString('products', true));

    stopTrackingProducts(products, interaction);
  }
}

export default productCommand;
