import { ZigbeeActuator } from './ZigbeeActuator';
import { iLamp, iTemporaryDisableAutomatic } from '../../../interfaces';
import { IoBrokerDeviceInfo } from '../../IoBrokerDeviceInfo';
import { DeviceCapability, DeviceType, LogLevel } from '../../../enums';
import { LampSetLightCommand, LampSetTimeBasedCommand, LampToggleLightCommand } from '../../../command';
import { LampUtils } from '../../sharedFunctions';

export abstract class ZigbeeLamp extends ZigbeeActuator implements iLamp, iTemporaryDisableAutomatic {
  public constructor(pInfo: IoBrokerDeviceInfo, deviceType: DeviceType) {
    super(pInfo, deviceType);
    this.deviceCapabilities.push(DeviceCapability.lamp);
  }

  /** @inheritDoc */
  public update(
    idSplit: string[],
    state: ioBroker.State,
    initial: boolean = false,
    handledByChildObject: boolean = false,
  ): void {
    if (!handledByChildObject) {
      this.log(LogLevel.DeepTrace, `Lamp Update: ID: ${idSplit.join('.')} JSON: ${JSON.stringify(state)}`);
    }
    this.queuedValue = null;
    this.log(LogLevel.DeepTrace, `Lamp Update: ID: ${idSplit.join('.')} JSON: ${JSON.stringify(state)}`);
    super.update(idSplit, state, initial, true);
  }

  /** @inheritDoc */
  public setTimeBased(c: LampSetTimeBasedCommand): void {
    LampUtils.setTimeBased(this, c);
  }

  /** @inheritdoc */
  public setLight(c: LampSetLightCommand): void {
    super.setActuator(c);
  }

  /** @inheritDoc */
  public toggleLight(c: LampToggleLightCommand): boolean {
    return LampUtils.toggleLight(this, c);
  }
}
