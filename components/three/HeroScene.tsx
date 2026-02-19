"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import VideoText from "./VideoText";

export default function HeroScene() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000" }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <OrbitControls enableDamping dampingFactor={0.1} />
        <Suspense fallback={null}>
          <VideoText />
        </Suspense>
      </Canvas>
    </div>
  );
}
