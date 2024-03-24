import { BaseCommand } from './baseCommand';
import { CommandSource } from './commandSource';
import { CommandType } from './commandType';

export class WindowSetRolloByWeatherStatusCommand extends BaseCommand {
  /** @inheritDoc */
  public override _commandType: CommandType = CommandType.WindowSetRolloByWeatherStatusCommand;

  /**
   * Command to set the desired position of the shutter of a window based on the weather status
   * @param source - The source of the command
   * @param reason - You can provide a reason for clarification
   */
  public constructor(source: CommandSource | BaseCommand, reason: string = '') {
    super(source, reason);
  }
}
