import { DeviceType } from '../deviceType.js';
import { LogLevel } from '../../../models/index.js';
import { IoBrokerDeviceInfo } from '../IoBrokerDeviceInfo.js';
import { ZigbeeShutter } from './BaseDevices/index.js';

export class ZigbeeUbisysShutter extends ZigbeeShutter {
  private readonly _positionStateId: string;

  public constructor(pInfo: IoBrokerDeviceInfo) {
    super(pInfo, DeviceType.ZigbeeUbisysShutter);
    this._positionStateId = `${this.info.fullID}.position`;
    // this.presenceStateID = `${this.info.fullID}.1.${HmIpPraezenz.PRESENCE_DETECTION}`;
  }

  /** @inheritDoc */
  public update(idSplit: string[], state: ioBroker.State, initial: boolean = false): void {
    switch (idSplit[3]) {
      case 'position':
        this.log(LogLevel.Trace, `Shutter Update for ${this.info.customName} to "${state.val}"`);
        this.setCurrentLevel(state.val as number, initial);
        break;
    }

    super.update(idSplit, state, initial, true);
  }

  protected override moveToPosition(pPosition: number): void {
    this.setState(this._positionStateId, pPosition);
  }
}
