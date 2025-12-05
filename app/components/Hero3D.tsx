"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei";

export default function Hero3D() {
  return (
    <Canvas>
      <OrbitControls enableZoom={false} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 2, 1]} />

      <Sphere args={[1, 100, 200]} scale={2.4}>
        <MeshDistortMaterial
          color="#1e90ff"
          attach="material"
          distort={0.4}
          speed={2}
        />
      </Sphere>
    </Canvas>
  );
}
