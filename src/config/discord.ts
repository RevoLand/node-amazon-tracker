const discordConfig = {
  botToken: process.env.DISCORD_BOT_TOKEN ?? '',
  clientId: process.env.DISCORD_CLIENT_ID ?? '',
  guildId: process.env.DISCORD_GUILD_ID ?? '',
  notifyChannelId: process.env.DISCORD_NOTIFY_CHANNEL_ID ?? '',
  botSpamChannelId: process.env.DISCORD_BOTSPAM_CHANNEL_ID ?? '',
  captchaChannelId: process.env.DISCORD_CAPTCHA_CHANNEL_ID ?? '',
  captchaNotifyUserId: process.env.DISCORD_CAPTCHA_NOTIFY_USER_ID ?? '',
}

export default discordConfig;
