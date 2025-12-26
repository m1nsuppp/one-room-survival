/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import type { Room } from '@/models/room.model';
import {
  isDragStartRequest,
  isDragMoveRequest,
  isDragEndRequest,
  isMoveRequest,
  isRotateRequest,
  isSelectionRequest,
  type Request,
  type DragStartRequest,
  type DragMoveRequest,
  type DragEndRequest,
  type MoveRequest,
  type RotateRequest,
  type SelectionRequest,
} from './request';

describe('Request type guards', () => {
  const mockRoom: Room = {
    width: 4,
    depth: 4,
    height: 2.4,
    walls: [],
    furnitures: [],
  };

  describe('isDragStartRequest', () => {
    it('should return true for drag-start request', () => {
      const request: DragStartRequest = {
        type: 'drag-start',
        room: mockRoom,
        furnitureId: 'bed-1',
        pointerX: 0.5,
        pointerY: 0.5,
      };
      expect(isDragStartRequest(request)).toBe(true);
    });

    it('should return false for other request types', () => {
      const request: Request = { type: 'drag-move' };
      expect(isDragStartRequest(request)).toBe(false);
    });
  });

  describe('isDragMoveRequest', () => {
    it('should return true for drag-move request', () => {
      const request: DragMoveRequest = {
        type: 'drag-move',
        furnitureId: 'bed-1',
        worldX: 1.0,
        worldZ: 2.0,
      };
      expect(isDragMoveRequest(request)).toBe(true);
    });

    it('should return false for other request types', () => {
      const request: Request = { type: 'drag-start' };
      expect(isDragMoveRequest(request)).toBe(false);
    });
  });

  describe('isDragEndRequest', () => {
    it('should return true for drag-end request', () => {
      const request: DragEndRequest = {
        type: 'drag-end',
        room: mockRoom,
        furnitureId: 'bed-1',
      };
      expect(isDragEndRequest(request)).toBe(true);
    });

    it('should return false for other request types', () => {
      const request: Request = { type: 'move' };
      expect(isDragEndRequest(request)).toBe(false);
    });
  });

  describe('isMoveRequest', () => {
    it('should return true for move request', () => {
      const request: MoveRequest = {
        type: 'move',
        furnitureId: 'bed-1',
        fromX: 0,
        fromZ: 0,
        toX: 1,
        toZ: 1,
      };
      expect(isMoveRequest(request)).toBe(true);
    });

    it('should return false for other request types', () => {
      const request: Request = { type: 'rotate' };
      expect(isMoveRequest(request)).toBe(false);
    });
  });

  describe('isRotateRequest', () => {
    it('should return true for rotate request', () => {
      const request: RotateRequest = {
        type: 'rotate',
        furnitureId: 'bed-1',
        fromRotation: '0',
        toRotation: '90',
      };
      expect(isRotateRequest(request)).toBe(true);
    });

    it('should return false for other request types', () => {
      const request: Request = { type: 'selection' };
      expect(isRotateRequest(request)).toBe(false);
    });
  });

  describe('isSelectionRequest', () => {
    it('should return true for selection request', () => {
      const request: SelectionRequest = {
        type: 'selection',
        furnitureId: 'bed-1',
      };
      expect(isSelectionRequest(request)).toBe(true);
    });

    it('should return true for selection request with null furnitureId', () => {
      const request: SelectionRequest = {
        type: 'selection',
        furnitureId: null,
      };
      expect(isSelectionRequest(request)).toBe(true);
    });

    it('should return false for other request types', () => {
      const request: Request = { type: 'drag-start' };
      expect(isSelectionRequest(request)).toBe(false);
    });
  });
});
