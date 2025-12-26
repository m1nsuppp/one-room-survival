import { useCallback, useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { RoomPart } from '@/parts/room.part';
import type { DragStartRequest, DragMoveRequest, DragEndRequest } from '@/requests/request';
import { DragEditPolicy } from '@/policies/drag-edit.policy';

interface UseDragEventDispatcherProps {
  roomPart: RoomPart;
}

interface DragEventDispatcherReturn {
  handleDragStart: (furnitureId: string, pointerX: number, pointerY: number) => void;
}

const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const intersection = new THREE.Vector3();

export function useDragEventDispatcher({
  roomPart,
}: UseDragEventDispatcherProps): DragEventDispatcherReturn {
  const { camera, raycaster, gl } = useThree();
  const activeDragIdRef = useRef<string | null>(null);
  const activePolicyRef = useRef<DragEditPolicy | null>(null);

  const getFloorIntersection = useCallback(
    (pointerX: number, pointerY: number): THREE.Vector3 | null => {
      const pointer = new THREE.Vector2(pointerX, pointerY);
      raycaster.setFromCamera(pointer, camera);
      if (raycaster.ray.intersectPlane(floorPlane, intersection) !== null) {
        return intersection.clone();
      }

      return null;
    },
    [camera, raycaster],
  );

  const handleDragStart = useCallback(
    (furnitureId: string, pointerX: number, pointerY: number) => {
      const furniturePart = roomPart.getFurniturePartById(furnitureId);
      if (furniturePart === undefined) {
        return;
      }

      const floorPos = getFloorIntersection(pointerX, pointerY);
      if (floorPos === null) {
        return;
      }

      const furniture = furniturePart.model;
      const offsetX = floorPos.x - furniture.x;
      const offsetZ = floorPos.z - furniture.z;

      const request: DragStartRequest = {
        type: 'drag-start',
        furnitureId,
        pointerX,
        pointerY,
      };

      furniturePart.performRequest(request);

      for (const policy of furniturePart.editPolicies) {
        if (policy instanceof DragEditPolicy) {
          policy.setOffset(offsetX, offsetZ);
          activePolicyRef.current = policy;
          break;
        }
      }

      activeDragIdRef.current = furnitureId;
    },
    [roomPart, getFloorIntersection],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (activeDragIdRef.current === null) {
        return;
      }

      const rect = gl.domElement.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const floorPos = getFloorIntersection(ndcX, ndcY);
      if (floorPos === null) {
        return;
      }

      const furniturePart = roomPart.getFurniturePartById(activeDragIdRef.current);
      if (furniturePart === undefined) {
        return;
      }

      const request: DragMoveRequest = {
        type: 'drag-move',
        furnitureId: activeDragIdRef.current,
        worldX: floorPos.x,
        worldZ: floorPos.z,
      };

      furniturePart.performRequest(request);
    },
    [roomPart, gl.domElement, getFloorIntersection],
  );

  const handlePointerUp = useCallback(() => {
    if (activeDragIdRef.current === null) {
      return;
    }

    const furniturePart = roomPart.getFurniturePartById(activeDragIdRef.current);
    if (furniturePart === undefined) {
      activeDragIdRef.current = null;
      activePolicyRef.current = null;
      return;
    }

    const request: DragEndRequest = {
      type: 'drag-end',
      furnitureId: activeDragIdRef.current,
    };

    furniturePart.performRequest(request);

    activeDragIdRef.current = null;
    activePolicyRef.current = null;
  }, [roomPart]);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerUp);
    };
  }, [gl.domElement, handlePointerMove, handlePointerUp]);

  return { handleDragStart };
}
