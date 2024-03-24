import { ShellyDevice } from './shellyDevice';
import { iHeater, UNDEFINED_TEMP_VALUE } from '../baseDeviceInterfaces';
import { TimeCallbackService, Utils } from '../../services';
import { HeaterSettings, LogLevel, TimeCallback, TimeCallbackType } from '../../../models';
import { PIDController } from '../../../liquid-pid';
import { IoBrokerDeviceInfo } from '../IoBrokerDeviceInfo';
import { DeviceType } from '../deviceType';
import { DeviceCapability } from '../DeviceCapability';
import { HeatGroupSettings } from '../../../models/groupSettings/heatGroupSettings';
import { HeatGroup } from '../groups';

export class ShellyTrv extends ShellyDevice implements iHeater {
  /** @inheritDoc */
  public settings: HeaterSettings = new HeaterSettings();

  public get lastBatteryPersist(): number {
    return this._lastBatteryPersist;
  }

  /** @inheritDoc */
  public readonly persistHeaterInterval: NodeJS.Timeout = Utils.guardedInterval(
    () => {
      this.persistHeater();
    },
    5 * 60 * 1000,
    this,
    false,
  );

  public get battery(): number {
    return this._battery;
  }

  public get minimumLevel(): number {
    return this._minimumValveLevel;
  }

  private _automaticMode: boolean = false;
  private _battery: number = -99;
  private _iAutomaticInterval: NodeJS.Timeout | undefined;
  private _initialSeasonCheckDone: boolean = false;
  private _lastRecalc: number = 0;
  private _level: number = 0;
  private _minimumValveLevel: number = 0;
  private _recalcTimeout: NodeJS.Timeout | null = null;
  private _temperatur: number = UNDEFINED_TEMP_VALUE;
  private _targetTempVal: number = UNDEFINED_TEMP_VALUE;
  private _desiredTemperatur: number = UNDEFINED_TEMP_VALUE;
  private _useExternalTemperatureEnabled: boolean = false;
  private _pidController: PIDController = new PIDController({
    temp: {
      ref: 20, // Point temperature
    },
    Pmax: 100, // Max power (output),

    // Tune the PID Controller
    Kp: 25, // PID: Kp in 1/1000
    Ki: 1000, // PID: Ki in 1/1000
    Kd: 9, // PID: Kd in 1/1000
  });
  private _lastBatteryPersist: number = 0;
  private readonly _minumumLevelId: string;
  private readonly _setAutomaticModeId: string;
  private readonly _setExternalTempId: string;
  private readonly _setEnableExternalTempId: string;
  private readonly _setPointTemperaturID: string;
  private readonly _valvePosId: string;

  public constructor(pInfo: IoBrokerDeviceInfo) {
    super(pInfo, DeviceType.ShellyTrv);
    this.deviceCapabilities.push(DeviceCapability.heater);
    this.deviceCapabilities.push(DeviceCapability.batteryDriven);
    this._setAutomaticModeId = `${this.info.fullID}.tmp.automaticTemperatureControl`;
    this._setExternalTempId = `${this.info.fullID}.ext.temperature`;
    this._setEnableExternalTempId = `${this.info.fullID}.ext.enabled`;
    this._setPointTemperaturID = `${this.info.fullID}.tmp.temperatureTargetC`;
    this._minumumLevelId = `${this.info.fullID}.tmp.minimumValvePosition`;
    this._valvePosId = `${this.info.fullID}.tmp.valvePosition`;
    this._iAutomaticInterval = Utils.guardedInterval(this.checkAutomaticChange, 300000, this); // Alle 5 Minuten prüfen
    TimeCallbackService.addCallback(
      new TimeCallback(
        `${this.info.fullID} Season Check`,
        TimeCallbackType.TimeOfDay,
        () => {
          this.checkSeasonTurnOff();
        },
        0,
        2,
        0,
      ),
    );
  }

  protected _seasonTurnOff: boolean = false;

  public get seasonTurnOff(): boolean {
    return this._seasonTurnOff;
  }

