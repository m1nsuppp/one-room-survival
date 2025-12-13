import type { JSX } from 'react';
import type { Window as WindowModel } from '@/models/window.model';

interface WindowProps {
  window: WindowModel;
  wallLength: number;
  wallThickness: number;
}

/** 창문 프레임과 유리를 렌더링 */
export function Window({
  window: windowModel,
  wallLength,
  wallThickness,
}: WindowProps): JSX.Element {
  const { position, width, height, sillHeight } = windowModel;

  // 창문 중심 위치 (벽 중심 기준 로컬 좌표)
  const centerX = position * wallLength - wallLength / 2;
  const centerY = sillHeight + height / 2;

  const frameThickness = 0.05;
  const frameDepth = wallThickness + 0.02;

  return (
    <group position={[centerX, centerY, 0]}>
      {/* 창문 프레임 (상) */}
      <mesh position={[0, height / 2 - frameThickness / 2, 0]}>
        <boxGeometry args={[width, frameThickness, frameDepth]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* 창문 프레임 (하) */}
      <mesh position={[0, -height / 2 + frameThickness / 2, 0]}>
        <boxGeometry args={[width, frameThickness, frameDepth]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* 창문 프레임 (좌) */}
      <mesh position={[-width / 2 + frameThickness / 2, 0, 0]}>
        <boxGeometry args={[frameThickness, height, frameDepth]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* 창문 프레임 (우) */}
      <mesh position={[width / 2 - frameThickness / 2, 0, 0]}>
        <boxGeometry args={[frameThickness, height, frameDepth]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* 유리 */}
      <mesh>
        <planeGeometry args={[width - frameThickness * 2, height - frameThickness * 2]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
