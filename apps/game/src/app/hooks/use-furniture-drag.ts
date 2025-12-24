import { useCallback, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useEditorStore } from '@/store/editor-store.context';
import { snapToGrid } from '@/utils/grid';
import { FurnitureMoveEditPolicy } from '@/policies/furniture-edit.policy';
import { isValidationFeedback } from '@/policies/validation-feedback';

const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const intersection = new THREE.Vector3();

interface DragState {
  furnitureId: string;
  startX: number;
  startZ: number;
  offsetX: number;
  offsetZ: number;
}

interface UseFurnitureDragReturn {
  startDrag: (furnitureId: string, pointerX: number, pointerY: number) => void;
  updateDrag: (pointerX: number, pointerY: number) => void;
  endDrag: () => void;
  isDragging: () => boolean;
}

export function useFurnitureDrag(): UseFurnitureDragReturn {
  const { camera, raycaster } = useThree();
  const dragState = useRef<DragState | null>(null);

  const room = useEditorStore((s) => s.room);
  const {
    setDragging,
    updateFurniturePosition,
    executeCommand,
    setValidationFeedback,
    clearValidationFeedback,
  } = useEditorStore((s) => s.actions);

  const getFloorPosition = useCallback(
    (pointer: THREE.Vector2): THREE.Vector3 | null => {
      raycaster.setFromCamera(pointer, camera);
      if (raycaster.ray.intersectPlane(floorPlane, intersection) !== null) {
        return intersection.clone();
      }

      return null;
    },
    [camera, raycaster]
  );

  const startDrag = useCallback(
    (furnitureId: string, pointerX: number, pointerY: number) => {
      const furniture = room.furnitures.find((f) => f.id === furnitureId);
      if (furniture === undefined) {
        return;
      }

      const pointer = new THREE.Vector2(pointerX, pointerY);
      const floorPos = getFloorPosition(pointer);
      if (floorPos === null) {
        return;
      }

      dragState.current = {
        furnitureId,
        startX: furniture.x,
        startZ: furniture.z,
        offsetX: floorPos.x - furniture.x,
        offsetZ: floorPos.z - furniture.z,
      };

      setDragging(true);
    },
    [room.furnitures, getFloorPosition, setDragging]
  );

  const updateDrag = useCallback(
    (pointerX: number, pointerY: number) => {
      if (dragState.current === null) {
        return;
      }

      const pointer = new THREE.Vector2(pointerX, pointerY);
      const floorPos = getFloorPosition(pointer);
      if (floorPos === null) {
        return;
      }

      const { furnitureId, offsetX, offsetZ } = dragState.current;

      const newX = snapToGrid(floorPos.x - offsetX);
      const newZ = snapToGrid(floorPos.z - offsetZ);

      updateFurniturePosition(furnitureId, newX, newZ);
    },
    [getFloorPosition, updateFurniturePosition]
  );

  const endDrag = useCallback(() => {
    if (dragState.current === null) {
      return;
    }

    const { furnitureId, startX, startZ } = dragState.current;
    const furniture = room.furnitures.find((f) => f.id === furnitureId);

    if (furniture !== undefined && (furniture.x !== startX || furniture.z !== startZ)) {
      // 현재 위치 저장 (드래그로 이동된 새 위치)
      const newX = furniture.x;
      const newZ = furniture.z;

      // 위치를 원래대로 되돌린 후 EditPolicy를 통해 검증
      updateFurniturePosition(furnitureId, startX, startZ);

      // EditPolicy를 통해 Command 또는 ValidationFeedback 획득
      const policy = new FurnitureMoveEditPolicy(room, { updateFurniturePosition });
      const result = policy.getCommand({
        furnitureId,
        fromX: startX,
        fromZ: startZ,
        toX: newX,
        toZ: newZ,
      });

      if (isValidationFeedback(result)) {
        // 검증 실패 - 피드백 표시
        setValidationFeedback(result);
      } else {
        // 검증 성공 - Command 실행
        clearValidationFeedback();
        executeCommand(result);
      }
    }

    dragState.current = null;
    setDragging(false);
  }, [room, updateFurniturePosition, executeCommand, setDragging, setValidationFeedback, clearValidationFeedback]);

  const isDragging = useCallback((): boolean => dragState.current !== null, []);

  return {
    startDrag,
    updateDrag,
    endDrag,
    isDragging,
  };
}
