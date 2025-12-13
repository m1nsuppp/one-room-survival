import type { JSX } from 'react';
import type { Door as DoorModel } from '@/models/door.model';

interface DoorProps {
  door: DoorModel;
  wallLength: number;
  wallThickness: number;
}

/** 문 프레임과 문짝을 렌더링 */
export function Door({
  door,
  wallLength,
  wallThickness,
}: DoorProps): JSX.Element {
  const { position, width, height } = door;

  // 문 중심 위치 (벽 중심 기준 로컬 좌표)
  const centerX = position * wallLength - wallLength / 2;
  const centerY = height / 2;

  const frameThickness = 0.05;
  const frameDepth = wallThickness + 0.02;
  const doorPanelThickness = 0.04;

  return (
    <group position={[centerX, centerY, 0]}>
      {/* 문 프레임 (상) */}
      <mesh position={[0, height / 2 - frameThickness / 2, 0]}>
        <boxGeometry args={[width, frameThickness, frameDepth]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* 문 프레임 (좌) */}
      <mesh position={[-width / 2 + frameThickness / 2, 0, 0]}>
        <boxGeometry args={[frameThickness, height, frameDepth]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* 문 프레임 (우) */}
      <mesh position={[width / 2 - frameThickness / 2, 0, 0]}>
        <boxGeometry args={[frameThickness, height, frameDepth]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* 문짝 */}
      <mesh position={[0, 0, wallThickness / 4]}>
        <boxGeometry
          args={[width - frameThickness * 2, height - frameThickness, doorPanelThickness]}
        />
        <meshStandardMaterial color="#D2691E" />
      </mesh>
      {/* 문 손잡이 */}
      <mesh position={[width / 2 - 0.15, 0, wallThickness / 2 + 0.02]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}
