export enum CommandType {
  ActuatorChangeAction = 'ActuatorChangeAction',
  BatteryManagerLevelChangeAction = 'BatteryManagerLevelChangeAction',
  BlockAutomaticLiftBlockCommand = 'BlockAutomaticLiftBlockCommand',
  BlockAutomaticCommand = 'BlockAutomaticCommand',
  BlockAutomaticUntilCommand = 'BlockAutomaticUntilCommand',
  ActuatorToggleCommand = 'ActuatorToggleCommand',
  ActuatorSetStateCommand = 'ActuatorSetStateCommand',
  ActuatorRestoreTargetAutomaticValueCommand = 'ActuatorRestoreTargetAutomaticValueCommand',
  ActuatorWriteStateToDeviceCommand = 'ActuatorWriteStateToDeviceCommand',
  DimmerSetLightCommand = 'DimmerSetLightCommand',
  FloorSetAllShuttersCommand = 'FloorSetAllShuttersCommand',
  HumiditySensorChangeAction = 'HumiditySensorChangeAction',
  LampSetLightCommand = 'LampSetLightCommand',
  LampSetTimeBasedCommand = 'LampSetTimeBasedCommand',
  LampToggleLightCommand = 'LampToggleLightCommand',
  LedSetLightCommand = 'LedSetLightCommand',
  LightGroupSwitchTimeConditional = 'LightGroupSwitchTimeConditional',
  MotionSensorAction = 'MotionSensorAction',
  PresenceGroupAnyMovementAction = 'PresenceGroupAnyMovementAction',
  PresenceGroupFirstEnterAction = 'PresenceGroupFirstEnterAction',
  PresenceGroupLastLeftAction = 'PresenceGroupLastLeftAction',
  RoomRestoreShutterPositionCommand = 'RoomRestoreShutterPositionCommand',
  RoomRestoreLightCommand = 'RoomRestoreLightCommand',
  RoomSetLightTimeBasedCommand = 'RoomSetLightTimeBasedCommand',
  ShutterPositionChangedAction = 'ShutterPositionChangedAction',
  ShutterSetLevelCommand = 'ShutterSetLevelCommand',
  ShutterSunriseUpCommand = 'ShutterSunriseUpCommand',
  SunsetDownCommand = 'SunsetDownCommand',
  TemperatureSensorChangeAction = 'TemperatureSensorChangeAction',
  HandleChangedAction = 'HandleChangedAction',
  WindowRestoreDesiredPositionCommand = 'WindowRestoreDesiredPositionCommand',
  WindowSetDesiredPositionCommand = 'WindowSetDesiredPositionCommand',
  WindowSetRolloByWeatherStatusCommand = 'WindowSetRolloByWeatherStatusCommand',
  WledSetLightCommand = 'WledSetLightCommand',
}