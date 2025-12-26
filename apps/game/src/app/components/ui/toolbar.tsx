import type { JSX } from 'react';
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

const styles: Record<string, React.CSSProperties> = {
  toolbar: {
    position: 'absolute',
    top: 16,
    left: 16,
    display: 'flex',
    gap: 8,
    padding: 8,
    background: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    zIndex: 100,
  },
  button: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: 4,
    background: '#4a5568',
    color: 'white',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    transition: 'background 0.2s',
  },
  buttonDisabled: {
    background: '#2d3748',
    color: '#718096',
    cursor: 'not-allowed',
  },
  buttonHint: {
    marginLeft: 4,
    fontSize: 12,
    opacity: 0.7,
  },
};

export function Toolbar(): JSX.Element {
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);
  const selectedId = useEditorStore((s) => s.selectedFurnitureId);
  const room = useEditorStore((s) => s.room);
  const {
    undo,
    redo,
    updateFurnitureRotation,
    executeCommand,
    setValidationFeedback,
    clearValidationFeedback,
  } = useEditorStore((s) => s.actions);

  const handleRotate = (): void => {
    if (selectedId === null) {
      return;
    }

    const furniture = room.furnitures.find((f) => f.id === selectedId);
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
      type: 'rotate',
      furnitureId: selectedId,
      fromRotation,
      toRotation,
    });

    if (isValidationFeedback(result)) {
      setValidationFeedback(result);
    } else {
      clearValidationFeedback();
      executeCommand(result);
    }
  };

  return (
    <div style={styles.toolbar}>
      <button
        style={{
          ...styles.button,
          ...(canUndo ? {} : styles.buttonDisabled),
        }}
        onClick={undo}
        disabled={!canUndo}
        title="실행 취소 (Ctrl+Z)"
      >
        ↶ Undo
      </button>
      <button
        style={{
          ...styles.button,
          ...(canRedo ? {} : styles.buttonDisabled),
        }}
        onClick={redo}
        disabled={!canRedo}
        title="다시 실행 (Ctrl+Shift+Z)"
      >
        ↷ Redo
      </button>
      <button
        style={{
          ...styles.button,
          ...(selectedId === null ? styles.buttonDisabled : {}),
        }}
        onClick={handleRotate}
        disabled={selectedId === null}
        title="회전 (R)"
      >
        ⟳ Rotate
        <span style={styles.buttonHint}>(R)</span>
      </button>
    </div>
  );
}
