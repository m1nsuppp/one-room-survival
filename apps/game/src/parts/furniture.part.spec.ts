/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { FurniturePartImpl } from './furniture.part';
import type { Furniture } from '@/models/furniture.model';

describe('FurniturePartImpl', () => {
  const createTestFurniture = (): Furniture => ({
    id: 'bed-1',
    type: 'bed',
    width: 1.0,
    depth: 2.0,
    height: 0.45,
    x: 0.6,
    z: 1.5,
    rotation: '0',
  });

  describe('constructor', () => {
    it('should create a FurniturePart with the given furniture model', () => {
      const furniture = createTestFurniture();
      const part = new FurniturePartImpl(furniture);

      expect(part.model).toBe(furniture);
      expect(part.id).toBe('bed-1');
    });
  });

  describe('id', () => {
    it('should return the furniture id', () => {
      const furniture = createTestFurniture();
      const part = new FurniturePartImpl(furniture);

      expect(part.id).toBe(furniture.id);
    });
  });

  describe('isSelected', () => {
    it('should default to false', () => {
      const part = new FurniturePartImpl(createTestFurniture());

      expect(part.isSelected).toBe(false);
    });

    it('should be settable via setSelected', () => {
      const part = new FurniturePartImpl(createTestFurniture());

      part.setSelected(true);
      expect(part.isSelected).toBe(true);

      part.setSelected(false);
      expect(part.isSelected).toBe(false);
    });

    it('should be settable via property', () => {
      const part = new FurniturePartImpl(createTestFurniture());

      part.isSelected = true;
      expect(part.isSelected).toBe(true);
    });
  });

  describe('isDragging', () => {
    it('should default to false', () => {
      const part = new FurniturePartImpl(createTestFurniture());

      expect(part.isDragging).toBe(false);
    });

    it('should be settable via setDragging', () => {
      const part = new FurniturePartImpl(createTestFurniture());

      part.setDragging(true);
      expect(part.isDragging).toBe(true);

      part.setDragging(false);
      expect(part.isDragging).toBe(false);
    });

    it('should be settable via property', () => {
      const part = new FurniturePartImpl(createTestFurniture());

      part.isDragging = true;
      expect(part.isDragging).toBe(true);
    });
  });

  describe('parent and children', () => {
    it('should have null parent by default', () => {
      const part = new FurniturePartImpl(createTestFurniture());

      expect(part.parent).toBeNull();
    });

    it('should have empty children by default', () => {
      const part = new FurniturePartImpl(createTestFurniture());

      expect(part.children).toEqual([]);
    });
  });

  describe('editPolicies', () => {
    it('should have empty editPolicies by default', () => {
      const part = new FurniturePartImpl(createTestFurniture());

      expect(part.editPolicies).toEqual([]);
    });
  });
});
