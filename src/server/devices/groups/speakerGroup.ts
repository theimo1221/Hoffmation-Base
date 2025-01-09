import { Utils } from '../../services/index.js';
import { BaseGroup } from './base-group.js';
import { DeviceClusterType } from '../device-cluster-type.js';
import { GroupType } from './group-type.js';
import { DeviceList } from '../device-list.js';
import { iSpeaker } from '../baseDeviceInterfaces/index.js';

export class SpeakerGroup extends BaseGroup {
  private _playing: boolean = false;

  public constructor(roomName: string, speakerIds: string[]) {
    super(roomName, GroupType.Speaker);
    this.deviceCluster.deviceMap.set(DeviceClusterType.Speaker, new DeviceList(speakerIds));
  }

  public getOwnSonosDevices(): iSpeaker[] {
    return this.deviceCluster.getDevicesByType(DeviceClusterType.Speaker) as iSpeaker[];
  }

  public playRadio(radioUrl: string): void {
    this.getOwnSonosDevices().forEach((s) => {
      Utils.guardedTimeout(() => {
        s.playUrl(radioUrl);
      }, 1500);
    });
    this._playing = true;
  }

  public turnOff(): void {
    this.getOwnSonosDevices().forEach((s) => {
      s.stop();
    });
    this._playing = false;
  }

  public trigger(track: string): void {
    if (this._playing) {
      this.turnOff();
      return;
    }

    this.playRadio(track);
  }
}
