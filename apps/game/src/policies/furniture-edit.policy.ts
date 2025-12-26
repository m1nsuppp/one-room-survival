import type { Room } from '@/models/room.model';
import type { Furniture, Rotation } from '@/models/furniture.model';
import type { EditPolicy, MoveRequest, RotateRequest } from './edit-policy';
import type {
  ValidationFeedback,
  CollisionFeedback,
  BoundaryFeedback,
  PathwayFeedback,
  WindowBlockageFeedback,
} from './validation-feedback';
import { MoveCommand } from '@/commands/move.command';
import { RotateCommand } from '@/commands/rotate.command';
import { validatePathway } from '@/utils/pathway';
import { validateWindowClearance } from '@/utils/window-clearance';

export interface AABB {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface MoveCommandContext {
  updateFurniturePosition: (id: string, x: number, z: number) => void;
}

export interface RotateCommandContext {
  updateFurnitureRotation: (id: string, rotation: Rotation) => void;
}

export interface EditPolicyContext {
  move: MoveCommandContext;
  rotate: RotateCommandContext;
}

/**
 * 가구의 AABB(Axis-Aligned Bounding Box)를 계산
 */
export function furnitureToAABB(furniture: Furniture, x?: number, z?: number): AABB {
  const posX = x ?? furniture.x;
  const posZ = z ?? furniture.z;

  // 90도, 270도 회전 시 width와 depth가 교환됨
  const isRotated =
    furniture.rotation === '90' || furniture.rotation === '270';
  const effectiveWidth = isRotated ? furniture.depth : furniture.width;
  const effectiveDepth = isRotated ? furniture.width : furniture.depth;

  const halfWidth = effectiveWidth / 2;
  const halfDepth = effectiveDepth / 2;

  return {
    minX: posX - halfWidth,
    maxX: posX + halfWidth,
    minZ: posZ - halfDepth,
    maxZ: posZ + halfDepth,
  };
}

/**
 * 두 AABB가 충돌하는지 검사
 */
export function checkAABBCollision(a: AABB, b: AABB): boolean {
  return (
    a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ
  );
}

export class FurnitureMoveEditPolicy
  implements EditPolicy<MoveRequest, MoveCommand>
{
  constructor(
    private readonly room: Room,
    private readonly context: MoveCommandContext
  ) {}

  getCommand(request: MoveRequest): MoveCommand | ValidationFeedback {
    const furniture = this.room.furnitures.find(
      (f) => f.id === request.furnitureId
    );
    if (furniture === undefined) {
      return {
        type: 'boundary',
        message: '가구를 찾을 수 없습니다.',
        furnitureId: request.furnitureId,
      };
    }

    // 1. 경계 검증
    const boundaryFeedback = this.validateBoundary(
      furniture,
      request.toX,
      request.toZ
    );
    if (boundaryFeedback !== null) {
      return boundaryFeedback;
    }

    // 2. 충돌 검증
    const collisionFeedback = this.validateCollision(
      furniture,
      request.toX,
      request.toZ
    );
    if (collisionFeedback !== null) {
      return collisionFeedback;
    }

    // 3. 동선 검증
    const pathwayFeedback = this.validatePathwayAccess(
      furniture,
      request.toX,
      request.toZ
    );
    if (pathwayFeedback !== null) {
      return pathwayFeedback;
    }

    // 4. 창문 막힘 검증
    const windowFeedback = this.validateWindowClearance(
      furniture,
      request.toX,
      request.toZ
    );
    if (windowFeedback !== null) {
      return windowFeedback;
    }

    // 유효한 이동 - Command 반환
    return new MoveCommand({
      furnitureId: request.furnitureId,
      fromX: request.fromX,
      fromZ: request.fromZ,
      toX: request.toX,
      toZ: request.toZ,
      context: this.context,
    });
  }

  /**
   * 가구가 방 경계를 벗어나는지 검증
   */
  private validateBoundary(
    furniture: Furniture,
    toX: number,
    toZ: number
  ): BoundaryFeedback | null {
    const aabb = furnitureToAABB(furniture, toX, toZ);

    if (
      aabb.minX < 0 ||
      aabb.maxX > this.room.width ||
      aabb.minZ < 0 ||
      aabb.maxZ > this.room.depth
    ) {
      return {
        type: 'boundary',
        message: '가구가 방 경계를 벗어났습니다.',
        furnitureId: furniture.id,
      };
    }

    return null;
  }

  /**
   * 다른 가구와 충돌하는지 검증
   */
  private validateCollision(
    furniture: Furniture,
    toX: number,
    toZ: number
  ): CollisionFeedback | null {
    const targetAABB = furnitureToAABB(furniture, toX, toZ);
    const collidingIds: string[] = [];

    for (const other of this.room.furnitures) {
      if (other.id === furniture.id) {
        continue;
      }

      const otherAABB = furnitureToAABB(other);
      if (checkAABBCollision(targetAABB, otherAABB)) {
        collidingIds.push(other.id);
      }
    }

    if (collidingIds.length > 0) {
      return {
        type: 'collision',
        message: '다른 가구와 충돌합니다.',
        collidingIds,
      };
    }

    return null;
  }

  /**
   * 가구 이동 후 동선이 막히는지 검증
   */
  private validatePathwayAccess(
    furniture: Furniture,
    toX: number,
    toZ: number
  ): PathwayFeedback | null {
    // 이동된 가구로 임시 가구 목록 생성
    const furnituresAfterMove = this.room.furnitures.map((f) =>
      f.id === furniture.id ? { ...f, x: toX, z: toZ } : f
    );

    const result = validatePathway(
      this.room,
      furnituresAfterMove,
      furnitureToAABB
    );

    if (!result.isValid) {
      return {
        type: 'pathway',
        message: '가구를 이 위치에 놓으면 문까지 이동할 수 없습니다.',
        from: 'center',
        to: result.blockedDoorId ?? 'door',
      };
    }

    return null;
  }

  /**
   * 가구 이동 후 창문이 막히는지 검증
   */
  private validateWindowClearance(
    furniture: Furniture,
    toX: number,
    toZ: number
  ): WindowBlockageFeedback | null {
    // 이동된 가구로 임시 가구 목록 생성
    const furnituresAfterMove = this.room.furnitures.map((f) =>
      f.id === furniture.id ? { ...f, x: toX, z: toZ } : f
    );

    const result = validateWindowClearance(
      this.room,
      furnituresAfterMove,
      furnitureToAABB
    );

    if (!result.isValid && result.blockedWindow !== undefined) {
      return {
        type: 'windowBlockage',
        message: '가구를 이 위치에 놓으면 창문이 막힙니다.',
        windowId: result.blockedWindow.windowId,
        blockageRatio: result.blockedWindow.blockageRatio,
        requiredClearanceRatio: 0.5,
      };
    }

    return null;
  }
}

export class FurnitureRotateEditPolicy
  implements EditPolicy<RotateRequest, RotateCommand>
{
  constructor(
    private readonly room: Room,
    private readonly context: RotateCommandContext
  ) {}

  getCommand(request: RotateRequest): RotateCommand | ValidationFeedback {
    const furniture = this.room.furnitures.find(
      (f) => f.id === request.furnitureId
    );
    if (furniture === undefined) {
      return {
        type: 'boundary',
        message: '가구를 찾을 수 없습니다.',
        furnitureId: request.furnitureId,
      };
    }

    // 회전 후 가구의 AABB 계산 (회전 적용)
    const rotatedFurniture: Furniture = {
      ...furniture,
      rotation: request.toRotation,
    };

    // 1. 경계 검증
    const boundaryFeedback = this.validateBoundary(rotatedFurniture);
    if (boundaryFeedback !== null) {
      return boundaryFeedback;
    }

    // 2. 충돌 검증
    const collisionFeedback = this.validateCollision(rotatedFurniture);
    if (collisionFeedback !== null) {
      return collisionFeedback;
    }

    // 3. 동선 검증
    const pathwayFeedback = this.validatePathwayAccess(rotatedFurniture);
    if (pathwayFeedback !== null) {
      return pathwayFeedback;
    }

    // 4. 창문 막힘 검증
    const windowFeedback = this.validateWindowClearanceForRotation(rotatedFurniture);
    if (windowFeedback !== null) {
      return windowFeedback;
    }

    // 유효한 회전 - Command 반환
    return new RotateCommand(
      request.furnitureId,
      request.fromRotation,
      request.toRotation,
      this.context
    );
  }

  /**
   * 가구가 방 경계를 벗어나는지 검증
   */
  private validateBoundary(furniture: Furniture): BoundaryFeedback | null {
    const aabb = furnitureToAABB(furniture);

    if (
      aabb.minX < 0 ||
      aabb.maxX > this.room.width ||
      aabb.minZ < 0 ||
      aabb.maxZ > this.room.depth
    ) {
      return {
        type: 'boundary',
        message: '회전하면 가구가 방 경계를 벗어납니다.',
        furnitureId: furniture.id,
      };
    }

    return null;
  }

  /**
   * 다른 가구와 충돌하는지 검증
   */
  private validateCollision(furniture: Furniture): CollisionFeedback | null {
    const targetAABB = furnitureToAABB(furniture);
    const collidingIds: string[] = [];

    for (const other of this.room.furnitures) {
      if (other.id === furniture.id) {
        continue;
      }

      const otherAABB = furnitureToAABB(other);
      if (checkAABBCollision(targetAABB, otherAABB)) {
        collidingIds.push(other.id);
      }
    }

    if (collidingIds.length > 0) {
      return {
        type: 'collision',
        message: '회전하면 다른 가구와 충돌합니다.',
        collidingIds,
      };
    }

    return null;
  }

  /**
   * 가구 회전 후 동선이 막히는지 검증
   */
  private validatePathwayAccess(
    rotatedFurniture: Furniture
  ): PathwayFeedback | null {
    // 회전된 가구로 임시 가구 목록 생성
    const furnituresAfterRotate = this.room.furnitures.map((f) =>
      f.id === rotatedFurniture.id ? rotatedFurniture : f
    );

    const result = validatePathway(
      this.room,
      furnituresAfterRotate,
      furnitureToAABB
    );

    if (!result.isValid) {
      return {
        type: 'pathway',
        message: '가구를 회전하면 문까지 이동할 수 없습니다.',
        from: 'center',
        to: result.blockedDoorId ?? 'door',
      };
    }

    return null;
  }

  /**
   * 가구 회전 후 창문이 막히는지 검증
   */
  private validateWindowClearanceForRotation(
    rotatedFurniture: Furniture
  ): WindowBlockageFeedback | null {
    // 회전된 가구로 임시 가구 목록 생성
    const furnituresAfterRotate = this.room.furnitures.map((f) =>
      f.id === rotatedFurniture.id ? rotatedFurniture : f
    );

    const result = validateWindowClearance(
      this.room,
      furnituresAfterRotate,
      furnitureToAABB
    );

    if (!result.isValid && result.blockedWindow !== undefined) {
      return {
        type: 'windowBlockage',
        message: '가구를 회전하면 창문이 막힙니다.',
        windowId: result.blockedWindow.windowId,
        blockageRatio: result.blockedWindow.blockageRatio,
        requiredClearanceRatio: 0.5,
      };
    }

    return null;
  }
}
