"use client";

import dynamic from "next/dynamic";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
      }}
    />
  ),
});

export default function Home() {
  return <HeroScene />;
}
