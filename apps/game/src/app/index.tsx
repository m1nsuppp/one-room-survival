import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { JSX } from 'react';
import { Room } from './components/room';
import { sampleRoom } from '@/data/sample-room.data';

export default function App(): JSX.Element {
  // 방 중심점 계산
  const roomCenterX = sampleRoom.width / 2;
  const roomCenterZ = sampleRoom.depth / 2;
  const roomCenterY = sampleRoom.height / 3;

  return (
    <Canvas
      orthographic
      camera={{
        // 코너 뷰: 오른쪽 앞에서 왼쪽 뒤 코너를 바라봄
        position: [roomCenterX + 8, 6, roomCenterZ + 8],
        zoom: 90,
        near: 0.1,
        far: 100,
      }}
      style={{ width: '100vw', height: '100vh', background: '#2a2a3e' }}
    >
      {/* 환경광: 부드러운 전체 조명 */}
      <ambientLight intensity={0.4} />

      {/* 메인 조명: 창문 방향에서 들어오는 빛 */}
      <directionalLight
        position={[-5, 8, 3]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* 보조 조명: 반대편에서 부드럽게 */}
      <directionalLight
        position={[5, 3, 5]}
        intensity={0.3}
      />

      <Room room={sampleRoom} />

      <OrbitControls
        target={[roomCenterX, roomCenterY, roomCenterZ]}
        enableRotate={true}
        enableZoom={true}
        enablePan={false}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 3}
        minAzimuthAngle={Math.PI / 6}
        maxAzimuthAngle={Math.PI / 2.5}
      />
    </Canvas>
  );
}
