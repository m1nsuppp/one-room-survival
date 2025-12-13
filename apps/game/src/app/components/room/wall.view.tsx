import type { JSX } from 'react';
import type { Door as DoorModel } from '@/models/door.model';
import type { Wall as WallModel } from '@/models/wall.model';
import type { Window as WindowModel } from '@/models/window.model';
import { Door } from './door.view';
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

/** 창문/문을 통합한 opening 타입 */
interface Opening {
  position: number;
  width: number;
  height: number;
  sillHeight: number;
}

function toOpening(win: WindowModel): Opening {
  return {
    position: win.position,
    width: win.width,
    height: win.height,
    sillHeight: win.sillHeight,
  };
}

function doorToOpening(door: DoorModel): Opening {
  return {
    position: door.position,
    width: door.width,
    height: door.height,
    sillHeight: 0,
  };
}

function calculateWallSegments(
  wallLength: number,
  wallHeight: number,
  openings: Opening[],
): WallSegment[] {
  if (openings.length === 0) {
    return [{ xStart: 0, xEnd: wallLength, yStart: 0, yEnd: wallHeight }];
  }

  const segments: WallSegment[] = [];
  const sortedOpenings = [...openings].sort((a, b) => a.position - b.position);

  let currentX = 0;

  for (const opening of sortedOpenings) {
    const left = opening.position * wallLength - opening.width / 2;
    const right = opening.position * wallLength + opening.width / 2;
    const bottom = opening.sillHeight;
    const top = opening.sillHeight + opening.height;

    // opening 왼쪽 벽 (전체 높이)
    if (left > currentX) {
      segments.push({
        xStart: currentX,
        xEnd: left,
        yStart: 0,
        yEnd: wallHeight,
      });
    }

    // opening 아래 벽 (sill)
    if (bottom > 0) {
      segments.push({
        xStart: left,
        xEnd: right,
        yStart: 0,
        yEnd: bottom,
      });
    }

    // opening 위 벽
    if (top < wallHeight) {
      segments.push({
        xStart: left,
        xEnd: right,
        yStart: top,
        yEnd: wallHeight,
      });
    }

    currentX = right;
  }

  // 마지막 opening 오른쪽 벽
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
  const { start, end, thickness, windows = [], doors = [] } = wall;

  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dz, dx);

  const centerX = (start.x + end.x) / 2;
  const centerZ = (start.z + end.z) / 2;

  const openings: Opening[] = [
    ...windows.map(toOpening),
    ...doors.map(doorToOpening),
  ];
  const segments = calculateWallSegments(length, height, openings);

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

      {/* 문들 */}
      {doors.map((door) => (
        <Door
          key={door.id}
          door={door}
          wallLength={length}
          wallThickness={thickness}
        />
      ))}
    </group>
  );
}
