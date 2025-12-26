import type { JSX } from 'react';
import type { Floor as FloorModel } from '@/models/floor.model';
import { useEditorStore } from '@/store/editor-store.context';

interface FloorProps {
  floor: FloorModel;
}

export function Floor({ floor }: FloorProps): JSX.Element {
  const { width, depth } = floor;
  const { selectFurniture } = useEditorStore((s) => s.actions);

  const handlePointerDown = (): void => {
    selectFurniture(null);
  };

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[width / 2, 0, depth / 2]}
      onPointerDown={handlePointerDown}
    >
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial color="#e0e0e0" />
    </mesh>
  );
}
