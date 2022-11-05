import { iPersist } from './iPersist';
import {
  CountToday,
  DesiredShutterPosition,
  EnergyCalculation,
  idSettings,
  LogLevel,
  RoomBase,
  ShutterCalibration,
} from '../../../models';
import {
  ButtonPressType,
  iAcDevice,
  iActuator,
  iBaseDevice,
  iBatteryDevice,
  iButtonSwitch,
  iHeater,
  iHumiditySensor,
  iIlluminationSensor,
  iMotionSensor,
  iShutter,
  iTemperatureSensor,
  UNDEFINED_TEMP_VALUE,
  ZigbeeDevice,
} from '../../devices';
import { Pool, PoolConfig, QueryResultRow } from 'pg';
import { ServerLogService } from '../log-service';
import { DeviceCapability } from '../../devices/DeviceCapability';
import { iDimmableLamp } from '../../devices/baseDeviceInterfaces/iDimmableLamp';
import { Utils } from '../utils';

export class PostgreSqlPersist implements iPersist {
  initialized: boolean = false;
  private readonly psql: Pool;
  private readonly config: PoolConfig;

  public constructor(conf: PoolConfig) {
    this.config = conf;
    this.psql = new Pool(this.config);
  }

  addRoom(room: RoomBase): void {
    this.query(`
insert into hoffmation_schema."BasicRooms" (name, etage)
values ('${room.roomName}',${room.settings.etage})
    ON CONFLICT (name)
    DO UPDATE SET
        etage = ${room.settings.etage}
;
    `);
  }

  addDevice(device: iBaseDevice): void {
    this.query(`
insert into hoffmation_schema."DeviceInfo" ("deviceid", "roomname", "alldeviceskey", "customname", "devtype")
values ('${device.id}','${device.info.room}','${device.info.allDevicesKey}','${device.info.customName}', ${device.deviceType})
    ON CONFLICT ("deviceid")
    DO UPDATE SET
        "roomname" = '${device.info.room}',
        "alldeviceskey" = '${device.info.allDevicesKey}',
        "customname" = '${device.info.customName}',
        "devtype" = ${device.deviceType}
;
    `);
  }

  async getLastDesiredPosition(device: iShutter): Promise<DesiredShutterPosition> {
    const dbResult: DesiredShutterPosition[] | null = await this.query<DesiredShutterPosition>(
      `SELECT position
from hoffmation_schema."ShutterDeviceData"
WHERE "deviceID" = '${device.id}'
and date >= CURRENT_DATE AND date < CURRENT_DATE + INTERVAL '1 DAY'
ORDER BY date desc
Limit 1`,
    );
    if (dbResult !== null && dbResult.length > 0) {
      return dbResult[0];
    }

    ServerLogService.writeLog(
      LogLevel.Debug,
      `Es gibt noch keine persistierten Bewegungen für ${device.info.fullName}`,
    );
    return new DesiredShutterPosition(-1);
  }

  async motionSensorTodayCount(device: iMotionSensor): Promise<CountToday> {
    const dbResult: CountToday[] | null = await this.query<CountToday>(
      `SELECT Count(*) 
from hoffmation_schema."MotionSensorDeviceData" 
WHERE "deviceID" = '${device.id}' and "movementDetected" and date >= CURRENT_DATE AND date < CURRENT_DATE + INTERVAL '1 DAY'`,
    );
    if (dbResult !== null && dbResult.length > 0) {
      const result = dbResult[0];
      result.count = Number(result.count);
      return result;
    }

    ServerLogService.writeLog(
      LogLevel.Debug,
      `Es gibt noch keine persistierten Bewegungen für ${device.info.fullName}`,
    );
    return new CountToday(0);
  }

  getShutterCalibration(_device: iShutter): Promise<ShutterCalibration> {
    ServerLogService.writeLog(LogLevel.Warn, `Postgres doesn't support Shutter Calibration yet.`);
    return new Promise<ShutterCalibration>((_res, reject) => {
      reject('Not Implemented');
    });
  }

