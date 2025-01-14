import { Utils } from '../../utils';
import { DimmerSettings } from './dimmerSettings';
import { iWledSettings } from '../../interfaces';
import { TimeOfDay } from '../../enums';
import { LampSetTimeBasedCommand, WledSetLightCommand } from '../../command';

export class WledSettings extends DimmerSettings implements iWledSettings {
  /**
   * @inheritDoc
   * @default false
   */
  public override dayOn: boolean = false;
  /**
   * @inheritDoc
   * @default 100
   */
  public override dayBrightness: number = 100;
  /**
   * @inheritDoc
   * @default true
   */
  public override dawnOn: boolean = true;
  /**
   * @inheritDoc
   * @default 50
   */
  public override dawnBrightness: number = 50;
  /**
   * @inheritDoc
   * @default true
   */
  public override duskOn: boolean = true;
  /**
   * @inheritDoc
   * @default 50
   */
  public override duskBrightness: number = 50;
  /**
   * @inheritDoc
   * @default true
   */
  public override nightOn: boolean = true;
  /**
   * @inheritDoc
   * @default 2
   */
  public override nightBrightness: number = 2;
  /**
   * The preset to use during the dawn
   * @default undefined (no preset)
   */
  public dawnPreset?: number;
  /**
   * The preset to use during the day
   * @default undefined (no preset)
   */
  public dayPreset?: number;
  /**
   * The preset to use during the dusk
   * @default undefined (no preset)
   */
  public duskPreset?: number;
  /**
   * The preset to use during the night
   * @default undefined (no preset)
   */
  public nightPreset?: number;

  public fromPartialObject(data: Partial<WledSettings>): void {
    this.dawnPreset = data.dawnPreset ?? this.dawnPreset;
    this.dayPreset = data.dayPreset ?? this.dayPreset;
    this.duskPreset = data.duskPreset ?? this.duskPreset;
    this.nightPreset = data.nightPreset ?? this.nightPreset;
    super.fromPartialObject(data);
  }

  public toJSON(): Partial<WledSettings> {
    return Utils.jsonFilter(this);
  }

  public buildWledSetLightCommand(c: LampSetTimeBasedCommand): WledSetLightCommand {
    switch (c.time) {
      case TimeOfDay.Daylight:
        return new WledSetLightCommand(
          c,
          this.dayOn,
          '',
          c.disableAutomaticCommand,
          this.dayBrightness,
          undefined,
          this.dayPreset,
        );
      case TimeOfDay.BeforeSunrise:
        return new WledSetLightCommand(
          c,
          this.dawnOn,
          '',
          c.disableAutomaticCommand,
          this.dawnBrightness,
          undefined,
          this.dawnPreset,
        );
      case TimeOfDay.AfterSunset:
        return new WledSetLightCommand(
          c,
          this.duskOn,
          '',
          c.disableAutomaticCommand,
          this.duskBrightness,
          undefined,
          this.duskPreset,
        );
      case TimeOfDay.Night:
        return new WledSetLightCommand(
          c,
          this.nightOn,
          '',
          c.disableAutomaticCommand,
          this.nightBrightness,
          undefined,
          this.nightPreset,
        );
      default:
        throw new Error(`TimeOfDay ${c.time} not supported`);
    }
  }
}
