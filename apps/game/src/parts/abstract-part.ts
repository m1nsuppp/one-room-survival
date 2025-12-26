import type { Request } from '@/requests/request';
import type { AnyEditPolicy } from '@/policies/edit-policy';
import type { Part, PolicyResult } from './part';

export abstract class AbstractPart<TModel> implements Part<TModel> {
  private _parent: Part | null = null;
  private readonly _children: Part[] = [];
  private readonly _editPolicies: AnyEditPolicy[] = [];

  constructor(private readonly _model: TModel) {}

  get model(): TModel {
    return this._model;
  }

  get parent(): Part | null {
    return this._parent;
  }

  get children(): readonly Part[] {
    return this._children;
  }

  get editPolicies(): readonly AnyEditPolicy[] {
    return this._editPolicies;
  }

  installEditPolicy(policy: AnyEditPolicy): void {
    this._editPolicies.push(policy);
  }

  uninstallEditPolicy(policy: AnyEditPolicy): void {
    const index = this._editPolicies.indexOf(policy);
    if (index >= 0) {
      this._editPolicies.splice(index, 1);
    }
  }

  performRequest(request: Request): PolicyResult {
    for (const policy of this._editPolicies) {
      if (policy.understands(request)) {
        return policy.getCommand(request);
      }
    }

    return null;
  }

  protected setParent(parent: Part | null): void {
    this._parent = parent;
  }

  addChild(child: Part): void {
    this._children.push(child);
    if (child instanceof AbstractPart) {
      child.setParent(this);
    }
  }

  removeChild(child: Part): void {
    const index = this._children.indexOf(child);
    if (index >= 0) {
      this._children.splice(index, 1);
      if (child instanceof AbstractPart) {
        child.setParent(null);
      }
    }
  }
}
