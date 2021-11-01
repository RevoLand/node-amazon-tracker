export enum ExitCodesEnum {
  Success = 0,
  SQLConfigNotSet = 1,
  SQLConnectionFailed = 2,
  DiscordBotTokenNotSet = 3,
  DiscordConnectionFailed = 4,
  RegisteringDiscordCommandsFailed = 5,
  TrackCommandFailed = 6,
  ProductCommandFailed = 7,
  StopCommandFailed = 8,
  CouldntInsertDefaultSettings = 9,
  SettingsCommandFailed = 10,
}