import { LogLevel } from 'index';
import { Devices } from 'index';
import { DeviceUpdater } from 'index';
import { IDeviceUpdater } from 'index';
import { ServerLogService } from 'index';
import { TimeCallbackService } from 'index';
import { IOBrokerConnection } from 'index';
import { ConnectionCallbacks } from 'index';
import { RoomBase } from 'index';
import { Utils } from 'index';
import { SettingsService } from 'index';

export class ioBrokerMain {
  private static roomConstructors: { [roomName: string]: { new (): RoomBase } } = {};
  private servConn: IOBrokerConnection;
  private deviceUpdater: IDeviceUpdater;
  private states: Record<string, ioBroker.State> = {};
  private connectionCallbacks: ConnectionCallbacks;

  public static addRoomConstructor(roomName: string, constr: { new (): RoomBase }): void {
    if (ioBrokerMain.roomConstructors[roomName] !== undefined) {
      ServerLogService.writeLog(LogLevel.Error, `Konstruktor für Raum mit Namen "${roomName}" bereits hinzugefügt`);
      return;
    }
    ioBrokerMain.roomConstructors[roomName] = constr;
  }

  public constructor(pDeviceUpdater: DeviceUpdater) {
    this.deviceUpdater = pDeviceUpdater;
    this.connectionCallbacks = new ConnectionCallbacks();
    this.initConnCallbacks();

    this.servConn = new IOBrokerConnection(
      {
        name: '', // optional - default 'vis.0'
        connLink: SettingsService.settings.ioBrokerUrl, // optional URL of the socket.io adapter
        socketSession: '', // optional - used by authentication
      },
      this.connectionCallbacks,
    );

    Devices.addIoConnection(this.servConn);
    ioBrokerMain.initRooms();
  }

  private static initRooms(): void {
    for (const key in ioBrokerMain.roomConstructors) {
      new ioBrokerMain.roomConstructors[key]();
    }
  }

  private initConnCallbacks(): void {
    this.connectionCallbacks.onObjectChange = (pId: string, pObj: ioBroker.Object) => {
      Utils.guardedNewThread(() => {
        this.deviceUpdater.updateObject(pId, pObj);
      }, this);
    };

    this.connectionCallbacks.onConnChange = (isConnected: boolean) => {
      if (!isConnected) {
        console.log('disconnected');
        return;
      }

      console.log('connected');
      this.servConn.getStates(null, (err, _states) => {
        if (err !== null && err !== undefined) {
          ServerLogService.writeLog(LogLevel.Info, `Iobroker Error: ${err.message}\n${err.stack}`);
        }
        if (_states === undefined) {
          return;
        }
        ServerLogService.writeLog(LogLevel.Debug, `Im initialen GetStates Callback`);

        let count = 0;
        for (const id in _states) {
          this.deviceUpdater.updateState(id, _states[id], true);
          count++;
        }
        console.log('Received ' + count + ' states.');
        this.states = _states;
        TimeCallbackService.performCheck();
        TimeCallbackService.performCheck();
      });
    };
    this.connectionCallbacks.onRefresh = () => {
      //
    };

    this.connectionCallbacks.onUpdate = (id: string, state: ioBroker.State) => {
      Utils.guardedNewThread(() => {
        // console.log('NEW VALUE of ' + id + ': ' + JSON.stringify(state));
        this.states[id] = state;
        this.deviceUpdater.updateState(id, state);
      }, this);
    };

    this.connectionCallbacks.onError = (err: any) => {
      console.log(`Cannot execute ${err.command} for ${err.arg}, because of insufficient permissions`);
    };
  }
}
