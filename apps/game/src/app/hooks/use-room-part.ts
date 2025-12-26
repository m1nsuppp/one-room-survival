import { useMemo, useRef } from 'react';
import { useEditorStore } from '@/store/editor-store.context';
import { RoomPartImpl } from '@/parts/room.part';
import { FurniturePartImpl } from '@/parts/furniture.part';
import { DragEditPolicy } from '@/policies/drag-edit.policy';
import type { RoomPart } from '@/parts/room.part';

export function useRoomPart(): RoomPart {
  const room = useEditorStore((s) => s.room);
  const actions = useEditorStore((s) => s.actions);

  const dragPolicyRef = useRef<DragEditPolicy | null>(null);

  const roomPart = useMemo(() => {
    const part = new RoomPartImpl(room);

    const dragPolicy = new DragEditPolicy({
      room,
      updateFurniturePosition: actions.updateFurniturePosition,
      setDragging: actions.setDragging,
      executeCommand: actions.executeCommand,
      setValidationFeedback: actions.setValidationFeedback,
      clearValidationFeedback: actions.clearValidationFeedback,
    });

    dragPolicyRef.current = dragPolicy;

    for (const furniture of room.furnitures) {
      const furniturePart = new FurniturePartImpl(furniture);
      furniturePart.installEditPolicy(dragPolicy);
      part.addChild(furniturePart);
    }

    return part;
  }, [room, actions]);

  return roomPart;
}

export function useDragPolicy(): DragEditPolicy | null {
  const room = useEditorStore((s) => s.room);
  const actions = useEditorStore((s) => s.actions);
  const dragPolicyRef = useRef<DragEditPolicy | null>(null);

  dragPolicyRef.current ??= new DragEditPolicy({
    room,
    updateFurniturePosition: actions.updateFurniturePosition,
    setDragging: actions.setDragging,
    executeCommand: actions.executeCommand,
    setValidationFeedback: actions.setValidationFeedback,
    clearValidationFeedback: actions.clearValidationFeedback,
  });

  return dragPolicyRef.current;
}
