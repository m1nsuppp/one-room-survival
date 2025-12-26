import type { Command } from '@/commands/command';
import type { Request } from '@/requests/request';
import type { EditPolicy } from '@/policies/edit-policy';
import type { ValidationFeedback } from '@/policies/validation-feedback';

export type PolicyResult = Command | ValidationFeedback | null;

export interface Part<TModel = unknown> {
  readonly model: TModel;
  readonly parent: Part | null;
  readonly children: readonly Part[];
  readonly editPolicies: ReadonlyArray<EditPolicy<Request, Command>>;

  installEditPolicy: (policy: EditPolicy<Request, Command>) => void;
  uninstallEditPolicy: (policy: EditPolicy<Request, Command>) => void;
  performRequest: (request: Request) => PolicyResult;
  addChild: (child: Part) => void;
  removeChild: (child: Part) => void;
}
