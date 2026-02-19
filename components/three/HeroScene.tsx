"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ScrollControls, useScroll } from "@react-three/drei";
import * as THREE from "three";
import CornerScene from "./CornerScene";

const START_POS = new THREE.Vector3(0, 1, 7);
// Camera ends perfectly perpendicular to right wall (normal direction S, 0, S)
const TEXT_CENTER = new THREE.Vector3(1.66, 0, -1.45);
const END_POS = new THREE.Vector3(
  TEXT_CENTER.x + 5 * Math.SQRT1_2,
  0.3,
  TEXT_CENTER.z + 5 * Math.SQRT1_2
);
const START_TARGET = new THREE.Vector3(0, 0, -0.5);
const END_TARGET = TEXT_CENTER;

function CameraRig() {
  const scroll = useScroll();
  const { camera } = useThree();
  const pos = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector3());

  useFrame(() => {
    const t = Math.min(scroll.offset * 2, 1); // complete by 50% scroll
    const ease = t * t * (3 - 2 * t); // smoothstep

    pos.current.lerpVectors(START_POS, END_POS, ease);
    target.current.lerpVectors(START_TARGET, END_TARGET, ease);

    camera.position.copy(pos.current);
    camera.lookAt(target.current);

    // Narrow FOV as we zoom in to flatten perspective (hide sides)
    (camera as THREE.PerspectiveCamera).fov = THREE.MathUtils.lerp(50, 35, ease);
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  });

  return null;
}

export default function HeroScene() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#1a1a2a" }}>
      <Canvas shadows camera={{ position: [0, 0.5, 5], fov: 50 }} scene={{ background: new THREE.Color("#1a1a2a") }}>
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[4, 6, 6]}
          intensity={1.5}
          color="#e8e0f0"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
          shadow-camera-near={0.1}
          shadow-camera-far={30}
        />
        <directionalLight position={[-3, 2, 3]} intensity={0.6} color="#4060ff" />
        <pointLight position={[0, 0, 3]} intensity={1.5} color="#ffffff" distance={12} decay={2} />
        <ScrollControls pages={3} damping={0.15}>
          <CameraRig />
          <Suspense fallback={null}>
            <CornerScene />
          </Suspense>
        </ScrollControls>
      </Canvas>
    </div>
  );
}
