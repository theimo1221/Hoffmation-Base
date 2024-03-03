import { BaseCommand } from './baseCommand';
import { CommandSource } from './commandSource';
import { CommandType } from './commandType';

export class ShutterSetLevelCommand extends BaseCommand {
  public override _commandType: CommandType = CommandType.ShutterSetLevelCommand;

  public constructor(
    source: CommandSource | BaseCommand,
    public readonly level: number,
    reason: string = '',
    public readonly skipOpenWarning: boolean = false,
  ) {
    super(source, reason);
  }

  public get logMessage(): string {
    return `Shutter setLevel to ${this.level} from ${this.source} for reason: ${this.reasonTrace}`;
  }
}