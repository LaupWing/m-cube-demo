"use client";

import { Text3D, Center, useVideoTexture } from "@react-three/drei";
import * as THREE from "three";

const FONT_URL =
  "https://threejs.org/examples/fonts/helvetiker_bold.typeface.json";

export default function VideoText() {
  const texture = useVideoTexture(
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    { muted: true, loop: true, start: true }
  );

  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <Center>
      <mesh>
        <Text3D
          font={FONT_URL}
          size={1.2}
          height={0.6}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.03}
          bevelSize={0.02}
          bevelSegments={5}
        >
          M-CUBE
          <meshStandardMaterial map={texture} />
        </Text3D>
      </mesh>

    </Center>
  );
}
