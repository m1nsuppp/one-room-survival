import { useEffect } from 'react';
import { useEditorStore } from '@/store/editor-store.context';
import type { Rotation } from '@/models/furniture.model';
import { FurnitureRotateEditPolicy } from '@/policies/furniture-edit.policy';
import { isValidationFeedback } from '@/policies/validation-feedback';

const ROTATION_ORDER: readonly Rotation[] = ['0', '90', '180', '270'] as const;

function getNextRotation(current: Rotation): Rotation {
  const currentIndex = ROTATION_ORDER.indexOf(current);
  const nextIndex = (currentIndex + 1) % ROTATION_ORDER.length;

  return ROTATION_ORDER[nextIndex] ?? '0';
}

export function useKeyboardShortcuts(): void {
  const room = useEditorStore((s) => s.room);
  const selectedFurnitureId = useEditorStore((s) => s.selectedFurnitureId);
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);
  const {
    updateFurnitureRotation,
    executeCommand,
    undo,
    redo,
    setValidationFeedback,
    clearValidationFeedback,
  } = useEditorStore((s) => s.actions);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      // Undo: Ctrl+Z (Windows) / Cmd+Z (Mac)
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        if (canUndo) {
          undo();
        }

        return;
      }

      // Redo: Ctrl+Shift+Z (Windows) / Cmd+Shift+Z (Mac) or Ctrl+Y
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')
      ) {
        e.preventDefault();
        if (canRedo) {
          redo();
        }

        return;
      }

      // Rotate: R (e.code 사용으로 한/영 구분 없이 동작)
      if (e.code === 'KeyR') {
        if (selectedFurnitureId === null) {
          return;
        }

        const furniture = room.furnitures.find((f) => f.id === selectedFurnitureId);
        if (furniture === undefined) {
          return;
        }

        const fromRotation = furniture.rotation;
        const toRotation = getNextRotation(fromRotation);

        // EditPolicy를 통해 검증
        const policy = new FurnitureRotateEditPolicy(room, {
          updateFurnitureRotation,
        });
        const result = policy.getCommand({
          furnitureId: selectedFurnitureId,
          fromRotation,
          toRotation,
        });

        if (isValidationFeedback(result)) {
          setValidationFeedback(result);
        } else {
          clearValidationFeedback();
          executeCommand(result);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    room,
    selectedFurnitureId,
    updateFurnitureRotation,
    executeCommand,
    undo,
    redo,
    canUndo,
    canRedo,
    setValidationFeedback,
    clearValidationFeedback,
  ]);
}
