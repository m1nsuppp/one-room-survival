/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { RoomPartImpl } from './room.part';
import { FurniturePartImpl } from './furniture.part';
import type { Room } from '@/models/room.model';
import type { Furniture } from '@/models/furniture.model';

describe('RoomPartImpl', () => {
  const createTestRoom = (): Room => ({
    width: 4,
    depth: 4,
    height: 2.4,
    walls: [],
    furnitures: [],
  });

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

  describe('constructor', () => {
    it('should create a RoomPart with the given room model', () => {
      const room = createTestRoom();
      const part = new RoomPartImpl(room);

      expect(part.model).toBe(room);
    });
  });

  describe('furnitureParts', () => {
    it('should return empty array when no children', () => {
      const room = createTestRoom();
      const part = new RoomPartImpl(room);

      expect(part.furnitureParts).toEqual([]);
    });

    it('should return furniture parts that were added as children', () => {
      const room = createTestRoom();
      const roomPart = new RoomPartImpl(room);

      const furniture1 = createTestFurniture('bed-1', 1, 1);
      const furniture2 = createTestFurniture('desk-1', 2, 2);

      const furniturePart1 = new FurniturePartImpl(furniture1);
      const furniturePart2 = new FurniturePartImpl(furniture2);

      roomPart.addChild(furniturePart1);
      roomPart.addChild(furniturePart2);

      expect(roomPart.furnitureParts).toHaveLength(2);
      expect(roomPart.furnitureParts[0]).toBe(furniturePart1);
      expect(roomPart.furnitureParts[1]).toBe(furniturePart2);
    });
  });

  describe('getFurniturePartById', () => {
    it('should return undefined when no furniture parts exist', () => {
      const room = createTestRoom();
      const part = new RoomPartImpl(room);

      expect(part.getFurniturePartById('bed-1')).toBeUndefined();
    });

    it('should return the furniture part with matching id', () => {
      const room = createTestRoom();
      const roomPart = new RoomPartImpl(room);

      const furniture = createTestFurniture('bed-1', 1, 1);
      const furniturePart = new FurniturePartImpl(furniture);
      roomPart.addChild(furniturePart);

      expect(roomPart.getFurniturePartById('bed-1')).toBe(furniturePart);
    });

    it('should return undefined when id does not match', () => {
      const room = createTestRoom();
      const roomPart = new RoomPartImpl(room);

      const furniture = createTestFurniture('bed-1', 1, 1);
      const furniturePart = new FurniturePartImpl(furniture);
      roomPart.addChild(furniturePart);

      expect(roomPart.getFurniturePartById('desk-1')).toBeUndefined();
    });
  });

  describe('findFurniturePartAt', () => {
    it('should return undefined when no furniture parts exist', () => {
      const room = createTestRoom();
      const part = new RoomPartImpl(room);

      expect(part.findFurniturePartAt(1, 1)).toBeUndefined();
    });

    it('should return the furniture part at the given position', () => {
      const room = createTestRoom();
      const roomPart = new RoomPartImpl(room);

      const furniture = createTestFurniture('bed-1', 1, 1);
      const furniturePart = new FurniturePartImpl(furniture);
      roomPart.addChild(furniturePart);

      expect(roomPart.findFurniturePartAt(1, 1)).toBe(furniturePart);
    });

    it('should return undefined when position is outside all furniture', () => {
      const room = createTestRoom();
      const roomPart = new RoomPartImpl(room);

      const furniture = createTestFurniture('bed-1', 1, 1);
      const furniturePart = new FurniturePartImpl(furniture);
      roomPart.addChild(furniturePart);

      expect(roomPart.findFurniturePartAt(3, 3)).toBeUndefined();
    });
  });

  describe('addChild and removeChild', () => {
    it('should add child and set parent', () => {
      const room = createTestRoom();
      const roomPart = new RoomPartImpl(room);

      const furniture = createTestFurniture('bed-1', 1, 1);
      const furniturePart = new FurniturePartImpl(furniture);

      roomPart.addChild(furniturePart);

      expect(roomPart.children).toContain(furniturePart);
      expect(furniturePart.parent).toBe(roomPart);
    });

    it('should remove child and clear parent', () => {
      const room = createTestRoom();
      const roomPart = new RoomPartImpl(room);

      const furniture = createTestFurniture('bed-1', 1, 1);
      const furniturePart = new FurniturePartImpl(furniture);

      roomPart.addChild(furniturePart);
      roomPart.removeChild(furniturePart);

      expect(roomPart.children).not.toContain(furniturePart);
      expect(furniturePart.parent).toBeNull();
    });
  });
});
