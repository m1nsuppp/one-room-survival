import type { JSX } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import type { Furniture, FurnitureType } from '@/models/furniture.model';
import { useEditorStore } from '@/store/editor-store.context';

interface FurnitureViewProps {
  furniture: Furniture;
  onDragStart?: (furnitureId: string, pointerX: number, pointerY: number) => void;
}

const FURNITURE_COLORS: Record<FurnitureType, string> = {
  bed: '#8B4513',
  desk: '#DEB887',
  chair: '#4169E1',
  closet: '#D2691E',
  refrigerator: '#C0C0C0',
  washer: '#F5F5F5',
};

const SELECTED_EMISSIVE = '#ffff00';
const SELECTED_EMISSIVE_INTENSITY = 0.3;
const COLLISION_EMISSIVE = '#ff0000';
const COLLISION_EMISSIVE_INTENSITY = 0.5;

export function FurnitureView({ furniture, onDragStart }: FurnitureViewProps): JSX.Element {
  const { width, depth, height, x, z, rotation, type, id } = furniture;
  const selectedId = useEditorStore((s) => s.selectedFurnitureId);
  const validationFeedback = useEditorStore((s) => s.validationFeedback);
  const { selectFurniture } = useEditorStore((s) => s.actions);

  const isSelected = selectedId === id;
  const rotationRad = (parseInt(rotation, 10) * Math.PI) / 180;
  const color = FURNITURE_COLORS[type];

  // 충돌 피드백이 있고 이 가구가 충돌 목록에 포함되어 있으면 빨간색 하이라이트
  const isColliding =
    validationFeedback?.type === 'collision' && validationFeedback.collidingIds.includes(id);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>): void => {
    e.stopPropagation();
    selectFurniture(id);
    onDragStart?.(id, e.pointer.x, e.pointer.y);
  };

  // 하이라이트 우선순위: 충돌 > 선택
  const getHighlightState = (): { emissive: string; intensity: number } => {
    if (isColliding) {
      return { emissive: COLLISION_EMISSIVE, intensity: COLLISION_EMISSIVE_INTENSITY };
    }
    if (isSelected) {
      return { emissive: SELECTED_EMISSIVE, intensity: SELECTED_EMISSIVE_INTENSITY };
    }

    return { emissive: '#000000', intensity: 0 };
  };

  const { emissive, intensity: emissiveIntensity } = getHighlightState();

  return (
    <mesh
      position={[x, height / 2, z]}
      rotation={[0, rotationRad, 0]}
      onPointerDown={handlePointerDown}
    >
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  );
}
