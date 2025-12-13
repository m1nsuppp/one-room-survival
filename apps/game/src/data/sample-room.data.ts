import type { Door } from '@/models/door.model';
import type { Room } from '@/models/room.model';
import type { Wall } from '@/models/wall.model';
import type { Window } from '@/models/window.model';

const WALL_THICKNESS = 0.1;

/** 표준 창문 하단 높이 (m) */
const STANDARD_SILL_HEIGHT_M = 0.9;

/** 표준 실내문 너비 (m) */
const STANDARD_DOOR_WIDTH_M = 0.9;

function createRectangularWalls(width: number, depth: number): Wall[] {
  const southWindow: Window = {
    id: 'south-window-1',
    position: 0.5,
    width: 1.8,
    height: 1.2,
    sillHeight: STANDARD_SILL_HEIGHT_M,
  };

  const northDoor: Door = {
    id: 'north-door-1',
    position: 0.5,
    width: STANDARD_DOOR_WIDTH_M,
    height: 2.1,
  };

  return [
    {
      id: 'north',
      side: 'north',
      start: { x: 0, z: 0 },
      end: { x: width, z: 0 },
      thickness: WALL_THICKNESS,
      doors: [northDoor],
    },
    {
      id: 'south',
      side: 'south',
      start: { x: 0, z: depth },
      end: { x: width, z: depth },
      thickness: WALL_THICKNESS,
      windows: [southWindow],
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
