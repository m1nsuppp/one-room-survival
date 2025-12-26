import type { Rotation } from '@/models/furniture.model';
import type { Room } from '@/models/room.model';

export interface Request {
  readonly type: string;
}

export interface DragStartRequest extends Request {
  readonly type: 'drag-start';
  readonly room: Room;
  readonly furnitureId: string;
  readonly pointerX: number;
  readonly pointerY: number;
}

export interface DragMoveRequest extends Request {
  readonly type: 'drag-move';
  readonly furnitureId: string;
  readonly worldX: number;
  readonly worldZ: number;
}

export interface DragEndRequest extends Request {
  readonly type: 'drag-end';
  readonly room: Room;
  readonly furnitureId: string;
}

export interface MoveRequest extends Request {
  readonly type: 'move';
  readonly furnitureId: string;
  readonly fromX: number;
  readonly fromZ: number;
  readonly toX: number;
  readonly toZ: number;
}

export interface RotateRequest extends Request {
  readonly type: 'rotate';
  readonly furnitureId: string;
  readonly fromRotation: Rotation;
  readonly toRotation: Rotation;
}

export interface SelectionRequest extends Request {
  readonly type: 'selection';
  readonly furnitureId: string | null;
}

export type DragRequest = DragStartRequest | DragMoveRequest | DragEndRequest;

export function isDragStartRequest(request: Request): request is DragStartRequest {
  return request.type === 'drag-start';
}

export function isDragMoveRequest(request: Request): request is DragMoveRequest {
  return request.type === 'drag-move';
}

export function isDragEndRequest(request: Request): request is DragEndRequest {
  return request.type === 'drag-end';
}

export function isMoveRequest(request: Request): request is MoveRequest {
  return request.type === 'move';
}

export function isRotateRequest(request: Request): request is RotateRequest {
  return request.type === 'rotate';
}

export function isSelectionRequest(request: Request): request is SelectionRequest {
  return request.type === 'selection';
}
