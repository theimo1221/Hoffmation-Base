import { RoomBase } from '../../../models/index.js';
import { iBaseDevice } from './iBaseDevice.js';

/**
 * This interface represents a device that is located in a single room.
 */
export interface iRoomDevice extends iBaseDevice {
  /**
   * The room the device is in (this might be undefined if the device is not yet properly initialized)
   */
  room: RoomBase | undefined;
}
