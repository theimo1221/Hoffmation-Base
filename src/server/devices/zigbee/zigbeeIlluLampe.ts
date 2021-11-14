import { LogLevel } from 'index';
import { ServerLogService } from 'index';
import { DeviceInfo } from 'index';
import { DeviceType } from 'index';
import { ZigbeeIlluActuator } from 'index';

export class ZigbeeIlluLampe extends ZigbeeIlluActuator {
  public get lightOn(): boolean {
    return super.actuatorOn;
  }

  public constructor(pInfo: DeviceInfo) {
    super(pInfo, DeviceType.ZigbeeIlluLampe);
  }

  public update(idSplit: string[], state: ioBroker.State, initial: boolean = false): void {
    super.update(idSplit, state, initial, true);
    switch (idSplit[3]) {
      case 'state':
        ServerLogService.writeLog(LogLevel.Trace, `Lampen Update für ${this.info.customName} auf ${state.val}`);
        break;
    }
  }

  public setLight(pValue: boolean, timeout: number = -1, force: boolean = false): void {
    ServerLogService.writeLog(LogLevel.Debug, `Lampenaktor schalten: "${this.info.customName}" Wert: ${pValue}`);
    super.setActuator(pValue, timeout, force);
  }

  public toggleLight(force: boolean = false): boolean {
    return super.toggleActuator(force);
  }
}
