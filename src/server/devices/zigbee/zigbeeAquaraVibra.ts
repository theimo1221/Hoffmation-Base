import { DeviceType } from '../deviceType';
import { Utils } from '../../services/utils/utils';
import { DeviceInfo } from '../DeviceInfo';
import { PollyService } from '../../services/Sonos/polly-service';
import { ZigbeeDevice } from './zigbeeDevice';
import { LogLevel } from '../../../models/logLevel';
import { SonosService } from '../../services/Sonos/sonos-service';
import { Res } from '../../services/Translation/res';

export class ZigbeeAquaraVibra extends ZigbeeDevice {
  public sensitivity: string = '';
  public tiltAngle: number = 0;
  public tiltAngleX: number = 0;
  public tiltAngleXAbs: number = 0;
  public tiltAngleY: number = 0;
  public tiltAngleYAbs: number = 0;
  public tiltAngleZ: number = 0;
  public tilt: boolean = false;
  public vibration: boolean = false;
  public vibrationBlockedTimeStamp: number = 0;
  private _idSensitivity: string = '';
  private _vibrationBlocked: boolean = false;
  private _alarmMessage: string;
  // TODO Set Sensitivity

  public constructor(pInfo: DeviceInfo) {
    super(pInfo, DeviceType.ZigbeeAquaraVibra);
    this._alarmMessage = Res.vibrationAlarm(this.info.customName);
    PollyService.preloadTTS(this._alarmMessage);
    this._idSensitivity = `${this.info.fullID}.sensitivity`;
  }

  public set vibrationBlocked(pVal: boolean) {
    this.log(LogLevel.Debug, `${pVal ? 'Dea' : 'A'}ktiviere Vibrationsalarm für ${this.info.customName}`);
    if (pVal) {
      this.vibrationBlockedTimeStamp = new Date().getTime();
    }
    this._vibrationBlocked = pVal;
  }

  public update(idSplit: string[], state: ioBroker.State, initial: boolean = false): void {
    this.log(LogLevel.DeepTrace, `Stecker Update: ID: ${idSplit.join('.')} JSON: ${JSON.stringify(state)}`);
    super.update(idSplit, state, initial, true);
    switch (idSplit[3]) {
      case 'sensitivity':
        this.log(LogLevel.Trace, `Vibrationssensor Update für ${this.info.customName} auf Sensitivity: ${state.val}`);
        this.tiltAngleZ = state.val as number;
        break;
      case 'tilt_angle_z':
        this.log(LogLevel.Trace, `Vibrationssensor Update für ${this.info.customName} auf Winkel Z: ${state.val}`);
        this.tiltAngleZ = state.val as number;
        break;
      case 'tilt_angle_y':
        this.log(LogLevel.Trace, `Vibrationssensor Update für ${this.info.customName} auf Winkel Y: ${state.val}`);
        this.tiltAngleY = state.val as number;
        break;
      case 'tilt_angle_x':
        this.log(LogLevel.Trace, `Vibrationssensor Update für ${this.info.customName} auf Winkel X: ${state.val}`);
        this.tiltAngleX = state.val as number;
        break;
      case 'vibration':
        this.log(
          LogLevel.Trace,
          `Vibrationssensor Update für ${this.info.customName} auf Vibration erkannt: ${state.val}`,
        );
        this.vibration = state.val as boolean;
        if (this.vibration) {
          Utils.guardedTimeout(
            () => {
              this.alarmCheck();
            },
            8500,
            this,
          );
        }
        break;
      case 'tilt_angle_y_abs':
        this.log(
          LogLevel.Trace,
          `Vibrationssensor Update für ${this.info.customName} auf absoluten Winkel Y: ${state.val}`,
        );
        this.tiltAngleYAbs = state.val as number;
        break;
      case 'tilt_angle_X_abs':
        this.log(
          LogLevel.Trace,
          `Vibrationssensor Update für ${this.info.customName} auf absoluten Winkel X: ${state.val}`,
        );
        this.tiltAngleXAbs = state.val as number;
        break;
      case 'tilt_angle':
        this.log(LogLevel.Trace, `Vibrationssensor Update für ${this.info.customName} auf Winkel: ${state.val}`);
        this.tiltAngle = state.val as number;
        break;
      case 'tilt':
        this.log(LogLevel.Trace, `Vibrationssensor Update für ${this.info.customName} auf Winkel: ${state.val}`);
        this.tilt = state.val as boolean;
        break;
    }
  }

  public setSensitivity(pVal: number): void {
    let result = 'high';
    switch (pVal) {
      case 0:
        result = 'low';
        break;
      case 1:
        result = 'medium';
        break;
    }
    if (this._idSensitivity === '') {
      this.log(LogLevel.Error, `Keine Switch ID bekannt.`);
      return;
    }

    this.log(LogLevel.Debug, `Vibration Sensitivität schalten Wert: ${result}`);
    this.setState(this._idSensitivity, result, undefined, (err) => {
      console.log(`Stecker schalten ergab Fehler: ${err}`);
    });
  }

  private alarmCheck(): void {
    this.log(LogLevel.Debug, `Alarmcheck für ${this.info.customName} Alarmblock Wert: ${this._vibrationBlocked}`);
    if (this._vibrationBlocked) {
      this.log(LogLevel.Debug, `Fenster offen, ignoriere Vibrationsalarm bei ${this.info.customName}`);
      return;
    }

    const message = this._alarmMessage;
    SonosService.speakOnAll(message);
    this.log(LogLevel.Alert, message);
  }
}
