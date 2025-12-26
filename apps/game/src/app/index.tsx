import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { JSX } from 'react';
import { useEffect, useRef, useCallback } from 'react';
import { Room } from './components/room';
import { sampleRoom } from '@/data/sample-room.data';
import { EditorStoreProvider, useEditorStore } from '@/store/editor-store.context';
import { useFurnitureDrag } from './hooks/use-furniture-drag';
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts';
import { Toolbar } from './components/ui/toolbar';
import { ValidationFeedbackUI } from './components/ui/validation-feedback';

type OrbitControlsRef = React.ComponentRef<typeof OrbitControls>;

function Scene(): JSX.Element {
  const roomCenterX = sampleRoom.width / 2;
  const roomCenterZ = sampleRoom.depth / 2;
  const roomCenterY = sampleRoom.height / 3;

  const orbitControlsRef = useRef<OrbitControlsRef>(null);
  const isDragging = useEditorStore((s) => s.isDragging);
  const { startDrag, updateDrag, endDrag } = useFurnitureDrag();
  const { gl } = useThree();

  useKeyboardShortcuts();

  useEffect(() => {
    if (orbitControlsRef.current !== null) {
      orbitControlsRef.current.enabled = !isDragging;
    }
  }, [isDragging]);

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      updateDrag(x, y);
    },
    [gl.domElement, updateDrag],
  );

  const handlePointerUp = useCallback(() => {
    endDrag();
  }, [endDrag]);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerUp);
    };
  }, [gl.domElement, handlePointerMove, handlePointerUp]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[-5, 8, 3]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight
        position={[5, 3, 5]}
        intensity={0.3}
      />

      <Room onFurnitureDragStart={startDrag} />

      <OrbitControls
        ref={orbitControlsRef}
        target={[roomCenterX, roomCenterY, roomCenterZ]}
        enableRotate={true}
        enableZoom={true}
        enablePan={false}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 3}
        minAzimuthAngle={Math.PI / 6}
        maxAzimuthAngle={Math.PI / 2.5}
      />
    </>
  );
}

export default function App(): JSX.Element {
  const roomCenterX = sampleRoom.width / 2;
  const roomCenterZ = sampleRoom.depth / 2;

  return (
    <EditorStoreProvider initialRoom={sampleRoom}>
      <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
        <Canvas
          orthographic
          camera={{
            position: [roomCenterX + 8, 6, roomCenterZ + 8],
            zoom: 90,
            near: 0.1,
            far: 100,
          }}
          style={{ width: '100%', height: '100%', background: '#2a2a3e' }}
        >
          <Scene />
        </Canvas>
        <Toolbar />
        <ValidationFeedbackUI />
      </div>
    </EditorStoreProvider>
  );
}
