import type { Command } from '@/commands/command';
import type { Rotation } from '@/models/furniture.model';
import type { ValidationFeedback } from './validation-feedback';

export interface EditPolicy<TRequest, TCommand extends Command> {
  getCommand: (request: TRequest) => TCommand | ValidationFeedback;
}

export interface MoveRequest {
  furnitureId: string;
  fromX: number;
  fromZ: number;
  toX: number;
  toZ: number;
}

export interface RotateRequest {
  furnitureId: string;
  fromRotation: Rotation;
  toRotation: Rotation;
}
