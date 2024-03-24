import { DeviceType } from '../deviceType';
import { LogLevel } from '../../../models';
import { ZigbeeMotionSensor } from './BaseDevices';
import { IoBrokerDeviceInfo } from '../IoBrokerDeviceInfo';

export class ZigbeeSonoffMotion extends ZigbeeMotionSensor {
  public constructor(pInfo: IoBrokerDeviceInfo) {
    super(pInfo, DeviceType.ZigbeeSonoffMotion);
    this._needsMovementResetFallback = false;
  }

  /** @inheritDoc */
  public update(idSplit: string[], state: ioBroker.State, initial: boolean = false): void {
    this.log(LogLevel.DeepTrace, `Motion update: ID: ${idSplit.join('.')} JSON: ${JSON.stringify(state)}`);
    super.update(idSplit, state, initial, true);
  }
}
