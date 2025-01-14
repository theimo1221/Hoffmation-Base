import { RingStorage } from '../utils';
import { LogObject } from './log-object';
import { iLogSettings, iSettingsProvider } from '../interfaces';
import { DeviceType, LogDebugType, LogLevel, LogSource } from '../enums';
import { LogFilterData } from './log-filter-data';

export class ServerLogService {
  /**
   * Callback to be called when a message should be sent to telegram
   */
  public static telegramSending: (message: string) => void = () => {};
  /**
   * The level at which messages are sent to telegram
   * @remarks defined at {@link iConfig.telegram.logLevel}
   */
  public static telegramLevel: number = -1; // Controlled from within Config File
  /**
   * The threshold above which messages are stored in the ring-storage to be retrieved e.g. using {@link API.getLog}
   */
  public static storageLevel: number = LogLevel.Trace; // Controlled from within Config File
  /**
   * The storage for the log messages
   */
  public static storage: RingStorage<LogObject> = new RingStorage<LogObject>(10000);
  /**
   * The settings for the logging system.
   */
  public static settings: iLogSettings = {
    logLevel: LogLevel.Debug,
    useTimestamp: false,
  };
  private static settingsProvider: iSettingsProvider;

  public static getLog(amount: number = 5000): LogObject[] {
    return this.storage.readAmount(amount);
  }

  public static initialize(logSettings: iLogSettings, settingsProvider: iSettingsProvider): void {
    this.settings = logSettings;
    this.settingsProvider = settingsProvider;
  }

  public static writeLog(pLevel: LogLevel, pMessage: string, additionalLogInfo?: LogFilterData): void {
    const now: number = Date.now();
    if (additionalLogInfo?.debugType !== undefined && ServerLogService.checkDebugLogSkip(additionalLogInfo.debugType)) {
      return;
    }
    if (pLevel > this.storageLevel && pLevel > ServerLogService.settings.logLevel) {
      return;
    }
    if (pLevel <= this.storageLevel) {
      this.storage.add(new LogObject(now, pLevel, pMessage, additionalLogInfo));
    }
    if (pLevel <= ServerLogService.settings.logLevel) {
      let message: string = this.settings.useTimestamp ? `[${now}] ` : '';
      if (additionalLogInfo?.deviceName) {
        message += `"${additionalLogInfo.deviceName}": `;
      } else if (additionalLogInfo?.room) {
        message += `"${additionalLogInfo.room}": `;
      }
      const logSource: LogSource = additionalLogInfo?.source ?? 0;
      if (logSource > 0) {
        message += `${LogSource[logSource]}: `;
      }

      message += pMessage;
      console.log(message);

      if (pLevel <= ServerLogService.telegramLevel) {
        const title: string = LogLevel[pLevel];
        ServerLogService.telegramSending(`${title}: ${message}`);
      }
    }
  }

  public static addedDeviceToRoom(
    pRoomName: string,
    pDeviceType: DeviceType,
    pRoomIndex: number,
    forceDebug: boolean = false,
  ): void {
    const logLevel = forceDebug ? LogLevel.Debug : LogLevel.Trace;
    ServerLogService.writeLog(
      logLevel,
      `${DeviceType[pDeviceType]} (Raumindex: ${pRoomIndex}) zum Raum "${pRoomName}" hinzugefügt"`,
    );
  }

  public static missingRoomHandling(pRoomName: string, pDeviceType: DeviceType): void {
    ServerLogService.writeLog(
      LogLevel.Warn,
      `Raum "${pRoomName}" hat keine Definition für den Typ "${DeviceType[pDeviceType]}"`,
    );
  }

  public static missingRoomIndexHandling(pRoomName: string, pIndex: number, pDeviceType: DeviceType): void {
    ServerLogService.writeLog(
      LogLevel.Warn,
      `Raum "${pRoomName}" hat keine Definition für den Typ "${DeviceType[pDeviceType]} mit Index ${pIndex}"`,
    );
  }

  /**
   * Checks if this message is of a debugtype which should be skipped according to settings
   * @param debugType - {LogDebugType}
   * @returns If the Message should be skipped
   */
  private static checkDebugLogSkip(debugType: LogDebugType): boolean {
    switch (debugType) {
      case LogDebugType.None:
        return false;
      case LogDebugType.SkipUnchangedActuatorCommand:
        if (this.settingsProvider.settings.logSettings?.debugUnchangedActuator === true) {
          return false;
        }
        break;
      case LogDebugType.SkipUnchangedRolloPosition:
        if (this.settingsProvider.settings.logSettings?.debugUchangedShutterPosition === true) {
          return false;
        }
        break;
      case LogDebugType.SetActuator:
        if (this.settingsProvider.settings.logSettings?.debugActuatorChange === true) {
          return false;
        }
        break;
      case LogDebugType.ShutterPositionChange:
        if (this.settingsProvider.settings.logSettings?.debugShutterPositionChange === true) {
          return false;
        }
        break;
      case LogDebugType.NewMovementState:
        if (this.settingsProvider.settings.logSettings?.debugNewMovementState === true) {
          return false;
        }
        break;
      case LogDebugType.SkipUnchangedMovementState:
        if (this.settingsProvider.settings.logSettings?.debugNewMovementState === true) {
          return false;
        }
        break;
      case LogDebugType.DaikinSuccessfullControlInfo:
        if (this.settingsProvider.settings.logSettings?.debugDaikinSuccessfullControlInfo === true) {
          return false;
        }
        break;
      case LogDebugType.EuroHeaterValveLogging:
        if (this.settingsProvider.settings.logSettings?.debugEuroHeaterValve === true) {
          return false;
        }
        break;
      case LogDebugType.Trilateration:
        if (this.settingsProvider.settings.logSettings?.debugTrilateration === true) {
          return false;
        }
        break;
    }
    return true;
  }
}
