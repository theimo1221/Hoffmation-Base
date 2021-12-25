import { getSunrise, getSunset } from 'sunrise-sunset-js';
import { TimeCallback, TimeCallbackType } from '../../models/timeCallback';
import { ServerLogService } from './log-service';
import { Utils } from './utils/utils';
import { iTimePair } from '../config/iConfig';
import { SettingsService } from './settings-service';
import { Devices } from '../devices/devices';
import { LogLevel } from '../../models/logLevel';

export enum TimeOfDay {
  BeforeSunrise = 1,
  Daylight = 2,
  AfterSunset = 3,
  Night = 4,
}

export class SunTimeOffsets {
  public constructor(
    public sunrise: number = 0,
    public sunset: number = 0,
    public minimumHours: number = 6,
    public minimumMinutes: number = 24,
    public maximumHours: number = 22,
    public maximumMinutes: number = 30,
  ) {}

  public getNextMinimumSunrise(): Date {
    const today: Date = new Date(new Date().setHours(this.minimumHours, this.minimumMinutes));
    if (today > new Date()) {
      return today;
    }
    return new Date(today.getTime() + 24 * 60 * 60 * 1000);
  }

  public getNextMaximumSunset(): Date {
    const today = new Date(new Date().setHours(this.maximumHours, this.maximumMinutes));
    if (today > new Date()) {
      return today;
    }
    return new Date(today.getTime() + 24 * 60 * 60 * 1000);
  }
}

export class TimeCallbackService {
  private static _todaySunRise: Date;
  private static _todaySunSet: Date;
  private static _nextSunRise: Date;
  private static _nextSunSet: Date;
  private static _callbacks: TimeCallback[] = [];
  private static _iCheckTimeout: NodeJS.Timeout | undefined;
  private static _lastCheck: Date = new Date(0);

  public static dayType(pOffset: SunTimeOffsets): TimeOfDay {
    const now: Date = new Date();

    const hours = now.getHours();
    const minutes = now.getMinutes();

    const nightEnd: iTimePair = SettingsService.settings.timeSettings.nightEnd;
    const nightStart: iTimePair = SettingsService.settings.timeSettings.nightStart;

    if (nightStart.hours < nightEnd.hours) {
      if (
        (hours < nightEnd.hours && hours > nightStart.hours) ||
        (hours === nightEnd.hours && minutes < nightEnd.minutes) ||
        (hours === nightStart.hours && minutes > nightStart.minutes)
      ) {
        return TimeOfDay.Night;
      }
    } else {
      if (
        hours > nightStart.hours ||
        hours < nightEnd.hours ||
        (hours === nightStart.hours && minutes >= nightStart.minutes) ||
        (hours === nightEnd.hours && minutes <= nightEnd.minutes)
      ) {
        return TimeOfDay.Night;
      }
    }

    let sunset: Date = new Date(TimeCallbackService._todaySunSet.getTime() + pOffset.sunset * 60 * 1000);
    const maximumSunset: Date = pOffset.getNextMaximumSunset();
    if (maximumSunset.getDate() !== sunset.getDate()) {
      maximumSunset.setDate(maximumSunset.getDate() - 1);
    }
    if (maximumSunset < sunset && maximumSunset.getDate() === sunset.getDate()) {
      ServerLogService.writeLog(
        LogLevel.Trace,
        `Maximum Sunset vor nächstem Sunset: Sunset ${sunset.toLocaleString()}\t\t${maximumSunset.toLocaleString()}`,
      );
      sunset = maximumSunset;
    }
    if (now > sunset) {
      return TimeOfDay.AfterSunset;
    }
    const minimumSunrise: Date = pOffset.getNextMinimumSunrise();
    let sunrise: Date = new Date(TimeCallbackService._todaySunRise.getTime() + pOffset.sunset * 60 * 1000);
    if (minimumSunrise.getDate() !== sunrise.getDate()) {
      minimumSunrise.setDate(minimumSunrise.getDate() - 1);
    }
    if (minimumSunrise > sunrise && minimumSunrise.getDate() === sunrise.getDate()) {
      ServerLogService.writeLog(
        LogLevel.Trace,
        `Minimum Sunset nach aktuellem Sunrise: Sunset ${sunrise.toLocaleString()}\t\t${minimumSunrise.toLocaleString()}`,
      );
      sunrise = minimumSunrise;
    }
    if (now < sunrise && now.getDate() == sunrise.getDate()) {
      return TimeOfDay.BeforeSunrise;
    }
    return TimeOfDay.Daylight;
  }

