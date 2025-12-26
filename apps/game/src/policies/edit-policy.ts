import type { Command } from '@/commands/command';
import type { Request } from '@/requests/request';
import type { ValidationFeedback } from './validation-feedback';

export type { MoveRequest, RotateRequest } from '@/requests/request';

export interface EditPolicy<TRequest extends Request, TCommand extends Command> {
  understands: (request: Request) => request is TRequest;
  getCommand: (request: TRequest) => TCommand | ValidationFeedback;
}
