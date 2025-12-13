import type { JSX } from 'react';
import type { Furniture, FurnitureType } from '@/models/furniture.model';

interface FurnitureViewProps {
  furniture: Furniture;
}

const FURNITURE_COLORS: Record<FurnitureType, string> = {
  bed: '#8B4513',
  desk: '#DEB887',
  chair: '#4169E1',
  closet: '#D2691E',
  refrigerator: '#C0C0C0',
  washer: '#F5F5F5',
};

export function FurnitureView({ furniture }: FurnitureViewProps): JSX.Element {
  const { width, depth, height, x, z, rotation, type } = furniture;

  const rotationRad = (parseInt(rotation, 10) * Math.PI) / 180;
  const color = FURNITURE_COLORS[type];

  return (
    <mesh
      position={[x, height / 2, z]}
      rotation={[0, rotationRad, 0]}
    >
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
