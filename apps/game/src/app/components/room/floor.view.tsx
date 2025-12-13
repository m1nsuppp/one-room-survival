import type { JSX } from 'react';

interface FloorProps {
  width: number;
  depth: number;
}

export function Floor({ width, depth }: FloorProps): JSX.Element {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[width / 2, 0, depth / 2]}
    >
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial color="#e0e0e0" />
    </mesh>
  );
}
