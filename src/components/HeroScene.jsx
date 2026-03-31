import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

function Sculpture() {
  const meshRef = useRef();
  const mouse = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  useEffect(() => {
    const handlePointerMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handlePointerMove);
    return () => window.removeEventListener('mousemove', handlePointerMove);
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    meshRef.current.rotation.y += delta * 0.15;
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      mouse.current.y * 0.3,
      0.02
    );
    meshRef.current.rotation.z = THREE.MathUtils.lerp(
      meshRef.current.rotation.z,
      mouse.current.x * 0.15,
      0.02
    );

    const targetX = mouse.current.x * viewport.width * 0.05;
    const targetY = mouse.current.y * viewport.height * 0.05;
    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      targetX,
      0.02
    );
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      targetY,
      0.02
    );
  });

  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} scale={1.6}>
        <torusKnotGeometry args={[1, 0.35, 256, 64, 2, 3]} />
        <MeshDistortMaterial
          color="#d4cfc7"
          roughness={0.25}
          metalness={0.1}
          distort={0.15}
          speed={1.5}
          envMapIntensity={0.8}
        />
      </mesh>
    </Float>
  );
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.08} color="#f0ebe3" />
      <directionalLight
        position={[-5, 3, 2]}
        intensity={2.5}
        color="#f0ebe3"
        castShadow
      />
      <directionalLight
        position={[4, -2, -3]}
        intensity={0.4}
        color="#c4a265"
      />
      <pointLight position={[0, 5, 0]} intensity={0.3} color="#f0ebe3" />
      <spotLight
        position={[-3, 5, 5]}
        angle={0.3}
        penumbra={0.8}
        intensity={1.5}
        color="#f0ebe3"
        castShadow
      />
    </>
  );
}

function PostProcessing() {
  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.6}
        luminanceSmoothing={0.9}
        intensity={0.4}
        mipmapBlur
      />
      <Vignette darkness={0.7} offset={0.3} />
    </EffectComposer>
  );
}

export default function HeroScene({ className = '' }) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <color attach="background" args={['#080808']} />
        <fog attach="fog" args={['#080808', 8, 18]} />
        <Lighting />
        <Sculpture />
        <Environment preset="studio" environmentIntensity={0.15} />
        <PostProcessing />
      </Canvas>
    </div>
  );
}
