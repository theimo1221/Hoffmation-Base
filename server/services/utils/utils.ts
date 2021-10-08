import { ServerLogService } from '../log-service';
import { LogLevel } from '../../../models/logLevel';

export class Utils {
  public static guardedFunction(func: (...args: unknown[]) => void, thisContext: unknown | undefined): void {
    try {
      if (thisContext) {
        func.bind(thisContext)();
      } else {
        func();
      }
    } catch (e) {
      ServerLogService.writeLog(LogLevel.Error, `Guarded Function failed: ${e.message}\n Stack: ${e.stack}`);
    }
  }

  public static nowMS(): number {
    return new Date().getTime();
  }

  public static guardedNewThread(func: (...args: unknown[]) => void, thisContext?: unknown | undefined): void {
    Utils.guardedTimeout(func, 1, thisContext);
  }

  public static guardedTimeout(
    func: (...args: unknown[]) => void,
    time: number,
    thisContext?: unknown | undefined,
  ): NodeJS.Timeout {
    return setTimeout(() => {
      Utils.guardedFunction(func, thisContext);
    }, time);
  }

  public static guardedInterval(
    func: (...args: unknown[]) => void,
    time: number,
    thisContext?: unknown | undefined,
    fireImmediate: boolean = false,
  ): NodeJS.Timeout {
    if (fireImmediate) {
      Utils.guardedFunction(func, thisContext);
    }
    return setInterval(() => {
      Utils.guardedFunction(func, thisContext);
    }, time);
  }
  public static nowString(): string {
    const d: Date = new Date();
    return `${d.toLocaleTimeString('de-DE')}.${d.getMilliseconds()}`;
  }
}