  public set seasonTurnOff(value: boolean) {
    this._seasonTurnOff = value;
    if (value) {
      this.setMode(false);
      this.setValve(0);
      return;
    }
    this.setMode(!this.settings.controlByPid);
  }

  public get desiredTemperature(): number {
    return this._desiredTemperatur;
  }

  public set desiredTemperature(val: number) {
    this._desiredTemperatur = val;
    if (this._targetTempVal === val) {
      return;
    }
    this.setState(
      this._setPointTemperaturID,
      val,
      () => {
        this.log(LogLevel.Info, `Changed temperature of to "${val}.`);
      },
      (err: Error) => {
        this.log(LogLevel.Error, `Temperaturänderung ergab Fehler ${err}.`);
      },
    );
  }

  protected _humidity: number = 0;

  public get humidity(): number {
    return this._humidity;
  }

  public get sLevel(): string {
    return `${this._level * 100}%`;
  }

  public get iLevel(): number {
    return this._level;
  }

  public get sTemperatur(): string {
    return `${this.iTemperature}°C`;
  }

  public get iTemperature(): number {
    if (this.settings.useOwnTemperatur) {
      return this._temperatur;
    } else {
      return this._roomTemperature;
    }
  }

  protected _roomTemperature: number = UNDEFINED_TEMP_VALUE;

  public get roomTemperature(): number {
    return this._roomTemperature;
  }

  public set roomTemperatur(val: number) {
    this._roomTemperature = val;
    if (this.settings.useOwnTemperatur) {
      return;
    }
    this.setExternalTemperature(val);
    if (this.settings.controlByPid) {
      this.recalcLevel();
    }
  }

  public checkAutomaticChange(): void {
    if (!this._initialSeasonCheckDone) {
      this.checkSeasonTurnOff();
    }

    if (this.seasonTurnOff || this.settings.manualDisabled) {
      this.setValve(0);
      this.setMode(false);
      return;
    }

    if (this.settings.pidForcedMinimum !== this.minimumLevel) {
      this.setMinimumLevel(this.settings.pidForcedMinimum);
    }

    if (!this.settings.useOwnTemperatur && !this.settings.controlByPid) {
      this.setExternalTemperatureEnabled(true);
    }

    const heatGroup: HeatGroup | undefined = this.room.HeatGroup;
    if (heatGroup === undefined) {
      this.log(LogLevel.Warn, `HeatGroup is undefined for ${this.info.customName}`);
      return;
    }

    const heatGroupSettings: HeatGroupSettings | undefined = heatGroup.settings;
    if (heatGroupSettings?.automaticMode == false) {
      this.desiredTemperature = heatGroupSettings.manualTemperature;
      return;
    }
    if (!this.settings.automaticMode) {
      return;
    }

    const targetTemperature: number = heatGroup.desiredTemp ?? 20;
    if (this._desiredTemperatur !== targetTemperature) {
      this.log(
        LogLevel.Debug,
        `Automatische Temperaturanpassung für ${this.info.customName} auf ${targetTemperature}°C`,
      );
      this.desiredTemperature = targetTemperature;
    }
  }

  public stopAutomaticCheck(): void {
    if (this._iAutomaticInterval !== undefined) {
      clearInterval(this._iAutomaticInterval);
      this._iAutomaticInterval = undefined;
    }
  }

  public onTemperaturChange(newTemperatur: number): void {
    this.roomTemperatur = newTemperatur;
  }

  public persistHeater(): void {
    Utils.dbo?.persistHeater(this);
  }

