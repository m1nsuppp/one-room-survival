import type { Room } from '@/models/room.model';
import type { Wall } from '@/models/wall.model';

const WALL_THICKNESS = 0.1;

function createRectangularWalls(width: number, depth: number): Wall[] {
  return [
    {
      id: 'north',
      side: 'north',
      start: { x: 0, z: 0 },
      end: { x: width, z: 0 },
      thickness: WALL_THICKNESS,
    },
    {
      id: 'south',
      side: 'south',
      start: { x: 0, z: depth },
      end: { x: width, z: depth },
      thickness: WALL_THICKNESS,
    },
    {
      id: 'east',
      side: 'east',
      start: { x: width, z: 0 },
      end: { x: width, z: depth },
      thickness: WALL_THICKNESS,
    },
    {
      id: 'west',
      side: 'west',
      start: { x: 0, z: 0 },
      end: { x: 0, z: depth },
      thickness: WALL_THICKNESS,
    },
  ];
}

/** 한국 주거용 건축물 표준 천장 높이 (m) */
const STANDARD_CEILING_HEIGHT_M = 2.4;

/** 5평 원룸 (4m x 4m = 16㎡) */
export const sampleRoom: Room = {
  width: 4,
  depth: 4,
  height: STANDARD_CEILING_HEIGHT_M,
  walls: createRectangularWalls(4, 4),
};
