import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Center, useGLTF } from '@react-three/drei';

function GLTFModel({ url }) {
  const { scene } = useGLTF(url);
  return (
    <Center>
      <primitive object={scene} />
    </Center>
  );
}

// Preload hint — speeds up load when URL is known ahead of time
GLTFModel.preload = (url) => useGLTF.preload(url);

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#e5e7eb" wireframe />
    </mesh>
  );
}

export default function ModelViewer({
  url,
  autoRotate = true,
  backgroundColor = 'transparent',
  style = {},
}) {
  if (!url) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500 text-sm"
        style={{ height: 400, ...style }}
      >
        No model provided
      </div>
    );
  }

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700"
      style={{ height: 400, background: backgroundColor, ...style }}
    >
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-3 text-xs text-neutral-400 dark:text-neutral-500 pointer-events-none select-none">
        <span>Drag to rotate</span>
        <span>·</span>
        <span>Scroll to zoom</span>
        <span>·</span>
        <span>Right-drag to pan</span>
      </div>

      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />
        <Environment preset="city" />

        <Suspense fallback={<LoadingFallback />}>
          <GLTFModel url={url} />
        </Suspense>

        <OrbitControls
          autoRotate={autoRotate}
          autoRotateSpeed={1.5}
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
        />
      </Canvas>
    </div>
  );
}
