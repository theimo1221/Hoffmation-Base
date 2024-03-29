import { CommandType } from './commandType';
import { CommandSource } from './commandSource';
import { BaseCommand } from './baseCommand';
import { SettingsService } from '../../server';

export class BlockAutomaticLiftBlockCommand extends BaseCommand {
  /** @inheritDoc */
  public _commandType: CommandType = CommandType.BlockAutomaticLiftBlockCommand;
  /**
   * Whether the device should revert to desired automatic value.
   */
  public readonly revertToAutomatic: boolean;

  /**
   * Command to lift a block --> Restore the automatic actions.
   * @param source - The source of the command.
   * @param reason - You can provide an individual reason here for debugging purpose.
   * @param revertToAutomatic - Whether the device should revert to automatic afterward. --> Default: {@link SettingsService.settings.blockAutomaticHandlerDefaults.revertToAutomaticAtBlockLift}
   */
  public constructor(source: CommandSource | BaseCommand, reason: string = '', revertToAutomatic?: boolean) {
    super(source, reason);
    this.revertToAutomatic =
      revertToAutomatic ??
      SettingsService.settings?.blockAutomaticHandlerDefaults?.revertToAutomaticAtBlockLift ??
      true;
  }
}
