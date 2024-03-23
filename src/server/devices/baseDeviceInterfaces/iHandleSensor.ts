import { WindowPosition } from '../models';
import { iRoomDevice } from './iRoomDevice';

// TODO: Add missing Comments
export interface iHandleSensor extends iRoomDevice {
  position: WindowPosition;
  minutesOpen: number;

  addOffenCallback(pCallback: (pValue: boolean) => void): void;

  addKippCallback(pCallback: (pValue: boolean) => void): void;

  addClosedCallback(pCallback: (pValue: boolean) => void): void;
}
