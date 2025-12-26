import type { Command } from './command';
import type { Rotation } from '@/models/furniture.model';

interface RotateCommandContext {
  updateFurnitureRotation: (id: string, rotation: Rotation) => void;
}

export class RotateCommand implements Command {
  constructor(
    private readonly furnitureId: string,
    private readonly fromRotation: Rotation,
    private readonly toRotation: Rotation,
    private readonly context: RotateCommandContext,
  ) {}

  execute(): void {
    this.context.updateFurnitureRotation(this.furnitureId, this.toRotation);
  }

  undo(): void {
    this.context.updateFurnitureRotation(this.furnitureId, this.fromRotation);
  }

  getDescription(): string {
    return `회전: ${this.fromRotation}° → ${this.toRotation}°`;
  }
}
