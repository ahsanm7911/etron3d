import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, Center } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

function OBJModel({ url }) {
  const obj = useLoader(OBJLoader, url);
  return (
    <Center>
      <primitive object={obj} />
    </Center>
  );
}

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
  file,
  autoRotate = true,
  backgroundColor = 'transparent',
  style = {},
}) {
  const [objectUrl, setObjectUrl] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    // Guard: must be a real File or Blob instance
    if (!file || !(file instanceof Blob)) return;

    let created = null;

    // Defer to next tick to avoid cascading renders
    const timer = setTimeout(() => {
      try {
        created = URL.createObjectURL(file);
        if (isMounted.current) setObjectUrl(created);
      } catch (err) {
        console.error('ModelViewer: failed to create object URL', err);
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      if (created) URL.revokeObjectURL(created);
    };
  }, [file]);

  const modelUrl = objectUrl || url;

  if (!modelUrl) {
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
          <OBJModel url={modelUrl} />
        </Suspense>

        <OrbitControls
          autoRotate={autoRotate}
          autoRotateSpeed={1.5}
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={20}
        />
      </Canvas>
    </div>
  );
}
