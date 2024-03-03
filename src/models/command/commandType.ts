export enum CommandType {
  ActuatorToggleCommand = 'ActuatorToggleCommand',
  ActuatorSetStateCommand = 'ActuatorSetStateCommand',
  ActuatorRestoreTargetAutomaticValueCommand = 'ActuatorRestoreTargetAutomaticValueCommand',
  FloorSetAllShuttersCommand = 'FloorSetAllShuttersCommand',
  LampSetLightCommand = 'LampSetLightCommand',
  RoomRestoreShutterPositionCommand = 'RoomRestoreShutterPositionCommand',
  ShutterSetLevelCommand = 'ShutterSetLevelCommand',
  ShutterSunriseUpCommand = 'ShutterSunriseUpCommand',
  SunsetDownCommand = 'SunsetDownCommand',
  WindowRestoreDesiredPositionCommand = 'WindowRestoreDesiredPositionCommand',
  WindowSetDesiredPositionCommand = 'WindowSetDesiredPositionCommand',
  WindowSetRolloByWeatherStatusCommand = 'WindowSetRolloByWeatherStatusCommand',
}
