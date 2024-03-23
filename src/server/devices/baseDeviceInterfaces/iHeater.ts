import { HeaterSettings } from '../../../models';
import { iRoomDevice } from './iRoomDevice';

// TODO: Add missing Comments
export interface iHeater extends iRoomDevice {
  settings: HeaterSettings;
  desiredTemperature: number;
  readonly humidity: number;
  // The level between 0 and 1.0
  readonly iLevel: number;
  readonly iTemperature: number;
  roomTemperature: number;
  readonly persistHeaterInterval: NodeJS.Timeout;

  seasonTurnOff: boolean;

  stopAutomaticCheck(): void;

  checkAutomaticChange(): void;

  onTemperaturChange(newTemperatur: number): void;

  persistHeater(): void;
}
