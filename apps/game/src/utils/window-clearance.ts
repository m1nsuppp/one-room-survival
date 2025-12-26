import type { Room } from '@/models/room.model';
import type { Furniture } from '@/models/furniture.model';
import type { Wall } from '@/models/wall.model';
import type { Window } from '@/models/window.model';
import type { AABB } from '@/policies/furniture-edit.policy';

export interface WindowClearanceResult {
  windowId: string;
  blockageRatio: number;
  isBlocked: boolean;
}

const WINDOW_CLEARANCE_DEPTH = 1.0; // 창문 앞 1m 영역
const MAX_BLOCKAGE_RATIO = 0.5; // 50% 이상 막히면 차단으로 판정
const HALF_DIVISOR = 2;

/**
 * 창문 앞 클리어런스 영역의 AABB 계산
 */
function getWindowClearanceAABB(window: Window, wall: Wall, room: Room): AABB | null {
  // 창문 중심 위치 (벽 기준)
  const windowCenterX = wall.start.x + (wall.end.x - wall.start.x) * window.position;
  const windowCenterZ = wall.start.z + (wall.end.z - wall.start.z) * window.position;

  // 창문 너비의 절반
  const halfWidth = window.width / HALF_DIVISOR;

  // 벽 방향에 따라 클리어런스 영역 계산
  switch (wall.side) {
    case 'north':
      // 북쪽 벽: 창문 앞은 +Z 방향
      return {
        minX: windowCenterX - halfWidth,
        maxX: windowCenterX + halfWidth,
        minZ: windowCenterZ,
        maxZ: Math.min(windowCenterZ + WINDOW_CLEARANCE_DEPTH, room.depth),
      };
    case 'south':
      // 남쪽 벽: 창문 앞은 -Z 방향
      return {
        minX: windowCenterX - halfWidth,
        maxX: windowCenterX + halfWidth,
        minZ: Math.max(windowCenterZ - WINDOW_CLEARANCE_DEPTH, 0),
        maxZ: windowCenterZ,
      };
    case 'east':
      // 동쪽 벽: 창문 앞은 -X 방향
      return {
        minX: Math.max(windowCenterX - WINDOW_CLEARANCE_DEPTH, 0),
        maxX: windowCenterX,
        minZ: windowCenterZ - halfWidth,
        maxZ: windowCenterZ + halfWidth,
      };
    case 'west':
      // 서쪽 벽: 창문 앞은 +X 방향
      return {
        minX: windowCenterX,
        maxX: Math.min(windowCenterX + WINDOW_CLEARANCE_DEPTH, room.width),
        minZ: windowCenterZ - halfWidth,
        maxZ: windowCenterZ + halfWidth,
      };
  }
}

/**
 * AABB 겹침 영역 계산
 */
function getAABBOverlapArea(a: AABB, b: AABB): number {
  const overlapX = Math.max(0, Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX));
  const overlapZ = Math.max(0, Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ));

  return overlapX * overlapZ;
}

/**
 * AABB 면적 계산
 */
function getAABBArea(aabb: AABB): number {
  return (aabb.maxX - aabb.minX) * (aabb.maxZ - aabb.minZ);
}

interface CalculateWindowBlockageParams {
  window: Window;
  wall: Wall;
  room: Room;
  furnitures: Furniture[];
  furnitureToAABB: (furniture: Furniture, x?: number, z?: number) => AABB;
}

/**
 * 특정 창문에 대한 막힘 비율 계산
 * sillHeight(창턱 높이)보다 높은 가구만 막힘으로 계산
 */
function calculateWindowBlockage(params: CalculateWindowBlockageParams): WindowClearanceResult {
  const { window, wall, room, furnitures, furnitureToAABB } = params;
  const clearanceAABB = getWindowClearanceAABB(window, wall, room);

  if (clearanceAABB === null) {
    return {
      windowId: window.id,
      blockageRatio: 0,
      isBlocked: false,
    };
  }

  const clearanceArea = getAABBArea(clearanceAABB);
  if (clearanceArea === 0) {
    return {
      windowId: window.id,
      blockageRatio: 0,
      isBlocked: false,
    };
  }

  let totalBlockedArea = 0;

  for (const furniture of furnitures) {
    // sillHeight보다 낮은 가구는 창문을 막지 않음
    if (furniture.height <= window.sillHeight) {
      continue;
    }

    const furnitureAABB = furnitureToAABB(furniture);
    const overlapArea = getAABBOverlapArea(clearanceAABB, furnitureAABB);
    totalBlockedArea += overlapArea;
  }

  const blockageRatio = Math.min(1, totalBlockedArea / clearanceArea);

  return {
    windowId: window.id,
    blockageRatio,
    isBlocked: blockageRatio > MAX_BLOCKAGE_RATIO,
  };
}

/**
 * 모든 창문에 대한 막힘 검증
 */
export function validateWindowClearance(
  room: Room,
  furnitures: Furniture[],
  furnitureToAABB: (furniture: Furniture, x?: number, z?: number) => AABB,
): { isValid: boolean; blockedWindow?: WindowClearanceResult } {
  for (const wall of room.walls) {
    if (wall.windows === undefined) {
      continue;
    }

    for (const window of wall.windows) {
      const result = calculateWindowBlockage({
        window,
        wall,
        room,
        furnitures,
        furnitureToAABB,
      });

      if (result.isBlocked) {
        return {
          isValid: false,
          blockedWindow: result,
        };
      }
    }
  }

  return { isValid: true };
}