  async initialize(): Promise<void> {
    await this.psql.connect();
    // Execute BasicRoomsDDL
    await this.psql.query(
      `
DO $$
BEGIN
  CREATE SCHEMA IF NOT EXISTS hoffmation_schema;
  
  IF (SELECT to_regclass('hoffmation_schema."BasicRooms"') IS NULL) Then
    create table hoffmation_schema."BasicRooms"
    (
        name  varchar(30) not null
            constraint table_name_pk
                primary key,
        etage integer
    );

    create unique index table_name_name_uindex
        on hoffmation_schema."BasicRooms" (name);

  END IF;
  
  IF (SELECT to_regclass('hoffmation_schema."DeviceInfo"') IS NULL) Then    
    create table hoffmation_schema."DeviceInfo"
    (
        deviceid      varchar(60) not null
            constraint deviceinfo_pk
                primary key,
        roomname      varchar(30)
            constraint "DeviceInfo_BasicRooms_null_fk"
                references hoffmation_schema."BasicRooms",
        alldeviceskey varchar(30),
        customname    varchar(60),
        devtype       integer
    );

  END IF;

  IF (SELECT to_regclass('hoffmation_schema."IlluminationSensorDeviceData"') IS NULL) Then
    create table hoffmation_schema."IlluminationSensorDeviceData"
    (
        "deviceID"         varchar(60) not null
            constraint "IlluminationSensorDeviceData_DeviceInfo_null_fk"
                references hoffmation_schema."DeviceInfo"
                on delete set null,
        "illumination" int,
        date               timestamp   not null,
        constraint IlluminationSensorDeviceData_pk
          primary key ("deviceID", date)
    );

  END IF;
    
  IF (SELECT to_regclass('hoffmation_schema."ButtonSwitchPresses"') IS NULL) Then
    create table if not exists hoffmation_schema."ButtonSwitchPresses"
    (
        "deviceID"         varchar(60) not null
            constraint "ButtonSwitchPresses_DeviceInfo_null_fk"
                references hoffmation_schema."DeviceInfo"
                on delete set null,
        "pressType" int,
        "buttonName" varchar(30),
        date               timestamp   not null,
        constraint buttonswitchpresses_pk
            primary key ("deviceID", "pressType", date)
    );

  END IF;
    
  IF (SELECT to_regclass('hoffmation_schema."EnergyCalculation"') IS NULL) Then
    create table hoffmation_schema."EnergyCalculation"
    (
        "startDate"           timestamp not null
            constraint energycalculation_pk
                primary key,
        "endDate"             timestamp,
        "selfConsumedKwH" double precision,
        "injectedKwH"     double precision,
        "drawnKwH"        double precision
    );


    create unique index energycalculation_startdate_uindex
      on hoffmation_schema."EnergyCalculation" ("startDate");

  END IF;

  IF (SELECT to_regclass('hoffmation_schema."AcDeviceData"') IS NULL) Then    
    create table hoffmation_schema."AcDeviceData"
    (
        "deviceID" varchar(60) not null,
        "on"       boolean,
        "istTemperatur"  double precision,
        date       timestamp   not null,
        constraint acdevicedata_pk
            primary key ("deviceID", date)
    );
    
  END IF;


  IF (SELECT to_regclass('hoffmation_schema."ActuatorDeviceData"') IS NULL) Then    
    create table hoffmation_schema."ActuatorDeviceData"
    (
        "deviceID" varchar(60) not null,
        "on"       boolean,
        date       timestamp   not null,
        percentage integer,
        constraint ActuatorDeviceData_pk
            primary key ("deviceID", date)
    );
  
  END IF;

  IF (SELECT to_regclass('hoffmation_schema."MotionSensorDeviceData"') IS NULL) Then    
    create table hoffmation_schema."MotionSensorDeviceData"
    (
        "deviceID" varchar(60) not null,
        "movementDetected"       boolean,
        date       timestamp   not null,
        constraint motionsensordevicedata_pk
            primary key ("deviceID", date)
    );
  
  END IF;

  IF (SELECT to_regclass('hoffmation_schema."ShutterDeviceData"') IS NULL) Then    
    create table if not exists hoffmation_schema."ShutterDeviceData"
    (
        "deviceID"         varchar(60) not null
            constraint "ShutterDeviceData_DeviceInfo_null_fk"
                references hoffmation_schema."DeviceInfo"
                on delete set null,
        "position" double precision,
        date               timestamp   not null,
        "desiredPosition" double precision,
        constraint shutterdevicedata_pk
            primary key ("deviceID", date)
    );
    
  END IF;

  IF (SELECT to_regclass('hoffmation_schema."TemperatureSensorDeviceData"') IS NULL) Then  
    create table if not exists hoffmation_schema."TemperatureSensorDeviceData"
    (
        "deviceID"        varchar(60) not null
            constraint "TemperatureSensorDeviceData_DeviceInfo_null_fk"
                references hoffmation_schema."DeviceInfo"
                on delete set null,
        temperature          double precision,
        date              timestamp   not null,
        "roomTemperature" double precision,
        constraint temperaturesensordevicedata_pk
            primary key ("deviceID", date)
    );
    
  END IF;

  IF (SELECT to_regclass('hoffmation_schema."HumiditySensorDeviceData"') IS NULL) Then  
    create table if not exists hoffmation_schema."HumiditySensorDeviceData"
    (
        "deviceID"        varchar(60) not null
            constraint "HumiditySensorDeviceData_DeviceInfo_null_fk"
                references hoffmation_schema."DeviceInfo"
                on delete set null,
        humidity          double precision,
        date              timestamp   not null,
        constraint humiditysensordevicedata_pk
            primary key ("deviceID", date)
    );
    
  END IF;

  IF (SELECT to_regclass('hoffmation_schema."BatteryDeviceData"') IS NULL) Then  
    create table if not exists hoffmation_schema."BatteryDeviceData"
    (
        "deviceID"        varchar(60) not null
            constraint "BatteryDeviceData_DeviceInfo_null_fk"
                references hoffmation_schema."DeviceInfo"
                on delete set null,
        battery          double precision,
        date              timestamp   not null,
        constraint batterydevicedata_pk
            primary key ("deviceID", date)
    );
    
  END IF;

  IF (SELECT to_regclass('hoffmation_schema."ZigbeeDeviceData"') IS NULL) Then
    create table if not exists hoffmation_schema."ZigbeeDeviceData"
    (
        "deviceID"        varchar(60) not null
            constraint "ZigbeeDeviceData_DeviceInfo_null_fk"
                references hoffmation_schema."DeviceInfo"
                on delete set null,
        date              timestamp   not null,
        available          boolean,
        linkQuality          double precision,
        lastUpdate          timestamp,
        constraint zigbeedevicedata_pk
            primary key ("deviceID", date)
    );

  END IF;

  
    
  IF (SELECT to_regclass('hoffmation_schema."HeaterDeviceData"') IS NULL) Then
    create table if not exists hoffmation_schema."HeaterDeviceData"
    (
        "deviceID"        varchar(60) not null
            constraint "HeaterDeviceData_DeviceInfo_null_fk"
                references hoffmation_schema."DeviceInfo",
        "level"              double precision,
        date              timestamp   not null,
        "roomTemperature" double precision,
        "desiredTemperature" double precision,
        "seasonTurnOff" boolean,
        constraint heaterevicedata_pk
            primary key ("deviceID", date)
    );
    
  END IF;
  
  IF (SELECT to_regclass('hoffmation_schema."Settings"') IS NULL) Then
    create table if not exists hoffmation_schema."Settings"
    (
        "id"            varchar(60) not null,
        "settings"      varchar not null,
        "customname"    varchar(100) not null,
        date            timestamp   not null,
        constraint settings_pk
            primary key ("id", date)
    );
    
  END IF;
END
$$;`,
    );
    this.initialized = true;
    ServerLogService.writeLog(LogLevel.Info, `Postgres DB initialized`);
  }

