import { BaseAction } from './baseAction.js';
import { CommandType } from '../command/index.js';

export class PresenceGroupAnyMovementAction extends BaseAction {
  /** @inheritDoc */
  public type = CommandType.PresenceGroupAnyMovementAction;

  public constructor(source?: BaseAction, reason?: string) {
    super(source, reason);
  }
}
