import { useMemo, useRef } from 'react';
import { useEditorStore, useEditorStoreApi } from '@/store/editor-store.context';
import { RoomPartImpl } from '@/parts/room.part';
import { FurniturePartImpl } from '@/parts/furniture.part';
import { DragEditPolicy } from '@/policies/drag-edit.policy';
import type { RoomPart } from '@/parts/room.part';

export function useRoomPart(): RoomPart {
  const room = useEditorStore((s) => s.room);
  const actions = useEditorStore((s) => s.actions);
  const storeApi = useEditorStoreApi();

  const dragPolicyRef = useRef<DragEditPolicy | null>(null);

  // DragEditPolicy는 드래그 상태를 유지해야 하므로 ref로 관리
  dragPolicyRef.current ??= new DragEditPolicy({
    getRoom: () => storeApi.getState().room,
    updateFurniturePosition: actions.updateFurniturePosition,
    setDragging: actions.setDragging,
    executeCommand: actions.executeCommand,
    setValidationFeedback: actions.setValidationFeedback,
    clearValidationFeedback: actions.clearValidationFeedback,
  });

  const dragPolicy = dragPolicyRef.current;

  const roomPart = useMemo(() => {
    const part = new RoomPartImpl(room);

    for (const furniture of room.furnitures) {
      const furniturePart = new FurniturePartImpl(furniture);
      furniturePart.installEditPolicy(dragPolicy);
      part.addChild(furniturePart);
    }

    return part;
  }, [room, dragPolicy]);

  return roomPart;
}

export function useDragPolicy(): DragEditPolicy | null {
  const actions = useEditorStore((s) => s.actions);
  const storeApi = useEditorStoreApi();
  const dragPolicyRef = useRef<DragEditPolicy | null>(null);

  dragPolicyRef.current ??= new DragEditPolicy({
    getRoom: () => storeApi.getState().room,
    updateFurniturePosition: actions.updateFurniturePosition,
    setDragging: actions.setDragging,
    executeCommand: actions.executeCommand,
    setValidationFeedback: actions.setValidationFeedback,
    clearValidationFeedback: actions.clearValidationFeedback,
  });

  return dragPolicyRef.current;
}
