import type { JSX } from 'react';
import type { Wall as WallModel } from '@/models/wall.model';
import type { Window as WindowModel } from '@/models/window.model';
import { Window } from './window.view';

interface WallProps {
  wall: WallModel;
  height: number;
}

interface WallSegment {
  xStart: number;
  xEnd: number;
  yStart: number;
  yEnd: number;
}

function calculateWallSegments(
  wallLength: number,
  wallHeight: number,
  windows: WindowModel[],
): WallSegment[] {
  if (windows.length === 0) {
    return [{ xStart: 0, xEnd: wallLength, yStart: 0, yEnd: wallHeight }];
  }

  const segments: WallSegment[] = [];
  const sortedWindows = [...windows].sort((a, b) => a.position - b.position);

  let currentX = 0;

  for (const win of sortedWindows) {
    const winLeft = win.position * wallLength - win.width / 2;
    const winRight = win.position * wallLength + win.width / 2;
    const winBottom = win.sillHeight;
    const winTop = win.sillHeight + win.height;

    // 창문 왼쪽 벽 (전체 높이)
    if (winLeft > currentX) {
      segments.push({
        xStart: currentX,
        xEnd: winLeft,
        yStart: 0,
        yEnd: wallHeight,
      });
    }

    // 창문 아래 벽 (sill)
    if (winBottom > 0) {
      segments.push({
        xStart: winLeft,
        xEnd: winRight,
        yStart: 0,
        yEnd: winBottom,
      });
    }

    // 창문 위 벽
    if (winTop < wallHeight) {
      segments.push({
        xStart: winLeft,
        xEnd: winRight,
        yStart: winTop,
        yEnd: wallHeight,
      });
    }

    currentX = winRight;
  }

  // 마지막 창문 오른쪽 벽
  if (currentX < wallLength) {
    segments.push({
      xStart: currentX,
      xEnd: wallLength,
      yStart: 0,
      yEnd: wallHeight,
    });
  }

  return segments;
}

export function Wall({ wall, height }: WallProps): JSX.Element {
  const { start, end, thickness, windows = [] } = wall;

  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dz, dx);

  const centerX = (start.x + end.x) / 2;
  const centerZ = (start.z + end.z) / 2;

  const segments = calculateWallSegments(length, height, windows);

  return (
    <group
      position={[centerX, 0, centerZ]}
      rotation={[0, -angle, 0]}
    >
      {/* 벽 세그먼트들 */}
      {segments.map((seg, index) => {
        const segWidth = seg.xEnd - seg.xStart;
        const segHeight = seg.yEnd - seg.yStart;
        const segCenterX = seg.xStart + segWidth / 2 - length / 2;
        const segCenterY = seg.yStart + segHeight / 2;

        return (
          <mesh
            key={index}
            position={[segCenterX, segCenterY, 0]}
          >
            <boxGeometry args={[segWidth, segHeight, thickness]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        );
      })}

      {/* 창문들 */}
      {windows.map((win) => (
        <Window
          key={win.id}
          window={win}
          wallLength={length}
          wallThickness={thickness}
        />
      ))}
    </group>
  );
}
