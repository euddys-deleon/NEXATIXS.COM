"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ParticleField, getParticleQuality } from "./ParticleField";

export function HeroParticles() {
  // Lazy initializer: reads navigator/matchMedia once on mount, never re-runs.
  const [quality] = useState(() => getParticleQuality());

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={quality.dpr}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 42], fov: 45, near: 0.1, far: 200 }}
      >
        <ParticleField count={quality.count} />
      </Canvas>
    </div>
  );
}
