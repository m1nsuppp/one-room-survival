import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function Room() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[4, 4]} />
      <meshStandardMaterial color="#f0f0f0" />
    </mesh>
  );
}

function App() {
  return (
    <Canvas
      camera={{ position: [5, 5, 5], fov: 50 }}
      style={{ width: '100vw', height: '100vh' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Room />
      <OrbitControls />
      <gridHelper args={[4, 4]} />
    </Canvas>
  );
}

export default App;
