import { ZigbeeShutter } from './zigbeeShutter';
import { DeviceInfo } from '../DeviceInfo';
import { DeviceType } from '../deviceType';
import { ServerLogService } from '../../services/log-service';
import { LogLevel } from '../../../models/logLevel';
import { Utils } from '../../services/utils/utils';

enum MovementState {
  Down = 30,
  Stop = 50,
  Up = 70,
}

export class ZigbeeIlluShutter extends ZigbeeShutter {
  private _movementStateId: string;
  private _movementState: MovementState = MovementState.Stop;
  private _movementStartMs: number = -1;
  private _msTilTop: number = -1;
  private _msTilBot: number = -1;
  private _movementStartPos: number = -1;

  public constructor(pInfo: DeviceInfo) {
    super(pInfo, DeviceType.ZigbeeIlluShutter);
    this._movementStateId = `${this.info.fullID}.position`;
  }

  public update(idSplit: string[], state: ioBroker.State, initial: boolean = false): void {
    switch (idSplit[3]) {
      case 'position':
        ServerLogService.writeLog(LogLevel.Trace, `Shutter Update for ${this.info.customName} to "${state.val}"`);
        this.processNewMovementState(state.val as number);
        break;
    }

    super.update(idSplit, state, initial, true);
  }

  protected override moveToPosition(targetPosition: number): void {
    this._movementStartPos = this._currentLevel;
    if (targetPosition === 100) {
      this.changeMovementState(MovementState.Up);
      return;
    }
    if (targetPosition === 0) {
      this.changeMovementState(MovementState.Down);
      return;
    }
    if (!this.isCalibrated()) {
      ServerLogService.writeLog(
        LogLevel.Alert,
        `Can't move "${this.info.customName}" to position "${targetPosition}" as it is not calibrated (Move it completly up, down, up first)`,
      );
      return;
    }

    const distance: number = Math.abs(this._currentLevel - targetPosition);
    const direction: MovementState = this._currentLevel > targetPosition ? MovementState.Down : MovementState.Up;
    const duration: number =
      Math.round(distance / 100) * (this._currentLevel > targetPosition ? this._msTilBot : this._msTilTop);
    this.changeMovementState(direction);
    Utils.guardedTimeout(
      () => {
        this.changeMovementState(MovementState.Stop);
      },
      duration,
      this,
    );
  }

  private changeMovementState(direction: MovementState) {
    ServerLogService.writeLog(
      LogLevel.Debug,
      `Set new MovementState for "${this.info.customName}" to "${MovementState[direction]}"`,
    );
    if (direction !== MovementState.Stop) {
      this._movementStartMs = Utils.nowMS();
    }
    this.setState(this._movementStateId, direction, () => {
      this._movementState = direction;
    });
  }

  private processNewMovementState(val: number) {
    const newState: MovementState = val <= 30 ? MovementState.Down : val >= 70 ? MovementState.Up : MovementState.Stop;
    if (newState !== MovementState.Stop) {
      this._movementState = newState;
      return;
    }
    const timePassed: number = Utils.nowMS() - this._movementStartMs;
    const oldState: MovementState = this._movementState;
    if (this._movementStartPos === 0 && oldState === MovementState.Up && this._setLevel === 100) {
      this._msTilTop = timePassed;
      ServerLogService.writeLog(
        LogLevel.Debug,
        `New Time-Until-Top measurement for ${this.info.customName}: ${timePassed}ms`,
      );
      this.currentLevel = this._setLevel;
      return;
    }
    if (this._movementStartPos === 100 && oldState === MovementState.Down && this._setLevel === 0) {
      ServerLogService.writeLog(
        LogLevel.Debug,
        `New Time-Until-Bottom measurement for ${this.info.customName}: ${timePassed}ms`,
      );
      this._msTilBot = timePassed;
      this.currentLevel = this._setLevel;
      return;
    }

    if (!this.isCalibrated()) {
      return;
    }

    if (oldState === MovementState.Down) {
      this.currentLevel = Math.min(this._currentLevel - Math.round((timePassed * 100) / this._msTilBot), 0);
    } else if (oldState === MovementState.Up) {
      this.currentLevel = Math.max(this._currentLevel + Math.round((timePassed * 100) / this._msTilBot), 100);
    }
  }

  private isCalibrated(): boolean {
    return this._msTilTop > 0 && this._msTilBot > 0;
  }
}
