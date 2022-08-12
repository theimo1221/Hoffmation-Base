import { DeviceInfo, DeviceType, IBaseDevice, iExcessEnergyConsumer } from '../../devices';
import { ExcessEnergyConsumerSettings, LogLevel, RoomBase } from '../../../models';
import { Utils } from '../utils';
import { LogDebugType, ServerLogService } from '../log-service';
import { AcMode } from './ac-mode';
import { AcSettings } from '../../../models/deviceSettings/acSettings';
import { AcDeviceType } from './acDeviceType';

export abstract class AcDevice implements iExcessEnergyConsumer, IBaseDevice {
  public currentConsumption: number = -1;
  public energyConsumerSettings: ExcessEnergyConsumerSettings = new ExcessEnergyConsumerSettings();
  public acSettings: AcSettings = new AcSettings();
  public room: RoomBase | undefined;

  protected constructor(name: string, roomName: string, public ip: string, public acDeviceType: AcDeviceType) {
    this._info = new DeviceInfo();
    this._info.fullName = `AC ${name}`;
    this._info.customName = name;
    this._info.room = roomName;
    this._info.allDevicesKey = `ac-${roomName}-${name}`;
    Utils.guardedInterval(this.automaticCheck, 60000, this, true);
  }

  protected _info: DeviceInfo;

  public get info(): DeviceInfo {
    return this._info;
  }

  public set info(info: DeviceInfo) {
    this._info = info;
  }

  public abstract get deviceType(): DeviceType;

  public get name(): string {
    return this.info.customName;
  }

  protected _activatedByExcessEnergy: boolean = false;
  protected _blockAutomaticTurnOnMS: number = -1;

  public get id(): string {
    return this.info.allDevicesKey ?? `ac-${this.info.room}-${this.info.customName}`;
  }

  public abstract get on(): boolean;

  public isAvailableForExcessEnergy(): boolean {
    if (Utils.nowMS() < this._blockAutomaticTurnOnMS) {
      return false;
    }
    const minimumStart: Date = Utils.dateByTimeSpan(this.acSettings.minimumHours, this.acSettings.minimumMinutes);
    const maximumEnd: Date = Utils.dateByTimeSpan(this.acSettings.maximumHours, this.acSettings.maximumMinutes);
    const now: Date = new Date();
    if (now < minimumStart || now > maximumEnd) {
      return false;
    }
    return this.calculateDesiredMode() !== AcMode.Off;
  }

  public calculateDesiredMode(): AcMode {
    const temp: number | undefined = this.room?.HeatGroup?.temperature;
    if (temp === undefined) {
      this.log(LogLevel.Warn, `Can't calculate AC Mode as we have no room temperature`);
      return AcMode.Off;
    }

    if (temp > this.acSettings.stopCoolingTemperatur) {
      return AcMode.Cooling;
    }
    if (temp < this.acSettings.stopHeatingTemperatur && this.acSettings.heatingAllowed) {
      return AcMode.Heating;
    }
    return AcMode.Off;
  }

  /**
   * Disable automatic Turn-On for given amount of ms and turn off immediately.
   * @param {number} timeout
   */
  public deactivateAutomaticTurnOn(timeout: number = 60 * 60 * 1000): void {
    this._blockAutomaticTurnOnMS = Utils.nowMS() + timeout;
    this.turnOff();
  }

  public abstract setDesiredMode(mode: AcMode, writeToDevice: boolean): void;

  public abstract turnOn(): void;

  public turnOnForExcessEnergy(): void {
    if (this._blockAutomaticTurnOnMS > Utils.nowMS()) {
      return;
    }
    this._activatedByExcessEnergy = true;
    this.setDesiredMode(this.calculateDesiredMode(), false);
    this.turnOn();
  }

  public abstract turnOff(): void;

  public turnOffDueToMissingEnergy(): void {
    this.turnOff();
  }

  public log(level: LogLevel, message: string, debugType: LogDebugType = LogDebugType.None): void {
    ServerLogService.writeLog(level, `${this.name}: ${message}`, {
      debugType: debugType,
      room: this.room?.roomName ?? '',
      deviceId: this.name,
      deviceName: this.name,
    });
  }

  public wasActivatedByExcessEnergy(): boolean {
    return this._activatedByExcessEnergy;
  }

  private automaticCheck(): void {
    if (!this.on) {
      return;
    }
    const desiredMode: AcMode = this.calculateDesiredMode();
    const maximumEnd: Date = Utils.dateByTimeSpan(this.acSettings.maximumHours, this.acSettings.maximumMinutes);
    const now: Date = new Date();
    if (now > maximumEnd || (this._activatedByExcessEnergy && desiredMode == AcMode.Off)) {
      this.turnOff();
      return;
    }
  }

  public toJSON(): Partial<AcDevice> {
    return Utils.jsonFilter(this);
  }
}
