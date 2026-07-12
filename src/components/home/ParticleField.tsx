"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { createNoise3D } from "simplex-noise";
import gsap from "gsap";

const LOGO_SRC = "/assets/brand/logo/mark-transparent.png";

const VERTEX_SHADER = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aBrightness;
  varying vec3 vColor;
  varying float vBrightness;

  void main() {
    vColor = aColor;
    vBrightness = aBrightness;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vColor;
  varying float vBrightness;
  uniform float uOpacity;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    if (dist > 0.5) discard;
    float glow = smoothstep(0.5, 0.0, dist);
    glow = pow(glow, 1.6);
    vec3 color = vColor * vBrightness;
    gl_FragColor = vec4(color, glow * uOpacity);
  }
`;

type Quality = { count: number; dpr: [number, number] };

function getQuality(): Quality {
  if (typeof window === "undefined") return { count: 9000, dpr: [1, 1.5] };
  const cores = navigator.hardwareConcurrency || 4;
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return { count: 1500, dpr: [1, 1] };
  if (isMobile || cores <= 4) return { count: 3500, dpr: [1, 1.5] };
  if (cores >= 8) return { count: 14000, dpr: [1, 2] };
  return { count: 9000, dpr: [1, 1.75] };
}

export function getParticleQuality() {
  return getQuality();
}

async function sampleLogoPoints(): Promise<{ x: number; y: number }[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = LOGO_SRC;
    img.onload = () => {
      const sampleSize = 160;
      const off = document.createElement("canvas");
      off.width = sampleSize;
      off.height = sampleSize;
      const ctx = off.getContext("2d");
      if (!ctx) return resolve([]);
      ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
      const data = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
      const points: { x: number; y: number }[] = [];
      const stride = 2;
      for (let y = 0; y < sampleSize; y += stride) {
        for (let x = 0; x < sampleSize; x += stride) {
          const alpha = data[(y * sampleSize + x) * 4 + 3];
          if (alpha > 120) {
            points.push({ x: x / sampleSize - 0.5, y: 0.5 - y / sampleSize });
          }
        }
      }
      resolve(points);
    };
    img.onerror = () => resolve([]);
  });
}

export function ParticleField({ count }: { count: number }) {
  const { camera, viewport, gl } = useThree();
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const noise3D = useMemo(() => createNoise3D(), []);

  // Data-side (non-render) simulation state, kept out of React state for perf.
  // useState's lazy initializer is the documented escape hatch for one-time
  // non-deterministic setup (see react.dev/reference/react/useState#avoiding-recreating-the-initial-state).
  const [sim] = useState(() => {
    const homeX = new Float32Array(count);
    const homeY = new Float32Array(count);
    const homeZ = new Float32Array(count);
    const posX = new Float32Array(count);
    const posY = new Float32Array(count);
    const posZ = new Float32Array(count);
    const velX = new Float32Array(count);
    const velY = new Float32Array(count);
    const velZ = new Float32Array(count);
    const baseSize = new Float32Array(count);
    const isLogo = new Uint8Array(count);
    const logoX = new Float32Array(count);
    const logoY = new Float32Array(count);

    const spreadX = 46;
    const spreadY = 26;
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * spreadX;
      const y = (Math.random() - 0.5) * spreadY;
      const z = (Math.random() - 0.5) * 26;
      homeX[i] = x;
      homeY[i] = y;
      homeZ[i] = z;
      posX[i] = x;
      posY[i] = y;
      posZ[i] = z;
      baseSize[i] = Math.random() * 1.6 + 0.6;
    }

    return { homeX, homeY, homeZ, posX, posY, posZ, velX, velY, velZ, baseSize, isLogo, logoX, logoY, spreadX, spreadY };
  });

  // Same rationale as `sim`: a THREE.BufferGeometry is an imperative GPU resource,
  // not React state, and must keep a stable identity for the lifetime of this count.
  const [geometry] = useState(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(count), 1));
    geo.setAttribute("aColor", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geo.setAttribute("aBrightness", new THREE.BufferAttribute(new Float32Array(count), 1));
    return geo;
  });

  const logoZone = useMemo(
    () => ({
      x: sim.spreadX * 0.24,
      y: 0,
      w: Math.min(viewport.height, 18) * 1.05,
    }),
    [sim.spreadX, viewport.height],
  );

  const blendRef = useRef({ value: 0 });
  const inLogoZoneRef = useRef(false);
  const mouseWorld = useRef(new THREE.Vector3(9999, 9999, 0));
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const groundPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);

  useEffect(() => {
    let cancelled = false;
    sampleLogoPoints().then((points) => {
      if (cancelled || points.length === 0) return;
      const targetCount = Math.min(points.length, Math.floor(count * 0.06));
      const step = Math.max(1, Math.floor(points.length / targetCount));
      const assigned: number[] = [];
      for (let i = 0; i < points.length && assigned.length < targetCount; i += step) {
        assigned.push(i);
      }
      // Assign nearest-by-index particles to logo points for an organic, non-random assembly.
      const scale = Math.min(logoZone.w, 16);
      for (let a = 0; a < assigned.length; a++) {
        const particleIndex = a % count;
        const point = points[assigned[a]];
        sim.isLogo[particleIndex] = 1;
        sim.logoX[particleIndex] = logoZone.x + point.x * scale;
        sim.logoY[particleIndex] = logoZone.y + point.y * scale;
        // Smaller, consistent size so the assembled shape reads as crisp dots, not a blob.
        sim.baseSize[particleIndex] = 0.42 + Math.random() * 0.2;
      }
    });
    return () => {
      cancelled = true;
    };
  }, [count, sim, logoZone]);

  useEffect(() => {
    const canvasEl = gl.domElement;
    function handlePointerMove(event: PointerEvent) {
      const rect = canvasEl.getBoundingClientRect();
      const ndcX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
      const hit = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(groundPlane, hit)) {
        mouseWorld.current.copy(hit);
      }
    }
    function handlePointerLeave() {
      mouseWorld.current.set(9999, 9999, 0);
    }
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [camera, raycaster, groundPlane, gl]);

  useEffect(() => {
    gsap.fromTo(
      materialRef.current?.uniforms.uOpacity ?? { value: 0 },
      { value: 0 },
      { value: 1, duration: 1.8, ease: "power2.out" },
    );
  }, []);

  const uniforms = useMemo(() => ({ uOpacity: { value: 0 } }), []);

  /* eslint-disable react-hooks/immutability --
     Per-frame in-place mutation of typed arrays / buffer attributes is the standard
     react-three-fiber simulation pattern; going through React state (or copying
     15,000-element arrays every frame) is not viable at 60fps. */
  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const { homeX, homeY, homeZ, posX, posY, posZ, velX, velY, velZ, baseSize, isLogo, logoX, logoY } = sim;
    const positions = geometry.attributes.position.array as Float32Array;
    const sizes = geometry.attributes.aSize.array as Float32Array;
    const colors = geometry.attributes.aColor.array as Float32Array;
    const brightness = geometry.attributes.aBrightness.array as Float32Array;

    const mx = mouseWorld.current.x;
    const my = mouseWorld.current.y;

    const dxZone = mx - logoZone.x;
    const dyZone = my - logoZone.y;
    const zoneRadius = logoZone.w * 0.7;
    const hovering = mx < 9000 && dxZone * dxZone + dyZone * dyZone < zoneRadius * zoneRadius;

    if (hovering !== inLogoZoneRef.current) {
      inLogoZoneRef.current = hovering;
      gsap.to(blendRef.current, {
        value: hovering ? 1 : 0,
        duration: hovering ? 0.9 : 1.8,
        ease: hovering ? "power2.out" : "power2.in",
      });
    }
    const blend = blendRef.current.value;

    const time = performance.now() * 0.00012;
    const noiseScale = 0.06;
    const noiseStrength = 1.4;
    const gravity = -0.045;
    const returnStrength = 1.4;
    const logoReturnStrength = 22;
    const friction = 0.9;
    const mouseRadius = 9;
    const mouseForce = 9;

    for (let i = 0; i < count; i++) {
      const px = posX[i];
      const py = posY[i];
      const pz = posZ[i];

      const targetX = homeX[i];
      const targetY = homeY[i];
      const targetZ = homeZ[i];
      let boost = 0;
      let sizeBoost = 0;
      let effectiveReturn = returnStrength;

      if (isLogo[i] === 1 && blend > 0.001) {
        effectiveReturn = returnStrength + blend * logoReturnStrength;
        boost = blend * 0.9;
      }

      // Curl noise via finite differences on a scalar potential field.
      const eps = 0.6;
      const n1 = noise3D(px * noiseScale, (py + eps) * noiseScale, time);
      const n2 = noise3D(px * noiseScale, (py - eps) * noiseScale, time);
      const n3 = noise3D((px + eps) * noiseScale, py * noiseScale, time);
      const n4 = noise3D((px - eps) * noiseScale, py * noiseScale, time);
      const curlX = (n1 - n2) / (2 * eps);
      const curlY = (n4 - n3) / (2 * eps);
      const curlZ = noise3D(px * noiseScale, py * noiseScale, time + 50) * 0.4;

      const noiseFade = isLogo[i] === 1 ? 1 - blend * 0.85 : 1;
      let ax = curlX * noiseStrength * noiseFade;
      let ay = curlY * noiseStrength * noiseFade + gravity;
      let az = curlZ * noiseStrength * noiseFade;

      const logoTargetX = isLogo[i] === 1 ? logoX[i] : targetX;
      const logoTargetY = isLogo[i] === 1 ? logoY[i] : targetY;

      ax += (logoTargetX - px) * effectiveReturn;
      ay += (logoTargetY - py) * effectiveReturn;
      az += (targetZ - pz) * effectiveReturn;

      const dxm = px - mx;
      const dym = py - my;
      const distm = Math.sqrt(dxm * dxm + dym * dym);
      if (distm < mouseRadius && distm > 0.0001) {
        const falloff = 1 - distm / mouseRadius;
        const force = falloff * falloff * mouseForce * (1 - blend * 0.7);
        ax += (dxm / distm) * force;
        ay += (dym / distm) * force;
        boost = Math.max(boost, falloff * 0.8);
        sizeBoost = falloff * 0.8;
      }

      velX[i] = (velX[i] + ax * dt) * friction;
      velY[i] = (velY[i] + ay * dt) * friction;
      velZ[i] = (velZ[i] + az * dt) * friction;

      posX[i] = px + velX[i] * dt * 8;
      posY[i] = py + velY[i] * dt * 8;
      posZ[i] = pz + velZ[i] * dt * 8;

      positions[i * 3] = posX[i];
      positions[i * 3 + 1] = posY[i];
      positions[i * 3 + 2] = posZ[i];

      const size = baseSize[i] * (1 + sizeBoost * 1.4);
      sizes[i] = size;
      brightness[i] = 0.55 + boost * 0.75;

      const hueShift = 0.58 + boost * 0.08;
      const c = tempColor.setHSL(hueShift, 0.75, 0.55 + boost * 0.2);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.aSize.needsUpdate = true;
    geometry.attributes.aColor.needsUpdate = true;
    geometry.attributes.aBrightness.needsUpdate = true;
  });
  /* eslint-enable react-hooks/immutability */

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

const tempColor = new THREE.Color();
