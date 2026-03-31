import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useSpring, animated } from '@react-spring/three';

function Sculpture() {
  const meshRef = useRef();
  const { viewport } = useThree();

  const [springs, api] = useSpring(() => ({
    rx: 0,
    rz: 0,
    px: 0,
    py: 0,
    config: { mass: 2, tension: 80, friction: 30 },
  }));

  useEffect(() => {
    const handlePointerMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      api.start({
        rx: y * 0.3,
        rz: x * 0.15,
        px: x * viewport.width * 0.05,
        py: y * viewport.height * 0.05,
      });
    };
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('mousemove', handlePointerMove);
  }, [api, viewport]);

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.15;
  });

  return (
    <animated.group
      position-x={springs.px}
      position-y={springs.py}
      rotation-x={springs.rx}
      rotation-z={springs.rz}
    >
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh ref={meshRef} scale={1.6}>
          <torusKnotGeometry args={[1, 0.35, 128, 32, 2, 3]} />
          <MeshDistortMaterial
            color="#d4cfc7"
            roughness={0.25}
            metalness={0.1}
            distort={0.12}
            speed={1.2}
            envMapIntensity={0.8}
          />
        </mesh>
      </Float>
    </animated.group>
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
      />
    </>
  );
}

function PostProcessing() {
  return (
    <EffectComposer multisampling={0}>
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
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <color attach="background" args={['#080808']} />
        <fog attach="fog" args={['#080808', 8, 18]} />
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        <Lighting />
        <Sculpture />
        <Environment preset="studio" environmentIntensity={0.15} />
        <PostProcessing />
      </Canvas>
    </div>
  );
}
