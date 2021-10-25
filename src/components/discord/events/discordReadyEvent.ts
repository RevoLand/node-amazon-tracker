import { Client } from 'discord.js';

const discordReadyEvent = (client: Client) => {
  // TODO: Start product tracking
  console.log('Discord is ready!');
}

export default discordReadyEvent;
