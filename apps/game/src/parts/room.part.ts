import type { Room } from '@/models/room.model';
import type { Part } from './part';
import { AbstractPart } from './abstract-part';
import type { FurniturePart } from './furniture.part';
import { FurniturePartImpl } from './furniture.part';
import { furnitureToAABB, checkAABBCollision } from '@/policies/furniture-edit.policy';

const HIT_TEST_TOLERANCE = 0.01;

export interface RoomPart extends Part<Room> {
  readonly furnitureParts: readonly FurniturePart[];
  getFurniturePartById: (furnitureId: string) => FurniturePart | undefined;
  findFurniturePartAt: (x: number, z: number) => FurniturePart | undefined;
}

export class RoomPartImpl extends AbstractPart<Room> implements RoomPart {
  get furnitureParts(): readonly FurniturePart[] {
    return this.children.filter(
      (child): child is FurniturePartImpl => child instanceof FurniturePartImpl,
    );
  }

  getFurniturePartById(furnitureId: string): FurniturePart | undefined {
    return this.furnitureParts.find((part) => part.id === furnitureId);
  }

  findFurniturePartAt(x: number, z: number): FurniturePart | undefined {
    const pointAABB = {
      minX: x - HIT_TEST_TOLERANCE,
      maxX: x + HIT_TEST_TOLERANCE,
      minZ: z - HIT_TEST_TOLERANCE,
      maxZ: z + HIT_TEST_TOLERANCE,
    };

    for (const part of this.furnitureParts) {
      const furnitureAABB = furnitureToAABB(part.model);
      if (checkAABBCollision(pointAABB, furnitureAABB)) {
        return part;
      }
    }

    return undefined;
  }
}
