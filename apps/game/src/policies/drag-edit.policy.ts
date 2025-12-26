import type { Command } from '@/commands/command';
import type { EditPolicy } from './edit-policy';
import type { ValidationFeedback } from './validation-feedback';
import type { Room } from '@/models/room.model';
import type {
  Request,
  DragStartRequest,
  DragMoveRequest,
  DragEndRequest,
  MoveRequest,
} from '@/requests/request';
import { isDragStartRequest, isDragMoveRequest, isDragEndRequest } from '@/requests/request';
import { FurnitureMoveEditPolicy } from './furniture-edit.policy';
import { snapToGrid } from '@/utils/grid';
import { isValidationFeedback } from './validation-feedback';

export interface DragEditPolicyContext {
  getRoom: () => Room;
  updateFurniturePosition: (id: string, x: number, z: number) => void;
  setDragging: (isDragging: boolean) => void;
  executeCommand: (command: Command) => void;
  setValidationFeedback: (feedback: ValidationFeedback | null) => void;
  clearValidationFeedback: () => void;
}

interface DragState {
  furnitureId: string;
  startX: number;
  startZ: number;
  offsetX: number;
  offsetZ: number;
}

type DragRequest = DragStartRequest | DragMoveRequest | DragEndRequest;

// Null command for drag operations that don't produce a command
const NULL_RESULT = null as unknown as Command;

export class DragEditPolicy implements EditPolicy<DragRequest, Command> {
  private dragState: DragState | null = null;

  constructor(private readonly context: DragEditPolicyContext) {}

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  understands(request: Request): request is DragRequest {
    return isDragStartRequest(request) || isDragMoveRequest(request) || isDragEndRequest(request);
  }

  getCommand(request: DragRequest): Command | ValidationFeedback {
    if (isDragStartRequest(request)) {
      this.handleDragStart(request);
      return NULL_RESULT;
    }

    if (isDragMoveRequest(request)) {
      this.handleDragMove(request);
      return NULL_RESULT;
    }

    if (isDragEndRequest(request)) {
      return this.handleDragEnd(request);
    }

    return NULL_RESULT;
  }

  private handleDragStart(request: DragStartRequest): void {
    const room = this.context.getRoom();
    const furniture = room.furnitures.find((f) => f.id === request.furnitureId);
    if (furniture === undefined) {
      return;
    }

    this.dragState = {
      furnitureId: request.furnitureId,
      startX: furniture.x,
      startZ: furniture.z,
      offsetX: 0,
      offsetZ: 0,
    };

    this.context.setDragging(true);
  }

  setOffset(offsetX: number, offsetZ: number): void {
    if (this.dragState !== null) {
      this.dragState.offsetX = offsetX;
      this.dragState.offsetZ = offsetZ;
    }
  }

  private handleDragMove(request: DragMoveRequest): void {
    if (this.dragState === null) {
      return;
    }

    const newX = snapToGrid(request.worldX - this.dragState.offsetX);
    const newZ = snapToGrid(request.worldZ - this.dragState.offsetZ);

    this.context.updateFurniturePosition(this.dragState.furnitureId, newX, newZ);
  }

  private handleDragEnd(_request: DragEndRequest): Command | ValidationFeedback {
    if (this.dragState === null) {
      return NULL_RESULT;
    }

    const room = this.context.getRoom();
    const { furnitureId, startX, startZ } = this.dragState;
    const furniture = room.furnitures.find((f) => f.id === furnitureId);

    if (furniture === undefined) {
      this.cleanup();
      return NULL_RESULT;
    }

    const endX = furniture.x;
    const endZ = furniture.z;

    if (endX === startX && endZ === startZ) {
      this.cleanup();
      return NULL_RESULT;
    }

    this.context.updateFurniturePosition(furnitureId, startX, startZ);

    const movePolicy = new FurnitureMoveEditPolicy(room, {
      updateFurniturePosition: this.context.updateFurniturePosition,
    });

    const moveRequest: MoveRequest = {
      type: 'move',
      furnitureId,
      fromX: startX,
      fromZ: startZ,
      toX: endX,
      toZ: endZ,
    };

    const result = movePolicy.getCommand(moveRequest);

    if (isValidationFeedback(result)) {
      this.context.setValidationFeedback(result);
    } else {
      this.context.clearValidationFeedback();
      this.context.executeCommand(result);
    }

    this.cleanup();
    return result;
  }

  private cleanup(): void {
    this.dragState = null;
    this.context.setDragging(false);
  }

  isDragging(): boolean {
    return this.dragState !== null;
  }

  getDragState(): DragState | null {
    return this.dragState;
  }
}
