import type { Room } from '@/models/room.model';
import type { Furniture } from '@/models/furniture.model';
import type { AABB } from '@/policies/furniture-edit.policy';
import { GRID_SIZE } from './grid';

const DOOR_OFFSET_MULTIPLIER = 2;

export interface GridPosition {
  gridX: number;
  gridZ: number;
}

export interface DoorLocation {
  id: string;
  gridX: number;
  gridZ: number;
}

interface HasPathParams {
  grid: boolean[][];
  start: GridPosition;
  end: GridPosition;
}

/**
 * 10cm 그리드 기반 occupancy grid 생성
 * true = 점유됨 (이동 불가), false = 비어있음 (이동 가능)
 */
export function createOccupancyGrid(
  room: Room,
  furnitures: Furniture[],
  furnitureToAABB: (furniture: Furniture, x?: number, z?: number) => AABB,
): boolean[][] {
  const gridWidth = Math.ceil(room.width / GRID_SIZE);
  const gridDepth = Math.ceil(room.depth / GRID_SIZE);

  // 모두 비어있는 상태로 초기화
  const grid: boolean[][] = Array.from({ length: gridDepth }, () =>
    Array.from({ length: gridWidth }, () => false),
  );

  // 각 가구가 차지하는 그리드 셀을 점유 상태로 변경
  for (const furniture of furnitures) {
    const aabb = furnitureToAABB(furniture);

    const minGridX = Math.max(0, Math.floor(aabb.minX / GRID_SIZE));
    const maxGridX = Math.min(gridWidth - 1, Math.ceil(aabb.maxX / GRID_SIZE));
    const minGridZ = Math.max(0, Math.floor(aabb.minZ / GRID_SIZE));
    const maxGridZ = Math.min(gridDepth - 1, Math.ceil(aabb.maxZ / GRID_SIZE));

    for (let gz = minGridZ; gz <= maxGridZ; gz += 1) {
      for (let gx = minGridX; gx <= maxGridX; gx += 1) {
        const row = grid[gz];
        if (row?.[gx] !== undefined) {
          row[gx] = true;
        }
      }
    }
  }

  return grid;
}

function calculateDoorOffset(side: string): { offsetX: number; offsetZ: number } {
  let offsetX = 0;
  let offsetZ = 0;

  switch (side) {
    case 'north':
      offsetZ = GRID_SIZE * DOOR_OFFSET_MULTIPLIER;
      break;
    case 'south':
      offsetZ = -GRID_SIZE * DOOR_OFFSET_MULTIPLIER;
      break;
    case 'east':
      offsetX = -GRID_SIZE * DOOR_OFFSET_MULTIPLIER;
      break;
    case 'west':
      offsetX = GRID_SIZE * DOOR_OFFSET_MULTIPLIER;
      break;
  }

  return { offsetX, offsetZ };
}

/**
 * 방에 있는 문의 위치를 그리드 좌표로 변환
 */
export function getDoorLocations(room: Room): DoorLocation[] {
  const doors: DoorLocation[] = [];

  for (const wall of room.walls) {
    if (wall.doors === undefined) {
      continue;
    }

    for (const door of wall.doors) {
      // 문 중심 위치 (0~1 비율을 실제 좌표로 변환)
      const doorCenterX = wall.start.x + (wall.end.x - wall.start.x) * door.position;
      const doorCenterZ = wall.start.z + (wall.end.z - wall.start.z) * door.position;

      // 문 앞 공간 (방 안쪽 방향으로 약간 오프셋)
      const { offsetX, offsetZ } = calculateDoorOffset(wall.side);

      const doorX = doorCenterX + offsetX;
      const doorZ = doorCenterZ + offsetZ;

      doors.push({
        id: door.id,
        gridX: Math.floor(doorX / GRID_SIZE),
        gridZ: Math.floor(doorZ / GRID_SIZE),
      });
    }
  }

  return doors;
}

function isInBounds(x: number, z: number, gridWidth: number, gridDepth: number): boolean {
  return x >= 0 && x < gridWidth && z >= 0 && z < gridDepth;
}

function isOccupied(grid: boolean[][], x: number, z: number): boolean {
  const row = grid[z];
  if (row === undefined) {
    return true;
  }

  return row[x] === true;
}

function setVisited(visited: boolean[][], x: number, z: number): void {
  const row = visited[z];
  if (row !== undefined) {
    row[x] = true;
  }
}

function isVisitedOrOccupied(
  grid: boolean[][],
  visited: boolean[][],
  x: number,
  z: number,
): boolean {
  const visitedRow = visited[z];
  const gridRow = grid[z];
  if (visitedRow === undefined || gridRow === undefined) {
    return true;
  }

  return visitedRow[x] === true || gridRow[x] === true;
}

/**
 * BFS를 사용하여 시작점에서 목표점까지 경로가 있는지 확인
 */