  /** @inheritDoc */
  public update(idSplit: string[], state: ioBroker.State, initial: boolean = false): void {
    if (idSplit[3] === 'tmp' && idSplit[4] === 'valvePosition') {
      this.log(LogLevel.Trace, `Valve position update for ${this.info.customName} to "${state.val}"`);
      this._level = (state.val as number) / 100;
    } else if (idSplit[3] === 'ext' && idSplit[4] === 'enabled') {
      this._useExternalTemperatureEnabled = state.val as boolean;
    } else if (idSplit[3] === 'tmp' && idSplit[4] === 'minimumValvePosition') {
      this._minimumValveLevel = state.val as number;
    } else if (idSplit[3] === 'tmp' && idSplit[4] === 'temperatureC') {
      this._temperatur = state.val as number;
    } else if (idSplit[3] === 'tmp' && idSplit[4] === 'automaticTemperatureControl') {
      this._automaticMode = state.val as boolean;
      const desiredMode = !this.settings.controlByPid;
      if (this._automaticMode !== desiredMode) {
        this.setMode(desiredMode);
      }
    } else if (idSplit[3] === 'tmp' && idSplit[4] === 'temperatureTargetC') {
      this._targetTempVal = state.val as number;
    } else if (idSplit[3] === 'bat' && idSplit[4] === 'value') {
      this._battery = state.val as number;
      this.persistBatteryDevice();
      if (this._battery < 20) {
        this.log(LogLevel.Warn, 'Das Shelly Gerät hat unter 20% Batterie.');
      }
    }
    super.update(idSplit, state, initial, true);
  }

  protected getNextPidLevel(): number {
    if (this.seasonTurnOff || this._roomTemperature < 0) {
      return 0;
    }
    this._pidController.setPoint(this.desiredTemperature);
    const newValue: number = this._pidController.calculate(this._roomTemperature);
    this.log(
      LogLevel.Debug,
      `New PID Value ${newValue}% (cTemp: ${this._roomTemperature}, dTemp: ${this.desiredTemperature})`,
    );
    return newValue;
  }

  private checkSeasonTurnOff(): void {
    const desiredState: boolean = Utils.beetweenDays(
      new Date(),
      this.settings.seasonTurnOffDay,
      this.settings.seasonTurnOnDay,
    );
    if (desiredState !== this.seasonTurnOff || !this._initialSeasonCheckDone) {
      this.log(LogLevel.Info, `Switching Seasonal Heating --> New seasonTurnOff: ${desiredState}`);
      this.seasonTurnOff = desiredState;
    }
    this._initialSeasonCheckDone = true;
  }

  public persistBatteryDevice(): void {
    const now: number = Utils.nowMS();
    if (this._lastBatteryPersist + 60000 > now) {
      return;
    }
    Utils.dbo?.persistBatteryDevice(this);
    this._lastBatteryPersist = now;
  }

  public dispose(): void {
    if (this.persistHeaterInterval) {
      clearInterval(this.persistHeaterInterval);
    }
    if (this._iAutomaticInterval) {
      clearInterval(this._iAutomaticInterval);
      this._iAutomaticInterval = undefined;
    }
    super.dispose();
  }

  public recalcLevel(): void {
    if (this.settings.useOwnTemperatur || this.seasonTurnOff || !this.settings.controlByPid) {
      return;
    }
    const msTilNextMinimumCheck: number = this._lastRecalc + 5 * 60 * 1000 - Utils.nowMS();
    if (msTilNextMinimumCheck > 0) {
      if (this._recalcTimeout == null) {
        this._recalcTimeout = Utils.guardedTimeout(this.recalcLevel, msTilNextMinimumCheck, this);
      }
      return;
    }
    this.setValve(Math.max(this.getNextPidLevel(), this.settings.pidForcedMinimum));
  }

  private setMode(automatic: boolean): void {
    this.setState(this._setAutomaticModeId, automatic);
  }

  private setExternalTemperature(value: number): void {
    this.setState(this._setExternalTempId, value);
  }

  private setExternalTemperatureEnabled(value: boolean): void {
    if (value === this._useExternalTemperatureEnabled) {
      return;
    }
    this.setState(this._setEnableExternalTempId, value);
  }

  private setValve(target: number): void {
    if (target == this._level) {
      return;
    }
    this._level = target;
    this.log(LogLevel.Info, `Setting Valve to new value: "${target}%"`);
    this.setState(this._valvePosId, target);
  }

  private setMinimumLevel(pidForcedMinimum: number): void {
    this.setState(this._minumumLevelId, pidForcedMinimum);
  }
}