  public persistAC(device: iAcDevice): void {
    this.query(`
insert into hoffmation_schema."AcDeviceData" ("deviceID", "on", "date", "roomTemperature")
values ('${device.id}', ${device.on}, '${new Date().toISOString()}', ${device.temperature});
    `);
  }

  public persistActuator(device: iActuator): void {
    let percentage: number | undefined = undefined;
    if (device.deviceCapabilities.includes(DeviceCapability.dimmablelamp)) {
      percentage = (device as iDimmableLamp).brightness;
    }
    this.query(`
insert into hoffmation_schema."ActuatorDeviceData" ("deviceID", "on", "date", "percentage")
values ('${device.id}', ${device.actuatorOn}, '${new Date().toISOString()}', ${percentage ?? 'null'});
    `);
  }

  public persistHeater(device: iHeater): void {
    let roomTemp: number | null = device.roomTemperature;
    let desiredTemperature: number | null = device.desiredTemperature;
    if (roomTemp == UNDEFINED_TEMP_VALUE) {
      roomTemp = null;
    }
    if (desiredTemperature == UNDEFINED_TEMP_VALUE) {
      desiredTemperature = null;
    }
    void this.query(`
insert into hoffmation_schema."HeaterDeviceData" ("deviceID", "level", "date", "roomTemperature", "desiredTemperature", "seasonTurnOff")
values ('${device.id}', ${device.iLevel}, '${new Date().toISOString()}', ${roomTemp ?? 'null'}, ${
      desiredTemperature ?? 'null'
    }, ${device.seasonTurnOff});
    `);
  }

  public persistSwitchInput(device: iButtonSwitch, pressType: ButtonPressType, buttonName: string): void {
    this.query(`
insert into hoffmation_schema."ButtonSwitchPresses" ("deviceID", "pressType", "buttonName", "date")
values ('${device.id}', ${pressType}, '${buttonName}', '${new Date().toISOString()}');
    `);
  }

  public persistMotionSensor(device: iMotionSensor): void {
    this.query(`
insert into hoffmation_schema."MotionSensorDeviceData" ("deviceID", "movementDetected", "date")
values ('${device.id}', ${device.movementDetected}, '${new Date().toISOString()}');
    `);
  }

