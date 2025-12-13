import type { JSX } from 'react';
import type { Wall as WallModel } from '@/models/wall.model';

interface WallProps {
  wall: WallModel;
  height: number;
}

export function Wall({ wall, height }: WallProps): JSX.Element {
  const { start, end, thickness } = wall;

  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dz, dx);

  const centerX = (start.x + end.x) / 2;
  const centerZ = (start.z + end.z) / 2;
  const centerY = height / 2;

  return (
    <mesh
      position={[centerX, centerY, centerZ]}
      rotation={[0, -angle, 0]}
    >
      <boxGeometry args={[length, height, thickness]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  );
}
