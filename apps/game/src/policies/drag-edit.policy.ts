import type { Command } from '@/commands/command';
import type { EditPolicy } from './edit-policy';
import type { ValidationFeedback } from './validation-feedback';
import type {
  Request,
  DragStartRequest,
  DragMoveRequest,
  DragEndRequest,
} from '@/requests/request';
import { isDragStartRequest, isDragMoveRequest, isDragEndRequest } from '@/requests/request';
import { FurnitureMoveEditPolicy } from './furniture-edit.policy';
import { snapToGrid } from '@/utils/grid';
import { isValidationFeedback } from './validation-feedback';

export interface DragEditPolicyContext {
  updateFurniturePosition: (id: string, x: number, z: number) => void;
  setDragging: (isDragging: boolean) => void;
  executeCommand: (command: Command) => void;
  setValidationFeedback: (feedback: ValidationFeedback | null) => void;
  clearValidationFeedback: () => void;
}

type DragRequest = DragStartRequest | DragMoveRequest | DragEndRequest;

export class DragEditPolicy implements EditPolicy<DragRequest, Command> {
  constructor(private readonly context: DragEditPolicyContext) {}

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this -- EditPolicy 인터페이스 구현을 위해 인스턴스 메서드로 유지
  understands(request: Request): request is DragRequest {
    return isDragStartRequest(request) || isDragMoveRequest(request) || isDragEndRequest(request);
  }

  getCommand(request: DragRequest): Command | ValidationFeedback | null {
    if (isDragStartRequest(request)) {
      this.handleDragStart();
      return null;
    }

    if (isDragMoveRequest(request)) {
      this.handleDragMove(request);
      return null;
    }

    if (isDragEndRequest(request)) {
      return this.handleDragEnd(request);
    }

    return null;
  }

  private handleDragStart(): void {
    this.context.setDragging(true);
  }

  private handleDragMove(request: DragMoveRequest): void {
    const newX = snapToGrid(request.worldX - request.offsetX);
    const newZ = snapToGrid(request.worldZ - request.offsetZ);

    this.context.updateFurniturePosition(request.furnitureId, newX, newZ);
  }

  private handleDragEnd(request: DragEndRequest): Command | ValidationFeedback | null {
    const { room, furnitureId, startX, startZ, endX, endZ } = request;

    this.context.setDragging(false);

    // 위치가 변경되지 않은 경우
    if (endX === startX && endZ === startZ) {
      return null;
    }

    // 원래 위치로 되돌림 (검증 전)
    this.context.updateFurniturePosition(furnitureId, startX, startZ);

    const movePolicy = new FurnitureMoveEditPolicy({
      updateFurniturePosition: this.context.updateFurniturePosition,
    });

    const moveRequest = {
      type: 'move' as const,
      room,
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

    return result;
  }
}
