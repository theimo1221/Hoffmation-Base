import { HTTPSService } from './https-service';
import { HTTPSOptions } from './HTTPSOptions';
import { ServerLogService } from './log-service';
import { LogLevel } from '../../models/logLevel';
import * as fs from 'fs';
import { SonosService } from './Sonos/sonos-service';
import { SNDevices } from './Sonos/SonosDevices';
import { PollyService } from './Sonos/polly-service';
import { Utils } from './utils/utils';
import { SettingsService } from "/server/services/settings-service";

export class NewsService {
  public static oneDay: number = 1000 * 60 * 60 * 24;
  public static lastNewsName: string;
  private static hourlyInterval: NodeJS.Timeout;

  public static initialize(): void {
    NewsService.hourlyInterval = Utils.guardedInterval(NewsService.getLastNews, 3600000);
    NewsService.getLastNews();
  }

  public static getLastNews(): void {
    HTTPSService.request(
      new HTTPSOptions('www1.wdr.de', '/mediathek/audio/wdr-aktuell-news/index.html', {}, 'GET', 443),
      '',
      5,
      (response: string) => {
        try {
          const cutAfterDownload: string = response.split(`" title="Audio Download">`)[0];
          const cutsPriorDownload: string[] = cutAfterDownload.split(`<a class="button download fsk0" href="`);
          const target: string = 'https:' + cutsPriorDownload[cutsPriorDownload.length - 1];
          const splits: string[] = target.split('/');
          const fileName: string = splits[splits.length - 1];
          const filePath = `${SettingsService.settings.mp3Server?.path}${fileName}`;
          ServerLogService.writeLog(LogLevel.Debug, `NewsService: Die aktuelle News ist "${target}"`);
          if (fs.existsSync(filePath)) {
            NewsService.lastNewsName = fileName.split('.mp3')[0];
            ServerLogService.writeLog(LogLevel.Debug, `Wir haben bereits die neuste WDR Nachrichten heruntergeladen.`);
            return;
          }
          HTTPSService.downloadFile(target, `//HOMESERVER/Users/Public/Documents/ttsMP3/${fileName}`).then(
            (success: boolean) => {
              if (!success) {
                ServerLogService.writeLog(LogLevel.Debug, `Fehler beim Herunterladen der Nachrichten von WDR`);
                return;
              }

              NewsService.lastNewsName = fileName.split('.mp3')[0];
            },
          );
        } catch (e) {
          ServerLogService.writeLog(LogLevel.Debug, `Fehler beim Parsen der WDR Antwort Error: ${e}`);
          return;
        }
      },
    );
  }

  public static playLastNews(sonosDevice: SNDevices, volume: number = 30, retries: number = 5): void {
    if (!NewsService.lastNewsName) {
      if (retries > 0) {
        ServerLogService.writeLog(
          LogLevel.Warn,
          `Der NewsService ist noch nicht bereit --> warten, verbleibende Neuversuche ${retries - 1}`,
        );
        Utils.guardedTimeout(() => {
          NewsService.playLastNews(sonosDevice, volume, retries - 1);
        }, 1000);
      } else {
        ServerLogService.writeLog(LogLevel.Error, `Der NewsService ist trotz Warten nicht bereit --> Abbruch`);
      }
      return;
    }

    SonosService.playOnDevice(
      sonosDevice,
      NewsService.lastNewsName,
      PollyService.getDuration(NewsService.lastNewsName),
      volume,
    );
  }
}
