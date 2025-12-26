import type { Command } from '@/commands/command';
import type { Request } from '@/requests/request';
import type { ValidationFeedback } from './validation-feedback';

export type { MoveRequest, RotateRequest } from '@/requests/request';

/**
 * Base interface for storing policies in Part.
 * Uses loose typing to allow policies with different request types.
 */
export interface AnyEditPolicy {
  understands: (request: Request) => boolean;
  getCommand: (request: Request) => Command | ValidationFeedback | null;
}

/**
 * Type-safe interface for implementing policies.
 * Use this when defining a specific policy implementation.
 *
 * Implementations should use understands() as a type guard before calling getCommand.
 */
export interface EditPolicy<TRequest extends Request, TCommand extends Command> {
  understands: (request: Request) => request is TRequest;
  getCommand: (request: TRequest) => TCommand | ValidationFeedback | null;
}
