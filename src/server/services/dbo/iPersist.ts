import { iAcDevice, iBaseDevice, iHeater, iLamp, iMotionSensor, IoBrokerBaseDevice } from '../../devices';
import {
  CountToday,
  CurrentIlluminationDataPoint,
  EnergyCalculation,
  RoomBase,
  ShutterCalibration,
  TemperaturDataPoint,
} from '../../../models';

export interface iPersist {
  initialized: boolean;

  addTemperaturDataPoint(heater: iHeater): void;

  addRoom(room: RoomBase): void;

  addDevice(device: iBaseDevice): void;

  motionSensorTodayCount(device: iMotionSensor): Promise<CountToday>;

  getShutterCalibration(device: IoBrokerBaseDevice): Promise<ShutterCalibration>;

  initialize(): Promise<void>;

  persistShutterCalibration(data: ShutterCalibration): void;

  persistCurrentIllumination(data: CurrentIlluminationDataPoint): void;

  persistEnergyManager(energyData: EnergyCalculation): void;

  persistAC(device: iAcDevice): void;

  persistLamp(device: iLamp): void;

  persistMotionSensor(device: iMotionSensor): void;

  readTemperaturDataPoint(hzGrp: iHeater, limit: number): Promise<TemperaturDataPoint[]>;
}