  public persistShutter(device: iShutter): void {
    const currentLevel: number | null = device.currentLevel >= 0 ? device.currentLevel : null;
    const desiredLevel: number | null = device.desiredWindowShutterLevel >= 0 ? device.desiredWindowShutterLevel : null;
    this.query(`
insert into hoffmation_schema."ShutterDeviceData" ("deviceID", "position", "date", "desiredPosition")
values ('${device.id}', ${currentLevel}, '${new Date().toISOString()}', ${desiredLevel});
    `);
  }

  public persistTemperatureSensor(device: iTemperatureSensor): void {
    let roomTemp: number | null = device.roomTemperature;
    if (roomTemp === UNDEFINED_TEMP_VALUE) {
      roomTemp = null;
    }
    this.query(`
insert into hoffmation_schema."TemperatureSensorDeviceData" ("deviceID", "temperature", "date", "roomTemperature")
values ('${device.id}', ${device.iTemperature}, '${new Date().toISOString()}', ${roomTemp ?? 'null'});
    `);
  }

  public persistHumiditySensor(device: iHumiditySensor): void {
    this.query(`
insert into hoffmation_schema."HumiditySensorDeviceData" ("deviceID", "humidity", "date")
values ('${device.id}', ${device.humidity}, '${new Date().toISOString()}');
    `);
  }

  public persistBatteryDevice(device: iBatteryDevice): void {
    this.query(`
insert into hoffmation_schema."BatteryDeviceData" ("deviceID", "battery", "date")
values ('${device.id}', ${Utils.round(device.battery, 1)}, '${new Date().toISOString()}');
    `);
  }

  public persistZigbeeDevice(device: ZigbeeDevice): void {
    const dateValue = device.lastUpdate.getTime() > 0 ? `'${device.lastUpdate.toISOString()}'` : 'null';
    this.query(`
insert into hoffmation_schema."ZigbeeDeviceData" ("deviceID", "date", "available", "linkQuality", "lastUpdate")
values ('${device.id}', '${new Date().toISOString()}', ${device.available}, ${device.linkQuality}, ${dateValue});
    `);
  }

  public persistIlluminationSensor(device: iIlluminationSensor): void {
    this.query(`
insert into hoffmation_schema."IlluminationSensorDeviceData" ("deviceID", "illumination", "date")
values ('${device.id}', ${device.currentIllumination}, '${new Date().toISOString()}');`);
  }

  public persistShutterCalibration(_data: ShutterCalibration): void {
    ServerLogService.writeLog(LogLevel.Warn, `Postgres doesn't support Shutter Calibration yet.`);
  }

  public persistEnergyManager(calc: EnergyCalculation): void {
    this.query(`
insert into hoffmation_schema."EnergyCalculation" ("startDate", "endDate", "selfConsumedKwH", "injectedKwH",
                                                   "drawnKwH")
values ('${new Date(calc.startMs).toISOString()}','${new Date(calc.endMs).toISOString()}',
        ${calc.selfConsumedKwH}, ${calc.injectedKwH}, ${calc.drawnKwH});
    `);
  }

  public persistSettings(id: string, settings: string, customname: string): void {
    this.query(`
insert into hoffmation_schema."Settings" (id, settings, customname, date)
values ('${id}','${settings}','${customname}', '${new Date().toISOString()}')
    ON CONFLICT (id, date)
    DO UPDATE SET
        settings = '${settings}',
        customname = '${customname}'
;
    `);
  }

  public async loadSettings(id: string): Promise<string | undefined> {
    const dbResult: idSettings[] | null = await this.query<idSettings>(
      `SELECT settings, id, date
from hoffmation_schema."Settings" 
WHERE "id" = '${id}'
ORDER BY "date" DESC
LIMIT 1`,
    );
    if (dbResult !== null && dbResult.length > 0) {
      return dbResult[0].settings;
    }

    ServerLogService.writeLog(LogLevel.Info, `No persisted settings for ${id} found`);
    return undefined;
  }

  private async query<T extends QueryResultRow>(query: string): Promise<T[] | null> {
    if (!this.isPsqlReady()) {
      return null;
    }
    return new Promise<T[] | null>((resolve) => {
      this.psql
        .query<T>(query)
        .then((result) => {
          resolve(result.rows);
        })
        .catch((r) => {
          ServerLogService.writeLog(LogLevel.Warn, `Postgres Query failed: ${r}`);
          ServerLogService.writeLog(LogLevel.Debug, `Query: ${query}`);
          resolve(null);
        });
    });
  }

  private isPsqlReady() {
    if (!this.initialized) {
      ServerLogService.writeLog(LogLevel.Warn, `Db is not yet initialized`);
      return false;
    }
    if (!this.psql) {
      ServerLogService.writeLog(LogLevel.Error, `PSQL client missing`);
      return false;
    }
    return true;
  }
}
