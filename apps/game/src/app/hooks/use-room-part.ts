import { useMemo } from 'react';
import { useEditorStore } from '@/store/editor-store.context';
import { RoomPartImpl } from '@/parts/room.part';
import { FurniturePartImpl } from '@/parts/furniture.part';
import { DragEditPolicy } from '@/policies/drag-edit.policy';
import type { RoomPart } from '@/parts/room.part';

export function useRoomPart(): RoomPart {
  const room = useEditorStore((s) => s.room);
  const actions = useEditorStore((s) => s.actions);

  // DragEditPolicy는 이제 stateless이므로 useMemo로 생성
  const dragPolicy = useMemo(
    () =>
      new DragEditPolicy({
        updateFurniturePosition: actions.updateFurniturePosition,
        setDragging: actions.setDragging,
        executeCommand: actions.executeCommand,
        setValidationFeedback: actions.setValidationFeedback,
        clearValidationFeedback: actions.clearValidationFeedback,
      }),
    [actions],
  );

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
