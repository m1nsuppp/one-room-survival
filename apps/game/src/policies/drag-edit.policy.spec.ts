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

  const createMockContext = (): DragEditPolicyContext => {
    const room = createTestRoom([createTestFurniture('bed-1', 1, 1)]);

    return {
      getRoom: () => room,
      updateFurniturePosition: vi.fn(),
      setDragging: vi.fn(),
      executeCommand: vi.fn(),
      setValidationFeedback: vi.fn(),
      clearValidationFeedback: vi.fn(),
    };
  };

  describe('understands', () => {
    it('should return true for drag-start request', () => {
      const mockContext = createMockContext();
      const policy = new DragEditPolicy(mockContext);
      const request: DragStartRequest = {
        type: 'drag-start',
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
      };

      expect(policy.understands(request)).toBe(true);
    });

    it('should return true for drag-end request', () => {
      const mockContext = createMockContext();
      const policy = new DragEditPolicy(mockContext);
      const request: DragEndRequest = {
        type: 'drag-end',
        furnitureId: 'bed-1',
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
    it('should initialize drag state and set dragging to true', () => {
      const mockContext = createMockContext();
      const policy = new DragEditPolicy(mockContext);
      const request: DragStartRequest = {
        type: 'drag-start',
        furnitureId: 'bed-1',
        pointerX: 0.5,
        pointerY: 0.5,
      };

      policy.getCommand(request);

      expect(mockContext.setDragging).toHaveBeenCalledWith(true);
      expect(policy.isDragging()).toBe(true);
    });

    it('should not initialize drag state for non-existent furniture', () => {
      const mockContext = createMockContext();
      const policy = new DragEditPolicy(mockContext);
      const request: DragStartRequest = {
        type: 'drag-start',
        furnitureId: 'non-existent',
        pointerX: 0.5,
        pointerY: 0.5,
      };

      policy.getCommand(request);

      expect(mockContext.setDragging).not.toHaveBeenCalled();
      expect(policy.isDragging()).toBe(false);
    });
  });

  describe('handleDragMove', () => {
    it('should update furniture position when dragging', () => {
      const mockContext = createMockContext();
      const policy = new DragEditPolicy(mockContext);

      const startRequest: DragStartRequest = {
        type: 'drag-start',
        furnitureId: 'bed-1',
        pointerX: 0.5,
        pointerY: 0.5,
      };
      policy.getCommand(startRequest);
      policy.setOffset(0, 0);

      const moveRequest: DragMoveRequest = {
        type: 'drag-move',
        furnitureId: 'bed-1',
        worldX: 2.0,
        worldZ: 2.0,
      };
      policy.getCommand(moveRequest);

      expect(mockContext.updateFurniturePosition).toHaveBeenCalledWith('bed-1', 2.0, 2.0);
    });

    it('should not update position when not dragging', () => {
      const mockContext = createMockContext();
      const policy = new DragEditPolicy(mockContext);

      const moveRequest: DragMoveRequest = {
        type: 'drag-move',
        furnitureId: 'bed-1',
        worldX: 2.0,
        worldZ: 2.0,
      };
      policy.getCommand(moveRequest);

      expect(mockContext.updateFurniturePosition).not.toHaveBeenCalled();
    });
  });

  describe('handleDragEnd', () => {
    it('should cleanup drag state when ending drag', () => {
      const mockContext = createMockContext();
      const policy = new DragEditPolicy(mockContext);

      const startRequest: DragStartRequest = {
        type: 'drag-start',
        furnitureId: 'bed-1',
        pointerX: 0.5,
        pointerY: 0.5,
      };
      policy.getCommand(startRequest);

      const endRequest: DragEndRequest = {
        type: 'drag-end',
        furnitureId: 'bed-1',
      };
      policy.getCommand(endRequest);

      expect(mockContext.setDragging).toHaveBeenCalledWith(false);
      expect(policy.isDragging()).toBe(false);
    });

    it('should not do anything when not dragging', () => {
      const mockContext = createMockContext();
      const policy = new DragEditPolicy(mockContext);

      const endRequest: DragEndRequest = {
        type: 'drag-end',
        furnitureId: 'bed-1',
      };
      policy.getCommand(endRequest);

      expect(mockContext.setDragging).not.toHaveBeenCalled();
    });
  });

  describe('getDragState', () => {
    it('should return null when not dragging', () => {
      const mockContext = createMockContext();
      const policy = new DragEditPolicy(mockContext);

      expect(policy.getDragState()).toBeNull();
    });

    it('should return drag state when dragging', () => {
      const mockContext = createMockContext();
      const policy = new DragEditPolicy(mockContext);
      const request: DragStartRequest = {
        type: 'drag-start',
        furnitureId: 'bed-1',
        pointerX: 0.5,
        pointerY: 0.5,
      };

      policy.getCommand(request);

      const state = policy.getDragState();
      expect(state).not.toBeNull();
      expect(state?.furnitureId).toBe('bed-1');
      expect(state?.startX).toBe(1);
      expect(state?.startZ).toBe(1);
    });
  });
});
