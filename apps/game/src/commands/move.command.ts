import type { Command } from './command';

interface MoveCommandContext {
  updateFurniturePosition: (id: string, x: number, z: number) => void;
}

interface MoveCommandParams {
  furnitureId: string;
  fromX: number;
  fromZ: number;
  toX: number;
  toZ: number;
  context: MoveCommandContext;
}

export class MoveCommand implements Command {
  private readonly furnitureId: string;
  private readonly fromX: number;
  private readonly fromZ: number;
  private readonly toX: number;
  private readonly toZ: number;
  private readonly context: MoveCommandContext;

  constructor(params: MoveCommandParams) {
    this.furnitureId = params.furnitureId;
    this.fromX = params.fromX;
    this.fromZ = params.fromZ;
    this.toX = params.toX;
    this.toZ = params.toZ;
    this.context = params.context;
  }

  execute(): void {
    this.context.updateFurniturePosition(this.furnitureId, this.toX, this.toZ);
  }

  undo(): void {
    this.context.updateFurniturePosition(
      this.furnitureId,
      this.fromX,
      this.fromZ
    );
  }

  getDescription(): string {
    return `이동: (${this.fromX.toFixed(1)}, ${this.fromZ.toFixed(1)}) → (${this.toX.toFixed(1)}, ${this.toZ.toFixed(1)})`;
  }
}
