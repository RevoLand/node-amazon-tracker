/* eslint-disable @typescript-eslint/naming-convention */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_HOST: string;
      DB_PORT: number;
      DB_NAME: string;
      DB_USER: string;
      DB_PASSWORD: string;
      DISCORD_BOT_TOKEN: string;
      DISCORD_CLIENT_ID: string;
      DISCORD_GUILD_ID: string;
      DISCORD_NOTIFY_CHANNEL_ID: string;
      DISCORD_BOTSPAM_CHANNEL_ID: string;
      DISCORD_CAPTCHA_CHANNEL_ID: string;
      DISCORD_CAPTCHA_NOTIFY_USER_ID: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
