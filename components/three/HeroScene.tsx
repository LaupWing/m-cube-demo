"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import CornerScene from "./CornerScene";

export default function HeroScene() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#fff" }}>
      <Canvas camera={{ position: [0, 0.5, 5], fov: 50 }} scene={{ background: new THREE.Color("#ffffff") }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 4, 5]} intensity={1} />
        <OrbitControls
          enableDamping
          dampingFactor={0.1}
          target={[0, 0, -0.5]}
        />
        <Suspense fallback={null}>
          <CornerScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
