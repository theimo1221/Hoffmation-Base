import { LogLevel } from '../../models';

export interface iTelegramSettings {
  /**
   * The threshold for the log level to trigger a message to telegram
   */
  logLevel: LogLevel;
  /**
   * The token for the telegram bot
   */
  telegramToken: string;
  /**
   * The allowed IDs for clients interacting with the bot
   */
  allowedIDs: number[];
  /**
   * The IDs that are subscribed to updates from us (e.g. for notifications)
   */
  subscribedIDs: number[];
}
