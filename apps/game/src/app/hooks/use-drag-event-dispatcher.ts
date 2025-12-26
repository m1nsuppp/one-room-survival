import { useCallback, useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { RoomPart } from '@/parts/room.part';
import type { DragStartRequest, DragMoveRequest, DragEndRequest } from '@/requests/request';

interface UseDragEventDispatcherProps {
  roomPart: RoomPart;
}

interface DragEventDispatcherReturn {
  handleDragStart: (furnitureId: string, pointerX: number, pointerY: number) => void;
}

interface DragState {
  furnitureId: string;
  startX: number;
  startZ: number;
  offsetX: number;
  offsetZ: number;
}

const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const intersection = new THREE.Vector3();

export function useDragEventDispatcher({
  roomPart,
}: UseDragEventDispatcherProps): DragEventDispatcherReturn {
  const { camera, raycaster, gl } = useThree();
  const dragStateRef = useRef<DragState | null>(null);
  const roomPartRef = useRef<RoomPart>(roomPart);

  // roomPart가 변경될 때마다 ref 업데이트 (콜백 안정성 유지)
  roomPartRef.current = roomPart;

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
      const currentRoomPart = roomPartRef.current;
      const furniturePart = currentRoomPart.getFurniturePartById(furnitureId);
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

      // 드래그 상태를 훅에서 관리
      dragStateRef.current = {
        furnitureId,
        startX: furniture.x,
        startZ: furniture.z,
        offsetX,
        offsetZ,
      };

      const request: DragStartRequest = {
        type: 'drag-start',
        room: currentRoomPart.model,
        furnitureId,
        pointerX,
        pointerY,
      };

      furniturePart.performRequest(request);
    },
    [getFloorIntersection],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const dragState = dragStateRef.current;
      if (dragState === null) {
        return;
      }

      const rect = gl.domElement.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const floorPos = getFloorIntersection(ndcX, ndcY);
      if (floorPos === null) {
        return;
      }

      const furniturePart = roomPartRef.current.getFurniturePartById(dragState.furnitureId);
      if (furniturePart === undefined) {
        return;
      }

      const request: DragMoveRequest = {
        type: 'drag-move',
        furnitureId: dragState.furnitureId,
        worldX: floorPos.x,
        worldZ: floorPos.z,
        offsetX: dragState.offsetX,
        offsetZ: dragState.offsetZ,
      };

      furniturePart.performRequest(request);
    },
    [gl.domElement, getFloorIntersection],
  );

  const handlePointerUp = useCallback(() => {
    const dragState = dragStateRef.current;
    if (dragState === null) {
      return;
    }

    const currentRoomPart = roomPartRef.current;
    const furniturePart = currentRoomPart.getFurniturePartById(dragState.furnitureId);
    if (furniturePart === undefined) {
      dragStateRef.current = null;
      return;
    }

    const furniture = furniturePart.model;

    const request: DragEndRequest = {
      type: 'drag-end',
      room: currentRoomPart.model,
      furnitureId: dragState.furnitureId,
      startX: dragState.startX,
      startZ: dragState.startZ,
      endX: furniture.x,
      endZ: furniture.z,
    };

    furniturePart.performRequest(request);

    dragStateRef.current = null;
  }, []);

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