export function hasPath(params: HasPathParams): boolean {
  const { grid, start, end } = params;
  const gridDepth = grid.length;
  const firstRow = grid[0];
  const gridWidth = firstRow === undefined ? 0 : firstRow.length;

  const { gridX: startX, gridZ: startZ } = start;
  const { gridX: endX, gridZ: endZ } = end;

  // 범위 검사
  if (
    !isInBounds(startX, startZ, gridWidth, gridDepth) ||
    !isInBounds(endX, endZ, gridWidth, gridDepth)
  ) {
    return false;
  }

  // 시작점이나 끝점이 점유되어 있으면 경로 없음
  if (isOccupied(grid, startX, startZ) || isOccupied(grid, endX, endZ)) {
    return false;
  }

  // 같은 위치면 true
  if (startX === endX && startZ === endZ) {
    return true;
  }

  // BFS
  const visited: boolean[][] = Array.from({ length: gridDepth }, () =>
    Array.from({ length: gridWidth }, () => false),
  );

  const queue: GridPosition[] = [{ gridX: startX, gridZ: startZ }];
  setVisited(visited, startX, startZ);

  // 4방향 이동 (상하좌우)
  const directions = [
    { dx: 0, dz: -1 },
    { dx: 0, dz: 1 },
    { dx: -1, dz: 0 },
    { dx: 1, dz: 0 },
  ];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) {
      break;
    }

    for (const dir of directions) {
      const nextX = current.gridX + dir.dx;
      const nextZ = current.gridZ + dir.dz;

      // 범위 검사
      if (!isInBounds(nextX, nextZ, gridWidth, gridDepth)) {
        continue;
      }

      // 이미 방문했거나 점유된 셀은 건너뜀
      if (isVisitedOrOccupied(grid, visited, nextX, nextZ)) {
        continue;
      }

      // 목적지 도달
      if (nextX === endX && nextZ === endZ) {
        return true;
      }

      setVisited(visited, nextX, nextZ);
      queue.push({ gridX: nextX, gridZ: nextZ });
    }
  }

  return false;
}

/**
 * 방의 중심에서 모든 문까지 도달 가능한지 확인
 */
export function validatePathway(
  room: Room,
  furnitures: Furniture[],
  furnitureToAABB: (furniture: Furniture, x?: number, z?: number) => AABB,
): { isValid: boolean; blockedDoorId?: string } {
  const grid = createOccupancyGrid(room, furnitures, furnitureToAABB);
  const doors = getDoorLocations(room);

  // 문이 없으면 검증 통과
  if (doors.length === 0) {
    return { isValid: true };
  }

  // 방 중심 계산
  const centerGridX = Math.floor(room.width / DOOR_OFFSET_MULTIPLIER / GRID_SIZE);
  const centerGridZ = Math.floor(room.depth / DOOR_OFFSET_MULTIPLIER / GRID_SIZE);

  // 중심이 점유되어 있으면 가장 가까운 비점유 셀 찾기
  let startX = centerGridX;
  let startZ = centerGridZ;

  if (isOccupied(grid, startX, startZ)) {
    // 스파이럴 탐색으로 가장 가까운 비점유 셀 찾기
    const found = findNearestUnoccupied(grid, centerGridX, centerGridZ);
    if (found === null) {
      // 모든 셀이 점유됨
      const firstDoor = doors[0];

      return { isValid: false, blockedDoorId: firstDoor?.id };
    }
    startX = found.gridX;
    startZ = found.gridZ;
  }

  // 각 문까지 경로 확인
  for (const door of doors) {
    const pathExists = hasPath({
      grid,
      start: { gridX: startX, gridZ: startZ },
      end: { gridX: door.gridX, gridZ: door.gridZ },
    });
    if (!pathExists) {
      return { isValid: false, blockedDoorId: door.id };
    }
  }

  return { isValid: true };
}

/**
 * 가장 가까운 비점유 셀 찾기
 */
function findNearestUnoccupied(
  grid: boolean[][],
  centerX: number,
  centerZ: number,
): GridPosition | null {
  const gridDepth = grid.length;
  const firstRow = grid[0];
  const gridWidth = firstRow === undefined ? 0 : firstRow.length;
  const maxRadius = Math.max(gridWidth, gridDepth);

  for (let r = 1; r <= maxRadius; r += 1) {
    for (let dz = -r; dz <= r; dz += 1) {
      for (let dx = -r; dx <= r; dx += 1) {
        if (Math.abs(dx) !== r && Math.abs(dz) !== r) {
          continue;
        }

        const x = centerX + dx;
        const z = centerZ + dz;

        if (isInBounds(x, z, gridWidth, gridDepth) && !isOccupied(grid, x, z)) {
          return { gridX: x, gridZ: z };
        }
      }
    }
  }

  return null;
}
