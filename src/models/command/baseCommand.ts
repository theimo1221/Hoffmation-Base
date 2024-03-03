import { CommandSource } from './commandSource';
import { CommandType } from './commandType';

export abstract class BaseCommand {
  public readonly timestamp: Date;
  abstract _commandType: CommandType;

  public constructor(
    public readonly source: CommandSource | BaseCommand = CommandSource.Unknown,
    private readonly _reason: string = '',
  ) {
    this.timestamp = new Date();
  }

  public get isUserAction(): boolean {
    if (this.source instanceof BaseCommand) {
      return this.source.isUserAction;
    }
    return (
      this.source === CommandSource.Manual || this.source === CommandSource.API || this.source === CommandSource.Force
    );
  }

  public get isInitial(): boolean {
    if (this.source instanceof BaseCommand) {
      return this.source.isInitial;
    }
    return this.source === CommandSource.Initial;
  }

  public get reasonTrace(): string {
    let reason: string = '';
    if (this.source instanceof BaseCommand) {
      reason = this.source.reasonTrace;
    }
    if (this._reason === '') {
      return `${reason} -> ${this._commandType}`;
    }
    return `${reason} -> ${this._commandType}(${this._reason})`;
  }
}