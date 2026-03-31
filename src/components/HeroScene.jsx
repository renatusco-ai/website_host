import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

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
            color="#eee9e1"
            roughness={0.2}
            metalness={0.05}
            distort={0.12}
            speed={1.2}
            envMapIntensity={1.2}
          />
        </mesh>
      </Float>
    </animated.group>
  );
}

function MarginFigure() {
  const groupRef = useRef();
  const { viewport } = useThree();

  const torsoGeo = useMemo(() => {
    const geo = new THREE.CapsuleGeometry(0.32, 2.2, 24, 48);
    const pos = geo.attributes.position;
    const vec = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      vec.fromBufferAttribute(pos, i);
      const yNorm = (vec.y + 1.1) / 2.2;
      const chestSwell = Math.exp(-Math.pow((yNorm - 0.65) * 3.5, 2)) * 0.18;
      const waistPinch = Math.exp(-Math.pow((yNorm - 0.35) * 4, 2)) * -0.08;
      const shoulderWidth = Math.exp(-Math.pow((yNorm - 0.8) * 3, 2)) * 0.15;
      const twist = Math.sin(yNorm * Math.PI * 1.2) * 0.15;
      const organic =
        Math.sin(vec.y * 5.5 + vec.x * 3) * 0.025 +
        Math.sin(vec.y * 11 + vec.z * 7) * 0.012;
      const radialScale = 1 + chestSwell + waistPinch + shoulderWidth + organic;
      const cosT = Math.cos(twist);
      const sinT = Math.sin(twist);
      const nx = vec.x * cosT - vec.z * sinT;
      const nz = vec.x * sinT + vec.z * cosT;
      pos.setXYZ(i, nx * radialScale, vec.y, nz * radialScale);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.04;
  });

  const xPos = viewport.width > 8 ? -viewport.width * 0.32 : -3.8;

  return (
    <Float speed={0.5} rotationIntensity={0.08} floatIntensity={0.15}>
      <group
        ref={groupRef}
        position={[xPos, -0.3, -1.5]}
        rotation={[0.08, 0.6, 0.03]}
      >
        <mesh geometry={torsoGeo} scale={1.4}>
          <meshStandardMaterial
            color="#e8e3da"
            roughness={0.28}
            metalness={0.02}
            envMapIntensity={1.1}
          />
        </mesh>
        <mesh position={[0, 1.65, 0]} scale={0.9}>
          <sphereGeometry args={[0.28, 32, 24]} />
          <meshStandardMaterial
            color="#e8e3da"
            roughness={0.28}
            metalness={0.02}
            envMapIntensity={1.1}
          />
        </mesh>
      </group>
    </Float>
  );
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.04} color="#f0ebe3" />
      <directionalLight
        position={[-5, 3, 2]}
        intensity={4}
        color="#ffffff"
      />
      <directionalLight
        position={[4, -2, -3]}
        intensity={0.6}
        color="#c4a265"
      />
      <pointLight position={[0, 5, 0]} intensity={0.15} color="#ffffff" />
      <spotLight
        position={[-3, 5, 5]}
        angle={0.25}
        penumbra={0.6}
        intensity={3}
        color="#ffffff"
      />
    </>
  );
}

function PostProcessing() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        luminanceThreshold={0.4}
        luminanceSmoothing={0.8}
        intensity={0.7}
        mipmapBlur
      />
      <Vignette darkness={0.8} offset={0.25} />
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
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 10, 20]} />
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        <Lighting />
        <Sculpture />
        <MarginFigure />
        <Environment preset="studio" environmentIntensity={0.35} />
        <PostProcessing />
      </Canvas>
    </div>
  );
}
