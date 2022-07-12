import { AcDevice, ServerLogService } from '../../services';
import { BaseGroup } from './base-group';
import { DeviceClusterType } from '../device-cluster-type';
import { GroupType } from './group-type';
import { DeviceList } from '../device-list';
import { LogLevel } from '../../../models';
import * as util from 'util';

export class AcGroup extends BaseGroup {
  public constructor(roomName: string, acIds: string[]) {
    super(roomName, GroupType.Ac);
    this.deviceCluster.deviceMap.set(DeviceClusterType.Ac, new DeviceList(acIds));
  }

  public getOwnAcDevices(): AcDevice[] {
    return this.deviceCluster.getDevicesByType(DeviceClusterType.Ac) as AcDevice[];
  }

  /**
   * Sets all ACs to new desired Value
   * @param {boolean} newDesiredState
   * @param {boolean} force Whether this was a manual trigger, thus blocking automatic changes for 1 hour
   */
  public setAc(newDesiredState: boolean, force: boolean = false): void {
    const devs: AcDevice[] = this.getOwnAcDevices();
    this.log(LogLevel.Debug, `set ${devs.length} Ac's to new State: ${newDesiredState}`);
    for (const dev of devs) {
      if (newDesiredState) {
        try {
          dev.turnOn();
        } catch (e) {
          ServerLogService.writeLog(LogLevel.Error, `Crash on turn Device on`);
          util.inspect(dev);
        }
        continue;
      }
      if (force) {
        dev.deactivateAutomaticTurnOn(60 * 60 * 1000);
        continue;
      }
      dev.turnOff();
    }
  }
}