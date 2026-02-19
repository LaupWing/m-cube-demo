"use client";

import { useMemo, useCallback } from "react";
import { Text3D, Center, useVideoTexture } from "@react-three/drei";
import * as THREE from "three";

const FONT_URL =
  "https://threejs.org/examples/fonts/helvetiker_bold.typeface.json";

// Outside corner (convex, like a street building corner pointing at viewer)
const HALF_ANGLE = Math.PI / 4;
const WALL_WIDTH = 5;
const WALL_HEIGHT = 4;
const WALL_COLOR = "#2a2a40";

const S = Math.SQRT1_2; // 0.707

// LCD params
const BEND_R = 0.12; // radius for smooth wrap around the outer edge
const LCD_OFFSET = 0.08; // distance LCD floats in front of wall surface
const LCD_FAR = 3.5;
const LCD_HEIGHT = 2.8;
const RIGHT_EXTENT = 0.6; // how far LCD continues onto right wall
const LEFT_SEGS = 32;
const ARC_SEGS = 12;
const RIGHT_SEGS = 12;
const HEIGHT_SEGS = 8;

export default function CornerScene() {
  const texture = useVideoTexture(
    "/flatscreen.mp4",
    { muted: true, loop: true, start: true }
  );

  const lcdGeo = useMemo(() => {
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const totalCols = LEFT_SEGS + ARC_SEGS + RIGHT_SEGS;
    const rowCount = HEIGHT_SEGS + 1;

    for (let col = 0; col <= totalCols; col++) {
      let px: number, pz: number;

      if (col <= LEFT_SEGS) {
        // Flat on left wall, offset outward along wall normal (-S, 0, S)
        const t = col / LEFT_SEGS;
        const d = LCD_FAR - t * (LCD_FAR - BEND_R);
        px = d * -S + LCD_OFFSET * -S;
        pz = d * -S + LCD_OFFSET * S;
      } else if (col <= LEFT_SEGS + ARC_SEGS) {
        // 90° arc wrapping around the outer edge of the corner
        // Center behind corner, arc bulges toward viewer
        // Radius expanded by LCD_OFFSET so it sits in front of the wall surface
        const arcT = (col - LEFT_SEGS) / ARC_SEGS;
        const angle = (3 * Math.PI) / 4 - arcT * (Math.PI / 2); // 135° → 45°
        const cz = -BEND_R * Math.SQRT2;
        const r = BEND_R + LCD_OFFSET;
        px = r * Math.cos(angle);
        pz = cz + r * Math.sin(angle);
      } else {
        // Flat on right wall, offset outward along wall normal (S, 0, S)
        const rightT = (col - LEFT_SEGS - ARC_SEGS) / RIGHT_SEGS;
        const d = BEND_R + rightT * (RIGHT_EXTENT - BEND_R);
        px = d * S + LCD_OFFSET * S;
        pz = d * -S + LCD_OFFSET * S;
      }

      const u = col / totalCols;
      for (let row = 0; row <= HEIGHT_SEGS; row++) {
        const v = row / HEIGHT_SEGS;
        const y = (v - 0.5) * LCD_HEIGHT;
        positions.push(px, y, pz);
        uvs.push(u, v);
      }
    }

    for (let col = 0; col < totalCols; col++) {
      for (let row = 0; row < HEIGHT_SEGS; row++) {
        const a = col * rowCount + row;
        const b = a + 1;
        const c = (col + 1) * rowCount + row;
        const d = c + 1;
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Walls — outside corner: corner at origin, walls extend backward
  const lwPos: [number, number, number] = [
    (-WALL_WIDTH / 2) * S,
    0,
    (-WALL_WIDTH / 2) * S,
  ];
  const rwPos: [number, number, number] = [
    (WALL_WIDTH / 2) * S,
    0,
    (-WALL_WIDTH / 2) * S,
  ];

  // M-CUBE text on right wall
  const td = 2.2;
  const textPos: [number, number, number] = [
    td * S + 0.15 * S,
    0,
    td * -S + 0.15 * S,
  ];

  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -WALL_HEIGHT / 2, -2]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#6a6a80" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Left wall */}
      <mesh position={lwPos} rotation={[0, -HALF_ANGLE, 0]} receiveShadow>
        <planeGeometry args={[WALL_WIDTH, WALL_HEIGHT]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>

      {/* Right wall */}
      <mesh position={rwPos} rotation={[0, HALF_ANGLE, 0]} receiveShadow>
        <planeGeometry args={[WALL_WIDTH, WALL_HEIGHT]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>

      {/* 3D M-CUBE text on right wall */}
      <group position={textPos} rotation={[0, HALF_ANGLE, 0]} castShadow>
        <Center>
          <Text3D
            ref={useCallback((mesh: THREE.Mesh) => {
              if (!mesh) return;
              const geo = mesh.geometry;
              geo.computeBoundingBox();
              const bb = geo.boundingBox!;
              const pos = geo.getAttribute("position");
              const uv = geo.getAttribute("uv");
              for (let i = 0; i < pos.count; i++) {
                uv.setXY(
                  i,
                  (pos.getX(i) - bb.min.x) / (bb.max.x - bb.min.x),
                  (pos.getY(i) - bb.min.y) / (bb.max.y - bb.min.y)
                );
              }
              uv.needsUpdate = true;
            }, [])}
            font={FONT_URL}
            size={0.5}
            height={0.15}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.01}
            bevelSegments={3}
          >
            M-CUBE
            <meshBasicMaterial map={texture} />
          </Text3D>
        </Center>
      </group>

      {/* LCD: left wall → tight bend at corner → right wall */}
      <mesh geometry={lcdGeo} castShadow>
        <meshBasicMaterial
          map={texture}
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnit={-1}
        />
      </mesh>
    </group>
  );
}
