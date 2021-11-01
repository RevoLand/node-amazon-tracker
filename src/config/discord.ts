interface DiscordConfigInterface {
  botToken: string,
  clientId: string,
  guildId: string,
  notifyChannelId: string,
  botSpamChannelId: string
}

const discordConfig: DiscordConfigInterface = {
  botToken: process.env.DISCORD_BOT_TOKEN ?? '',
  clientId: process.env.DISCORD_CLIENT_ID ?? '',
  guildId: process.env.DISCORD_GUILD_ID ?? '',
  notifyChannelId: process.env.DISCORD_NOTIFY_CHANNEL_ID ?? '',
  botSpamChannelId: process.env.DISCORD_BOTSPAM_CHANNEL_ID ?? '',
}

export default discordConfig;
