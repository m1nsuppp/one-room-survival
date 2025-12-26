/**
 * @vitest-environment node
 */
import { describe, it, expect, vi } from 'vitest';
import { DragEditPolicy } from './drag-edit.policy';
import type { DragEditPolicyContext } from './drag-edit.policy';
import type { Room } from '@/models/room.model';
import type { Furniture } from '@/models/furniture.model';
import type { DragStartRequest, DragMoveRequest, DragEndRequest } from '@/requests/request';

describe('DragEditPolicy', () => {
  const createTestFurniture = (id: string, x: number, z: number): Furniture => ({
    id,
    type: 'bed',
    width: 1.0,
    depth: 2.0,
    height: 0.45,
    x,
    z,
    rotation: '0',
  });

  const createTestRoom = (furnitures: Furniture[] = []): Room => ({
    width: 4,
    depth: 4,
    height: 2.4,
    walls: [],
    furnitures,
  });

  const defaultRoom = createTestRoom([createTestFurniture('bed-1', 1, 1)]);

  const createMockContext = (): DragEditPolicyContext => ({
    updateFurniturePosition: vi.fn(),
    setDragging: vi.fn(),
    executeCommand: vi.fn(),
    setValidationFeedback: vi.fn(),
    clearValidationFeedback: vi.fn(),
  });

  describe('understands', () => {
    it('should return true for drag-start request', () => {
      const mockContext = createMockContext();
      const policy = new DragEditPolicy(mockContext);
      const request: DragStartRequest = {
        type: 'drag-start',
        room: defaultRoom,
        furnitureId: 'bed-1',
        pointerX: 0.5,
        pointerY: 0.5,
      };

      expect(policy.understands(request)).toBe(true);
    });

    it('should return true for drag-move request', () => {
      const mockContext = createMockContext();
      const policy = new DragEditPolicy(mockContext);
      const request: DragMoveRequest = {
        type: 'drag-move',
        furnitureId: 'bed-1',
        worldX: 1.0,
        worldZ: 2.0,
        offsetX: 0,
        offsetZ: 0,
      };

      expect(policy.understands(request)).toBe(true);
    });

    it('should return true for drag-end request', () => {
      const mockContext = createMockContext();
      const policy = new DragEditPolicy(mockContext);
      const request: DragEndRequest = {
        type: 'drag-end',
        room: defaultRoom,
        furnitureId: 'bed-1',
        startX: 1,
        startZ: 1,
        endX: 2,
        endZ: 2,
      };

      expect(policy.understands(request)).toBe(true);
    });

    it('should return false for move request', () => {
      const mockContext = createMockContext();
      const policy = new DragEditPolicy(mockContext);
      const request = { type: 'move' };

      expect(policy.understands(request)).toBe(false);
    });
  });

  describe('handleDragStart', () => {
    it('should set dragging to true', () => {
      const mockContext = createMockContext();
      const policy = new DragEditPolicy(mockContext);
      const request: DragStartRequest = {
        type: 'drag-start',
        room: defaultRoom,
        furnitureId: 'bed-1',
        pointerX: 0.5,
        pointerY: 0.5,
      };

      policy.getCommand(request);

      expect(mockContext.setDragging).toHaveBeenCalledWith(true);
    });
  });

  describe('handleDragMove', () => {
    it('should update furniture position with offset applied', () => {
      const mockContext = createMockContext();
      const policy = new DragEditPolicy(mockContext);

      const moveRequest: DragMoveRequest = {
        type: 'drag-move',
        furnitureId: 'bed-1',
        worldX: 2.5,
        worldZ: 2.5,
        offsetX: 0.5,
        offsetZ: 0.5,
      };
      policy.getCommand(moveRequest);

      // worldX - offsetX = 2.5 - 0.5 = 2.0, snapToGrid(2.0) = 2.0
      expect(mockContext.updateFurniturePosition).toHaveBeenCalledWith('bed-1', 2.0, 2.0);
    });

    it('should snap position to grid', () => {
      const mockContext = createMockContext();
      const policy = new DragEditPolicy(mockContext);

      const moveRequest: DragMoveRequest = {
        type: 'drag-move',
        furnitureId: 'bed-1',
        worldX: 2.35,
        worldZ: 2.74,
        offsetX: 0,
        offsetZ: 0,
      };
      policy.getCommand(moveRequest);

      // Grid size is 0.1 (10cm), so 2.35 -> 2.4, 2.74 -> 2.7
      expect(mockContext.updateFurniturePosition).toHaveBeenCalled();
      const [id, x, z] = (mockContext.updateFurniturePosition as ReturnType<typeof vi.fn>).mock.calls[0] as [string, number, number];
      expect(id).toBe('bed-1');
      expect(x).toBeCloseTo(2.4, 5);
      expect(z).toBeCloseTo(2.7, 5);
    });
  });

  describe('handleDragEnd', () => {
    it('should set dragging to false', () => {
      const mockContext = createMockContext();
      const policy = new DragEditPolicy(mockContext);

      const endRequest: DragEndRequest = {
        type: 'drag-end',
        room: defaultRoom,
        furnitureId: 'bed-1',
        startX: 1,
        startZ: 1,
        endX: 1,
        endZ: 1,
      };
      policy.getCommand(endRequest);

      expect(mockContext.setDragging).toHaveBeenCalledWith(false);
    });

    it('should return null when position unchanged', () => {
      const mockContext = createMockContext();
      const policy = new DragEditPolicy(mockContext);

      const endRequest: DragEndRequest = {
        type: 'drag-end',
        room: defaultRoom,
        furnitureId: 'bed-1',
        startX: 1,
        startZ: 1,
        endX: 1,
        endZ: 1,
      };
      const result = policy.getCommand(endRequest);

      expect(result).toBeNull();
    });

    it('should restore original position and validate move when position changed', () => {
      const mockContext = createMockContext();
      const policy = new DragEditPolicy(mockContext);

      const endRequest: DragEndRequest = {
        type: 'drag-end',
        room: defaultRoom,
        furnitureId: 'bed-1',
        startX: 1,
        startZ: 1,
        endX: 2,
        endZ: 2,
      };
      policy.getCommand(endRequest);

      // 원래 위치로 되돌림
      expect(mockContext.updateFurniturePosition).toHaveBeenCalledWith('bed-1', 1, 1);
    });

    it('should execute command when move is valid', () => {
      const mockContext = createMockContext();
      const policy = new DragEditPolicy(mockContext);

      const endRequest: DragEndRequest = {
        type: 'drag-end',
        room: defaultRoom,
        furnitureId: 'bed-1',
        startX: 1,
        startZ: 1,
        endX: 2,
        endZ: 2,
      };
      policy.getCommand(endRequest);

      expect(mockContext.clearValidationFeedback).toHaveBeenCalled();
      expect(mockContext.executeCommand).toHaveBeenCalled();
    });

    it('should set validation feedback when move is invalid', () => {
      const mockContext = createMockContext();
      const policy = new DragEditPolicy(mockContext);

      // 방 경계를 벗어나는 이동
      const endRequest: DragEndRequest = {
        type: 'drag-end',
        room: defaultRoom,
        furnitureId: 'bed-1',
        startX: 1,
        startZ: 1,
        endX: 10, // 방 너비(4)를 초과
        endZ: 2,
      };
      policy.getCommand(endRequest);

      expect(mockContext.setValidationFeedback).toHaveBeenCalled();
      expect(mockContext.executeCommand).not.toHaveBeenCalled();
    });
  });
});
