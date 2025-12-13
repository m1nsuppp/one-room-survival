import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { JSX } from 'react';
import { Room } from './components/room';
import { sampleRoom } from '@/data/sample-room.data';

export default function App(): JSX.Element {
  return (
    <Canvas
      camera={{ position: [5, 5, 5], fov: 50 }}
      style={{ width: '100vw', height: '100vh' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
      />
      <Room room={sampleRoom} />
      <OrbitControls />
      <gridHelper args={[4, 4]} />
    </Canvas>
  );
}