  public static darkOutsideOrNight(dayType: TimeOfDay): boolean {
    switch (dayType) {
      case TimeOfDay.Night:
      case TimeOfDay.BeforeSunrise:
      case TimeOfDay.AfterSunset:
        return true;
      default:
        return false;
    }
  }

  public static stopInterval(): void {
    if (this._iCheckTimeout !== undefined) {
      clearInterval(this._iCheckTimeout);
      this._iCheckTimeout = undefined;
    }
  }

  public static get nextSunRise(): Date {
    return TimeCallbackService._nextSunRise;
  }

  public static get nextSunSet(): Date {
    return TimeCallbackService._nextSunSet;
  }

  public static init(): void {
    const dailyRecalc: TimeCallback = new TimeCallback(
      'Midnight Recalc',
      TimeCallbackType.TimeOfDay,
      () => {
        TimeCallbackService.recalcSunTimes();
        Devices.midnightReset();
      },
      0,
      0,
      0,
    );

    const daily3oClockRecalc: TimeCallback = new TimeCallback(
      'Daily3oClockRecalc',
      TimeCallbackType.TimeOfDay,
      () => {
        Devices.resetPraesenzCount();
      },
      0,
      3,
      0,
    );

    TimeCallbackService.recalcSunTimes();
    TimeCallbackService.addCallback(dailyRecalc);
    TimeCallbackService.addCallback(daily3oClockRecalc);
    this._iCheckTimeout = Utils.guardedInterval(TimeCallbackService.performCheck.bind(this), 60000);
  }

  public static addCallback(pCallback: TimeCallback): void {
    TimeCallbackService._callbacks.push(pCallback);
  }

  public static performCheck(): void {
    ServerLogService.writeLog(LogLevel.Trace, `Perform TimeCallBackCheck`);
    const now: Date = new Date();
    for (const tc of TimeCallbackService._callbacks) {
      if (tc.nextToDo === undefined || tc.nextToDo < tc.lastDone) {
        tc.recalcNextToDo(now);
      }

      if (tc.nextToDo === undefined) {
        continue;
      }

      if (tc.nextToDo < now && tc.nextToDo > TimeCallbackService._lastCheck) {
        tc.cFunction();
        tc.lastDone = now;
        tc.nextToDo = undefined;
      }
    }

    if (TimeCallbackService._nextSunRise < now) {
      const tomorow: Date = new Date(new Date().setHours(2, 0, 0, 0) + 24 * 60 * 60 * 1000);
      TimeCallbackService.updateSunRise(tomorow);
    }
    if (TimeCallbackService._nextSunSet < now) {
      const tomorow: Date = new Date(new Date().setHours(2, 0, 0, 0) + 24 * 60 * 60 * 1000);
      TimeCallbackService.updateSunSet(tomorow);
    }

    TimeCallbackService._lastCheck = now;
  }

  public static recalcSunTimes(): void {
    TimeCallbackService._todaySunRise = getSunrise(51.529556852253826, 7.097266042276687, new Date());

    TimeCallbackService._todaySunSet = getSunset(51.529556852253826, 7.097266042276687, new Date());
    TimeCallbackService.updateSunSet();
    TimeCallbackService.updateSunRise();
    ServerLogService.writeLog(
      LogLevel.Info,
      `Nächster Sonnenaufgang um ${TimeCallbackService.nextSunRise.toLocaleTimeString('de-DE')}
Nächster Sonnenuntergang um ${TimeCallbackService._nextSunSet.toLocaleTimeString('de-DE')}`,
    );
  }

  public static removeCallback(pCallback: TimeCallback): void {
    for (let i: number = 0; i < TimeCallbackService._callbacks.length; i++) {
      const cb: TimeCallback = TimeCallbackService._callbacks[i];
      if (cb.name !== pCallback.name) {
        continue;
      }
      TimeCallbackService._callbacks.splice(i, 1);
      return;
    }
  }

  public static updateSunRise(pDay: Date = new Date()): void {
    TimeCallbackService._nextSunRise = getSunrise(51.529556852253826, 7.097266042276687, pDay);
  }

  public static updateSunSet(pDay: Date = new Date()): void {
    TimeCallbackService._nextSunSet = getSunset(51.529556852253826, 7.097266042276687, pDay);
  }
}
