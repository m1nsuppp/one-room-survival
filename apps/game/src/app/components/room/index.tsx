import type { JSX } from 'react';
import type { Room as RoomModel } from '@/models/room.model';
import { Floor } from './floor.view';
import { Wall } from './wall.view';

interface RoomProps {
  room: RoomModel;
}

export function Room({ room }: RoomProps): JSX.Element {
  const { width, depth, height, walls } = room;

  return (
    <group>
      <Floor
        width={width}
        depth={depth}
      />
      {walls.map((wall) => (
        <Wall
          key={wall.id}
          wall={wall}
          height={height}
        />
      ))}
    </group>
  );
}
