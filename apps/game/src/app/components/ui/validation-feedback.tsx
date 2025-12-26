import type { JSX } from 'react';
import { useEditorStore } from '@/store/editor-store.context';
import type { ValidationFeedback as ValidationFeedbackType } from '@/policies/validation-feedback';

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    bottom: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 100,
  },
  feedback: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 20px',
    background: 'rgba(220, 38, 38, 0.95)',
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    color: 'white',
    fontSize: 14,
    fontWeight: 500,
    maxWidth: 400,
  },
  icon: {
    fontSize: 18,
    flexShrink: 0,
  },
  message: {
    flex: 1,
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: 4,
    fontSize: 16,
    opacity: 0.7,
    transition: 'opacity 0.2s',
  },
};

function getIcon(type: ValidationFeedbackType['type']): string {
  switch (type) {
    case 'collision':
      return '⚠️';
    case 'boundary':
      return '🚫';
    case 'pathway':
      return '🚶';
    case 'windowBlockage':
      return '🪟';
  }
}

function getTypeLabel(type: ValidationFeedbackType['type']): string {
  switch (type) {
    case 'collision':
      return '충돌';
    case 'boundary':
      return '경계';
    case 'pathway':
      return '동선';
    case 'windowBlockage':
      return '창문';
  }
}

export function ValidationFeedbackUI(): JSX.Element | null {
  const feedback = useEditorStore((s) => s.validationFeedback);
  const { clearValidationFeedback } = useEditorStore((s) => s.actions);

  if (feedback === null) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.feedback}>
        <span style={styles.icon}>{getIcon(feedback.type)}</span>
        <span style={styles.message}>
          <strong>[{getTypeLabel(feedback.type)}]</strong> {feedback.message}
        </span>
        <button
          style={styles.closeButton}
          onClick={clearValidationFeedback}
          title="닫기"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
