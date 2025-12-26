import type { Command } from '@/commands/command';
import type { Request } from '@/requests/request';
import type { AnyEditPolicy } from '@/policies/edit-policy';
import type { ValidationFeedback } from '@/policies/validation-feedback';

export type PolicyResult = Command | ValidationFeedback | null;

export interface Part<TModel = unknown> {
  readonly model: TModel;
  readonly parent: Part | null;
  readonly children: readonly Part[];
  readonly editPolicies: readonly AnyEditPolicy[];

  installEditPolicy: (policy: AnyEditPolicy) => void;
  uninstallEditPolicy: (policy: AnyEditPolicy) => void;
  performRequest: (request: Request) => PolicyResult;
  addChild: (child: Part) => void;
  removeChild: (child: Part) => void;
}
