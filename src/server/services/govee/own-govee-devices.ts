import { ServerLogService } from '../log-service';
import { LogLevel } from '../../../models';
import { OwnGoveeDevice } from './own-govee-device';

export class OwnGoveeDevices {
  public static ownDevices: { [name: string]: OwnGoveeDevice } = {};

  public static addDevice(device: OwnGoveeDevice): void {
    ServerLogService.writeLog(LogLevel.Info, `Device ${device.name} for room "${device.info.room}" addded`);
    this.ownDevices[device.deviceId] = device;
  }
}
