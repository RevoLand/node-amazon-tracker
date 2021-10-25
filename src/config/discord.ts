interface discordConfig {
  bot_token: string,
  client_id: string,
  guild_id: string
}

const config: discordConfig = {
  bot_token: process.env.DISCORD_BOT_TOKEN ?? '',
  client_id: process.env.DISCORD_CLIENT_ID ?? '',
  guild_id: process.env.DISCORD_GUILD_ID ?? '',
}

export default config;
