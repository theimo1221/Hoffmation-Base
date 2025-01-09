import { ServerLogService } from '../../../server/index.js';
import { LogLevel } from '../../logLevel.js';
import { RoomBase } from '../RoomBase.js';

export class RoomAddDeviceItem {
  constructor(
    public setID: (value: string) => RoomBase | undefined,
    public index: number,
    public customName: string,
  ) {}

  private _added: boolean = false;

  public get added(): boolean {
    return this._added;
  }

  public set added(value: boolean) {
    if (this._added) {
      ServerLogService.writeLog(LogLevel.Error, `${this.customName} Added twice`);
    }
    this._added = value;
  }
}
