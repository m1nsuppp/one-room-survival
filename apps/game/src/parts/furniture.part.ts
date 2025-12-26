import type { Furniture } from '@/models/furniture.model';
import type { Part } from './part';
import { AbstractPart } from './abstract-part';

export interface FurniturePart extends Part<Furniture> {
  readonly id: string;
  isSelected: boolean;
  isDragging: boolean;
  setSelected: (selected: boolean) => void;
  setDragging: (dragging: boolean) => void;
}

export class FurniturePartImpl extends AbstractPart<Furniture> implements FurniturePart {
  private _isSelected: boolean;
  private _isDragging: boolean;

  constructor(furniture: Furniture, isSelected = false, isDragging = false) {
    super(furniture);
    this._isSelected = isSelected;
    this._isDragging = isDragging;
  }

  get id(): string {
    return this.model.id;
  }

  get isSelected(): boolean {
    return this._isSelected;
  }

  set isSelected(value: boolean) {
    this._isSelected = value;
  }

  get isDragging(): boolean {
    return this._isDragging;
  }

  set isDragging(value: boolean) {
    this._isDragging = value;
  }

  setSelected(selected: boolean): void {
    this._isSelected = selected;
  }

  setDragging(dragging: boolean): void {
    this._isDragging = dragging;
  }
}
