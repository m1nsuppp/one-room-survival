import type { JSX } from 'react';
import type { Room as RoomModel } from '@/models/room.model';
import { FurnitureView } from '../furniture/furniture.view';
import { Floor } from './floor.view';
import { Wall } from './wall.view';

/** L자 컷어웨이 뷰에서 보이는 벽 (북쪽 + 서쪽) */
const VISIBLE_WALL_SIDES = ['north', 'west'];

interface RoomProps {
  room: RoomModel;
}

export function Room({ room }: RoomProps): JSX.Element {
  const { width, depth, height, walls, furnitures } = room;

  // L자 컷어웨이: 북쪽과 서쪽 벽만 렌더링
  const visibleWalls = walls.filter((wall) => VISIBLE_WALL_SIDES.includes(wall.side));

  return (
    <group>
      <Floor floor={{ width, depth }} />

      {/* 뒷벽 (L자형) */}
      {visibleWalls.map((wall) => (
        <Wall key={wall.id} wall={wall} height={height} />
      ))}

      {/* 가구 */}
      {furnitures.map((furniture) => (
        <FurnitureView key={furniture.id} furniture={furniture} />
      ))}
    </group>
  );
}
