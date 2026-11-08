"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TEMPLATES } from "./anatomy";
import { curveOf } from "./core";
import { FlowParticles, OrganMesh, VesselMesh } from "./ProcedureScene";

function Torso() {
  const geo = useMemo(() => {
    const prof: [number, number][] = [
      [0.05, -3.9], [0.85, -3.7], [1.12, -2.7], [1.2, -2.0], [1.02, -1.0], [1.05, 0], [1.25, 1.2],
      [1.45, 2.3], [1.62, 2.8], [1.05, 3.25], [0.45, 3.45], [0.42, 4.0], [0.05, 4.05],
    ];
    return new THREE.LatheGeometry(prof.map(([x, y]) => new THREE.Vector2(x, y)), 64);
  }, []);
  return (
    <group scale={[1, 1, 0.55]}>
      <mesh geometry={geo}>
        <meshPhysicalMaterial color="#52D6E8" transparent opacity={0.055} roughness={0.2} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geo}>
        <meshBasicMaterial color="#52D6E8" wireframe transparent opacity={0.04} />
      </mesh>
    </group>
  );
}

function Body({ reduced, offsetX }: { reduced: boolean; offsetX: number }) {
  const tpl = TEMPLATES.body;
  const items = useMemo(() => tpl.vessels.map((def) => ({ def, curve: curveOf(def.pts) })), [tpl]);
  const group = useRef<THREE.Group>(null);
  useFrame(({ pointer, clock, camera }, dt) => {
    const g = group.current;
    if (!g) return;
    const k = 1 - Math.exp(-dt * 2);
    const t = clock.elapsedTime;
    g.rotation.y += ((reduced ? 0 : pointer.x * 0.45 + Math.sin(t * 0.15) * 0.25) - g.rotation.y) * k;
    g.rotation.x += ((reduced ? 0 : -pointer.y * 0.12) - g.rotation.x) * k;
    if (!reduced) {
      camera.position.x = Math.sin(t * 0.08) * 0.5;
      camera.position.y = 0.3 + Math.sin(t * 0.11) * 0.25;
      camera.lookAt(offsetX * 0.4, 0.2, 0);
    }
  });
  return (
    <group ref={group} position={[offsetX, -0.35, 0]} scale={0.86}>
      <Torso />
      {items.map(({ def, curve }) => (
        <VesselMesh key={def.id} def={def} curve={curve} opacity={def.kind === "artery" ? 0.7 : 0.55} pulse={def.id === "aorta"} />
      ))}
      {tpl.organs.map((o) => <OrganMesh key={o.id} o={o} />)}
      <FlowParticles items={items} factor={() => 1} speed={reduced ? 0.3 : 1} />
    </group>
  );
}

export default function HeroScene({ reduced, offsetX = 0, active = true }: { reduced: boolean; offsetX?: number; active?: boolean }) {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0.3, 9], fov: 38 }} gl={{ antialias: true, alpha: true }}
      frameloop={active ? "always" : "never"} data-testid="hero-3d-canvas">
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 6, 6]} intensity={1.2} />
      <pointLight position={[-4, 2, 4]} intensity={30} color="#52D6E8" />
      <pointLight position={[3, -2, 3]} intensity={18} color="#00B8B0" />
      <fog attach="fog" args={["#071525", 9, 18]} />
      <Body reduced={reduced} offsetX={offsetX} />
    </Canvas>
  );
}
