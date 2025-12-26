import type { JSX } from 'react';
import { useEditorStore } from '@/store/editor-store.context';
import { FurnitureView } from '../furniture/furniture.view';
import { Floor } from './floor.view';
import { Wall } from './wall.view';

/** L자 컷어웨이 뷰에서 보이는 벽 (북쪽 + 서쪽) */
const VISIBLE_WALL_SIDES = ['north', 'west'];

interface RoomProps {
  onFurnitureDragStart?: (
    furnitureId: string,
    pointerX: number,
    pointerY: number
  ) => void;
}

export function Room({ onFurnitureDragStart }: RoomProps): JSX.Element {
  const room = useEditorStore((s) => s.room);
  const { width, depth, height, walls, furnitures } = room;

  const visibleWalls = walls.filter((wall) =>
    VISIBLE_WALL_SIDES.includes(wall.side)
  );

  return (
    <group>
      <Floor floor={{ width, depth }} />

      {visibleWalls.map((wall) => (
        <Wall key={wall.id} wall={wall} height={height} />
      ))}

      {furnitures.map((furniture) => (
        <FurnitureView
          key={furniture.id}
          furniture={furniture}
          onDragStart={onFurnitureDragStart}
        />
      ))}
    </group>
  );
}
