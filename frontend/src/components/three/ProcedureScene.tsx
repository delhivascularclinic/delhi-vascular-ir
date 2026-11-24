"use client";

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { TEMPLATES } from "./anatomy";
import {
  KIND_COLOR, buildRoute, clamp01, curveOf, revealTube, rng, subCurve, tubeGeometry, vec, vesselRadiusAt,
  type AnatomyTemplate, type CurveMap, type DeviceDef, type LesionDef, type OrganDef, type SceneConfig, type VesselDef,
} from "./core";

export type Compare = "none" | "normal" | "disease";
export interface Eff { phase: number; p: number }
export interface ControlsApi { zoom: (f: number) => void; reset: () => void; setAutoRotate: (b: boolean) => void }

const growth = (e: Eff) => (e.phase === 1 ? e.p : e.phase > 1 ? 1 : 0);
const treat = (e: Eff) => (e.phase === 4 ? e.p : e.phase === 5 ? 1 : 0);
const SEVERITY: Partial<Record<LesionDef["type"], number>> = { occlusion: 0.92, thrombus: 0.9, stenosis: 0.6, compression: 0.65, stricture: 0.7 };
const PERSIST = new Set(["stent", "graft", "coil", "flow-diverter", "filter", "cement", "drain", "embolic", "liquid-embolic", "endovenous"]);

function useLevel(fn: () => number, levels = 12) {
  const [lv, setLv] = useState(0);
  const cur = useRef(-1);
  useFrame(() => {
    const n = Math.round(clamp01(fn()) * levels);
    if (n !== cur.current) {
      cur.current = n;
      setLv(n);
    }
  });
  return lv / levels;
}

/* ───────────────────────── shared parts (also used by the hero) ───────────────────────── */

export function VesselMesh({ def, curve, opacity, selected, onSelect, visibleFn, pulse }: {
  def: VesselDef; curve: THREE.CatmullRomCurve3; opacity: number; selected?: boolean;
  onSelect?: (id: string) => void; visibleFn?: () => number; pulse?: boolean;
}) {
  const geo = useMemo(() => {
    const tub = Math.min(180, Math.max(24, Math.round(curve.getLength() * 28)));
    return tubeGeometry(curve, (u) => vesselRadiusAt(def, u), tub, 14);
  }, [curve, def]);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null);
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!mat.current) return;
    const vis = visibleFn ? visibleFn() : 1;
    mat.current.opacity = opacity * vis;
    mesh.current!.visible = vis > 0.01;
    const beat = pulse ? Math.pow(Math.max(0, Math.sin(clock.elapsedTime * 5.2)), 6) : 0;
    mat.current.emissiveIntensity = (selected ? 0.9 : 0.18) + beat * 0.8;
  });
  const color = KIND_COLOR[def.kind];
  return (
    <mesh
      ref={mesh}
      geometry={geo}
      onClick={onSelect ? (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(def.id); } : undefined}
      onPointerOver={onSelect ? () => (document.body.style.cursor = "pointer") : undefined}
      onPointerOut={onSelect ? () => (document.body.style.cursor = "") : undefined}
    >
      <meshPhysicalMaterial ref={mat} color={color} emissive={selected ? "#C9D4DF" : color} transparent opacity={opacity}
        roughness={0.32} metalness={0.05} clearcoat={0.7} clearcoatRoughness={0.25} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

export function OrganMesh({ o, selected, onSelect }: { o: OrganDef; selected?: boolean; onSelect?: (id: string) => void }) {
  return (
    <mesh position={o.pos} scale={o.scale} rotation={o.rot ?? [0, 0, 0]}
      onClick={onSelect ? (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(o.id); } : undefined}>
      {o.shape === "box" ? <boxGeometry args={[1, 1, 1]} /> : o.shape === "capsule" ? <capsuleGeometry args={[1, 1.6, 6, 16]} /> : <sphereGeometry args={[1, 40, 28]} />}
      <meshPhysicalMaterial color={o.color} transparent opacity={selected ? Math.min(0.5, (o.opacity ?? 0.16) * 2.4) : o.opacity ?? 0.16}
        roughness={0.55} depthWrite={false} emissive={selected ? "#C9D4DF" : "#000000"} emissiveIntensity={0.25} />
    </mesh>
  );
}

export interface FlowItem { def: VesselDef; curve: THREE.CatmullRomCurve3 }

export function FlowParticles({ items, factor, speed = 1 }: { items: FlowItem[]; factor: (id: string) => number; speed?: number }) {
  const data = useMemo(() => {
    const out: { i: number; u: number; slot: number; len: number }[] = [];
    items.forEach((it, i) => {
      const len = it.curve.getLength();
      const n = Math.min(42, Math.max(4, Math.round(len * 7)));
      for (let k = 0; k < n; k++) out.push({ i, u: k / n, slot: (k * 0.618) % 1, len });
    });
    return out;
  }, [items]);
  const ref = useRef<THREE.InstancedMesh>(null);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const P = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const c = new THREE.Color();
    data.forEach((d, k) => {
      const kind = items[d.i].def.kind;
      c.set(kind === "artery" ? "#ff5a6a" : kind === "vein" ? "#6fa8ff" : kind === "portal" ? "#b994ff" : "#7fe3b0");
      m.setColorAt(k, c);
    });
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [data, items]);
  useFrame((_, dt) => {
    const m = ref.current;
    if (!m) return;
    const fac = items.map((it) => factor(it.def.id));
    data.forEach((d, k) => {
      const it = items[d.i];
      const f = fac[d.i];
      const base = it.def.kind === "artery" ? 1.15 : 0.6;
      d.u = (d.u + (Math.min(dt, 0.05) * base * speed * (0.25 + 0.75 * f)) / d.len) % 1;
      const visible = d.slot < f;
      const t = (it.def.dir ?? 1) === 1 ? d.u : 1 - d.u;
      it.curve.getPointAt(t, P);
      tmp.position.copy(P);
      const s = visible ? Math.min(1.2, Math.max(0.45, vesselRadiusAt(it.def, t) * 9)) : 0;
      tmp.scale.setScalar(s);
      tmp.updateMatrix();
      m.setMatrixAt(k, tmp.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, data.length]} frustumCulled={false}>
      <sphereGeometry args={[0.022, 6, 6]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

function Tag({ position, text, tone = "light" }: { position: THREE.Vector3 | [number, number, number]; text: string; tone?: "light" | "alert" }) {
  return (
    <Html position={position} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div className={`whitespace-nowrap rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider backdrop-blur-md ${tone === "alert" ? "border-[#ff7a7a]/60 bg-[#3a0d14]/80 text-[#ffb4b4]" : "border-[#C9D4DF]/40 bg-[#0c1a2a]/80 text-[#f1f4f7]"}`}>
        {text}
      </div>
    </Html>
  );
}

/* ───────────────────────── scene context ───────────────────────── */

interface Ctx {
  cfg: SceneConfig;
  tpl: AnatomyTemplate;
  vmap: Map<string, VesselDef>;
  curves: CurveMap;
  routes: THREE.CatmullRomCurve3[];
  lpts: THREE.Vector3[];
  lr: number[]; // local vessel radius at each lesion
  eff: () => Eff;
}

function lesionPoint(l: LesionDef, curves: CurveMap) {
  const base = l.pos ? vec(l.pos) : curves.get(l.vessel ?? "")?.getPointAt(l.t ?? 0.5).clone() ?? new THREE.Vector3();
  if (l.offset) base.add(vec(l.offset));
  return base;
}

function lesionCurve(l: LesionDef, ctx: Ctx, pad = 0) {
  const c = ctx.curves.get(l.vessel ?? "");
  if (!c) return null;
  const half = (l.len ?? 0.1) / 2 + pad;
  return subCurve(c, (l.t ?? 0.5) - half, (l.t ?? 0.5) + half, 28);
}

/* ───────────────────────── lesions ───────────────────────── */

const LESION_COLOR: Record<string, string> = {
  stenosis: "#f2d27a", occlusion: "#e9c46a", compression: "#f39a5b", stricture: "#c8a46b", thrombus: "#6a1220", reflux: "#ff7a59",
};

function TubeLesion({ l, i, ctx }: { l: LesionDef; i: number; ctx: Ctx }) {
  const curve = useMemo(() => lesionCurve(l, ctx), [l, ctx]);
  const amt = useLevel(() => {
    const e = ctx.eff();
    const g = growth(e);
    const tr = treat(e);
    if (l.type === "thrombus") return g * (1 - tr);
    if (l.type === "reflux") return g;
    return g * (1 - 0.72 * tr);
  }, 14);
  const closed = useLevel(() => (l.type === "reflux" ? treat(ctx.eff()) : 0), 6);
  const geo = useMemo(() => {
    if (!curve || amt < 0.02) return null;
    const rv = ctx.lr[i];
    const prof = (u: number) => {
      const s = Math.sin(Math.PI * u);
      if (l.type === "occlusion") return rv * 0.97 * Math.pow(s, 0.25) * amt;
      if (l.type === "thrombus") return rv * 0.93 * (0.75 + 0.25 * Math.sin(u * 19)) * Math.pow(s, 0.3) * amt;
      if (l.type === "reflux") return rv * (1 + 0.35 * amt) * Math.pow(s, 0.15);
      return rv * (0.3 + 0.62 * s) * amt;
    };
    return tubeGeometry(curve, prof, 48, 12);
  }, [curve, amt, ctx, i, l.type]);
  if (!geo) return null;
  const color = l.type === "reflux" && closed > 0.5 ? "#8895a7" : LESION_COLOR[l.type];
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} roughness={l.type === "thrombus" ? 0.9 : 0.6} transparent opacity={l.type === "reflux" ? 0.45 : 0.95}
        emissive={l.type === "thrombus" ? "#300" : "#3a2a00"} emissiveIntensity={0.3} />
    </mesh>
  );
}

function BlobLesion({ l, i, ctx, devices }: { l: LesionDef; i: number; ctx: Ctx; devices: DeviceDef[] }) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const pos = ctx.lpts[i];
  const size = l.size ?? 0.2;
  const ablative = devices.some((d) => d.type.startsWith("ablation"));
  const geo = useMemo(() => {
    if (l.type !== "tumour" && l.type !== "nidus") return null;
    const g = new THREE.IcosahedronGeometry(1, 3);
    const r = rng(7 + i * 13);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let k = 0; k < p.count; k++) {
      const f = 0.86 + r() * 0.22;
      p.setXYZ(k, p.getX(k) * f, p.getY(k) * f, p.getZ(k) * f);
    }
    g.computeVertexNormals();
    return g;
  }, [l.type, i]);
  const quat = useMemo(() => {
    const c = ctx.curves.get(l.vessel ?? "");
    if (!c) return new THREE.Quaternion();
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), c.getTangentAt(l.t ?? 0.5));
  }, [ctx, l]);
  const cA = useMemo(() => new THREE.Color(), []);
  const cB = useMemo(() => new THREE.Color(), []);
  useFrame(({ clock }) => {
    if (!mesh.current || !mat.current) return;
    const e = ctx.eff();
    const g = growth(e);
    const tr = treat(e);
    const beat = 0.5 + 0.5 * Math.sin(clock.elapsedTime * 4);
    let s = size * g;
    let base = "#c34b8f";
    let done = "#4b2a3a";
    let op = 0.85;
    if (l.type === "aneurysm") { base = "#e0475a"; done = "#7b8794"; op = 0.55; }
    if (l.type === "tumour") { base = "#c34b8f"; done = ablative ? "#5f6670" : "#3a2230"; s *= 1 - 0.15 * tr; }
    if (l.type === "nidus") { base = "#d04a86"; done = "#cfd8dc"; }
    if (l.type === "bleed") { base = "#ff2a3d"; s *= (0.85 + 0.25 * beat) * (1 - tr); op = 0.75; }
    if (l.type === "collection") { base = "#c9b458"; done = "#c9b458"; s *= 1 - 0.75 * tr; op = 0.6; }
    if (l.type === "fracture") { base = "#ff8a3d"; done = "#b3a58f"; op = 0.8; }
    if (l.type === "inflammation") { base = "#ff9f43"; s *= (0.9 + 0.15 * beat) * (1 - 0.8 * tr); op = 0.45; }
    mesh.current.visible = s > 0.005;
    if (l.type === "aneurysm") mesh.current.scale.set(s, s * 1.35, s);
    else if (l.type === "fracture") mesh.current.scale.set(0.98 * g, 0.06, 0.88 * g);
    else mesh.current.scale.setScalar(s);
    mat.current.color.copy(cA.set(base).lerp(cB.set(done), tr));
    mat.current.opacity = op;
    mat.current.emissive.copy(mat.current.color);
    mat.current.emissiveIntensity = 0.25 + (l.type === "bleed" ? beat * 0.6 : 0) * (1 - tr);
  });
  return (
    <mesh ref={mesh} position={pos} quaternion={quat} geometry={geo ?? undefined}>
      {!geo && (l.type === "fracture" ? <boxGeometry args={[1, 1, 1]} /> : <sphereGeometry args={[1, 32, 24]} />)}
      <meshStandardMaterial ref={mat} transparent roughness={0.5} depthWrite={false} wireframe={l.type === "nidus"} />
    </mesh>
  );
}

/* ───────────────────────── devices ───────────────────────── */

function deviceDp(d: DeviceDef, all: DeviceDef[], e: Eff) {
  const stages = [...new Set(all.map((x) => x.stage ?? 0))].sort((a, b) => a - b);
  const k = stages.indexOf(d.stage ?? 0);
  const n = stages.length;
  if (e.phase === 4) return { dp: clamp01((e.p - k / n) * n), on: e.p >= k / n };
  if (e.phase === 5) return { dp: 1, on: PERSIST.has(d.type) };
  return { dp: 0, on: false };
}

function devCurve(d: DeviceDef, ctx: Ctx) {
  if (d.pts) return curveOf(d.pts);
  if (d.seg) {
    const c = ctx.curves.get(d.seg[0]);
    return c ? subCurve(c, d.seg[1], d.seg[2], 30) : null;
  }
  const l = ctx.cfg.lesions[d.lesion ?? 0];
  return l ? lesionCurve(l, ctx, 0.03) : null;
}

function devRadius(d: DeviceDef, ctx: Ctx) {
  if (d.seg) {
    const v = ctx.vmap.get(d.seg[0]);
    return v ? vesselRadiusAt(v, (d.seg[1] + d.seg[2]) / 2) : 0.06;
  }
  return ctx.lr[d.lesion ?? 0] ?? 0.06;
}

function TubeDevice({ d, ctx }: { d: DeviceDef; ctx: Ctx }) {
  const curve = useMemo(() => devCurve(d, ctx), [d, ctx]);
  const rv = devRadius(d, ctx) * (d.scale ?? 1);
  const isBalloon = d.type === "balloon" || d.type === "dcb";
  const lv = useLevel(() => {
    const e = ctx.eff();
    const { dp, on } = deviceDp(d, ctx.cfg.devices, e);
    if (!on) return 0;
    if (isBalloon) return dp < 0.35 ? 0.2 + (dp / 0.35) * 0.8 : dp < 0.75 ? 1 : 1 - ((dp - 0.75) / 0.25) * 0.85;
    if (d.type === "stent-retriever") return dp < 0.3 ? 0.3 + dp * 2.3 : 1;
    if (d.type === "endovenous") return Math.max(0.05, dp);
    return 0.35 + 0.65 * clamp01(dp * 1.6) + 0.0001;
  }, 10);
  const shift = useLevel(() => {
    if (d.type !== "stent-retriever") return 0;
    const { dp } = deviceDp(d, ctx.cfg.devices, ctx.eff());
    return clamp01((dp - 0.5) * 2);
  }, 10);
  const geo = useMemo(() => {
    if (!curve || lv <= 0) return null;
    if (d.type === "endovenous") {
      const g = tubeGeometry(curve, () => rv * 0.7, 60, 10);
      revealTube(g, 60, 10, lv);
      return g;
    }
    const dense = d.type === "flow-diverter";
    const prof = isBalloon ? (u: number) => rv * lv * 0.95 * Math.pow(Math.sin(Math.PI * u), 0.35) : () => rv * lv * 0.97;
    return tubeGeometry(curve, prof, dense ? 70 : 34, dense ? 26 : 10);
  }, [curve, lv, rv, d.type, isBalloon]);
  if (!geo || !curve) return null;
  const offset = shift > 0 ? curve.getTangentAt(0).multiplyScalar(-shift * 0.9) : new THREE.Vector3();
  if (isBalloon) {
    return (
      <mesh geometry={geo}>
        <meshPhysicalMaterial color={d.type === "dcb" ? "#7ee0c9" : "#C9D4DF"} transparent opacity={0.55} roughness={0.15} clearcoat={1}
          emissive={d.type === "dcb" ? "#B3121B" : "#1b6f7a"} emissiveIntensity={0.35} depthWrite={false} />
      </mesh>
    );
  }
  if (d.type === "endovenous") {
    return (
      <mesh geometry={geo}>
        <meshStandardMaterial color="#9aa7b6" transparent opacity={0.85} roughness={0.7} />
      </mesh>
    );
  }
  return (
    <mesh geometry={geo} position={offset}>
      <meshStandardMaterial color={d.color ?? (d.type === "stent-retriever" ? "#e3e9ef" : "#d6dee6")} wireframe metalness={0.9} roughness={0.25}
        emissive="#C9D4DF" emissiveIntensity={d.type === "stent-retriever" ? 0.5 : 0.12} />
    </mesh>
  );
}

function GraftDevice({ d, ctx }: { d: DeviceDef; ctx: Ctx }) {
  const parts = useMemo(() => (d.segs ?? []).map(([id, t0, t1]) => {
    const c = ctx.curves.get(id)!;
    const v = ctx.vmap.get(id)!;
    const sc = subCurve(c, t0, t1, 30);
    const g = tubeGeometry(sc, (u) => vesselRadiusAt(v, t0 + (t1 - t0) * u) * 0.92, 50, 18);
    const rings: THREE.Vector3[] = [];
    for (let k = 0; k <= 6; k++) rings.push(sc.getPointAt(k / 6));
    return { g, sc, v, t0, t1, rings };
  }), [d, ctx]);
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    const { dp, on } = deviceDp(d, ctx.cfg.devices, ctx.eff());
    if (group.current) group.current.visible = on;
    const n = parts.length;
    parts.forEach((p, k) => revealTube(p.g, 50, 18, on ? clamp01((dp - k / n) * n) : 0));
  });
  return (
    <group ref={group}>
      {parts.map((p, k) => (
        <mesh key={k} geometry={p.g}>
          <meshPhysicalMaterial color="#eef3f7" transparent opacity={0.78} roughness={0.6} sheen={1} sheenColor="#bfe9ef" side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function CoilDevice({ d, ctx }: { d: DeviceDef; ctx: Ctx }) {
  const li = d.lesion ?? 0;
  const l = ctx.cfg.lesions[li];
  const { geo, segs } = useMemo(() => {
    const c = ctx.lpts[li];
    const R = (l?.size ?? 0.2) * 0.72;
    const r = rng(31 + li);
    const pts: THREE.Vector3[] = [];
    let p = new THREE.Vector3(0, -R * 0.6, 0);
    for (let k = 0; k < 140; k++) {
      const step = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(R * 0.35);
      let q = p.clone().add(step);
      if (q.length() > R) q = q.setLength(R * (0.6 + r() * 0.35));
      pts.push(q.clone().add(c));
      p = q;
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    return { geo: tubeGeometry(curve, () => 0.011, 600, 5), segs: 600 };
  }, [ctx, li, l]);
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const { dp, on } = deviceDp(d, ctx.cfg.devices, ctx.eff());
    if (mesh.current) mesh.current.visible = on;
    revealTube(geo, segs, 5, dp);
  });
  return (
    <mesh ref={mesh} geometry={geo}>
      <meshStandardMaterial color="#dde3ea" metalness={1} roughness={0.25} emissive="#7fa9c0" emissiveIntensity={0.15} />
    </mesh>
  );
}

function FilterDevice({ d, ctx }: { d: DeviceDef; ctx: Ctx }) {
  const li = d.lesion ?? 0;
  const l = ctx.cfg.lesions[li];
  const small = d.type === "epd";
  const { pos, quat } = useMemo(() => {
    const c = ctx.curves.get(d.seg?.[0] ?? l?.vessel ?? "");
    const t = (d.seg?.[1] ?? l?.t ?? 0.5) + (small ? 0.16 : 0);
    const pos = c ? c.getPointAt(Math.min(0.98, t)) : ctx.lpts[li];
    const tan = c ? c.getTangentAt(Math.min(0.98, t)) : new THREE.Vector3(0, 1, 0);
    return { pos, quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan) };
  }, [ctx, l, li, small]);
  const rv = (d.seg ? devRadius(d, ctx) : ctx.lr[li]) * (small ? 0.9 : 0.95);
  const len = small ? rv * 2.2 : rv * 3;
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    const { dp, on } = deviceDp(d, ctx.cfg.devices, ctx.eff());
    if (!group.current) return;
    group.current.visible = on;
    const open = 0.15 + 0.85 * clamp01(dp * 1.8);
    group.current.scale.set(open, 1, open);
  });
  const legs = Array.from({ length: small ? 10 : 8 }, (_, k) => {
    const a = (k / (small ? 10 : 8)) * Math.PI * 2;
    return [new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(a) * rv * 0.6, -len * 0.5, Math.sin(a) * rv * 0.6), new THREE.Vector3(Math.cos(a) * rv, -len, Math.sin(a) * rv)];
  });
  return (
    <group position={pos} quaternion={quat}>
      <group ref={group}>
        {legs.map((pts, k) => <Line key={k} points={pts} color={small ? "#e3e9ef" : "#e6edf3"} lineWidth={1.6} />)}
        {small && (
          <mesh position={[0, -len * 0.8, 0]}>
            <sphereGeometry args={[rv * 0.95, 14, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
            <meshStandardMaterial color="#e3e9ef" wireframe transparent opacity={0.6} />
          </mesh>
        )}
      </group>
    </group>
  );
}

function EmbolicDevice({ d, ctx }: { d: DeviceDef; ctx: Ctx }) {
  const li = d.lesion ?? 0;
  const route = ctx.routes[d.route ?? 0];
  const N = d.type === "liquid-embolic" ? 40 : 70;
  const seeds = useMemo(() => {
    const r = rng(101 + li);
    const R = (ctx.cfg.lesions[li]?.size ?? 0.2) * 0.85;
    return Array.from({ length: N }, () => new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(R * Math.cbrt(r())));
  }, [li, ctx, N]);
  const ref = useRef<THREE.InstancedMesh>(null);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    const { dp, on } = deviceDp(d, ctx.cfg.devices, ctx.eff());
    m.visible = on;
    const tip = route ? route.getPointAt(1) : ctx.lpts[li];
    const target = ctx.lpts[li];
    seeds.forEach((s, k) => {
      const start = k / N;
      const f = clamp01((dp * 1.4 - start) * 3);
      tmp.position.copy(tip).lerp(target.clone().add(s), f);
      tmp.scale.setScalar(dp * 1.4 > start ? 1 : 0);
      tmp.updateMatrix();
      m.setMatrixAt(k, tmp.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N]} frustumCulled={false}>
      <sphereGeometry args={[d.type === "liquid-embolic" ? 0.028 : 0.018, 8, 8]} />
      <meshStandardMaterial color={d.color ?? "#f5a524"} emissive={d.color ?? "#f5a524"} emissiveIntensity={0.6} toneMapped={false} />
    </instancedMesh>
  );
}

function ZoneDevice({ d, ctx }: { d: DeviceDef; ctx: Ctx }) {
  const li = d.lesion ?? 0;
  const size = (ctx.cfg.lesions[li]?.size ?? 0.2) * (d.scale ?? 1);
  const mesh = useRef<THREE.Mesh>(null);
  const margin = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const kind = d.type;
  const color = kind === "ablation-cryo" ? "#a8e6ff" : kind === "cement" ? "#f4f1e8" : kind === "kypho-balloon" ? "#C9D4DF" : kind === "inject" ? "#7ee0ff" : "#ff8a3d";
  const ablation = kind.startsWith("ablation");
  useFrame(({ clock }) => {
    const e = ctx.eff();
    const { dp, on } = deviceDp(d, ctx.cfg.devices, e);
    if (!mesh.current || !mat.current) return;
    const finalShow = e.phase === 5 && (ablation || kind === "cement");
    mesh.current.visible = on || finalShow;
    let s = size;
    if (ablation) s = size * 1.55 * (e.phase === 5 ? 1 : dp);
    else if (kind === "kypho-balloon") s = size * (dp < 0.7 ? dp / 0.7 : 1 - (dp - 0.7) / 0.3);
    else if (kind === "inject") s = size * 1.4 * dp;
    else s = size * (e.phase === 5 ? 1 : dp);
    mesh.current.scale.setScalar(Math.max(0.001, s));
    mat.current.opacity = ablation ? (e.phase === 5 ? 0.22 : 0.38 + 0.1 * Math.sin(clock.elapsedTime * 6)) : kind === "cement" ? 0.95 : 0.45;
    mat.current.color.set(ablation && e.phase === 5 ? "#9aa5b1" : color);
    if (margin.current) margin.current.visible = ablation && (on || e.phase === 2 || e.phase === 3);
  });
  const show = ablation || kind === "cement" || kind === "kypho-balloon" || kind === "inject";
  if (!show) return null;
  return (
    <group position={ctx.lpts[li]}>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1, 3]} />
        <meshStandardMaterial ref={mat} color={color} transparent emissive={color} emissiveIntensity={0.5} depthWrite={false} />
      </mesh>
      {ablation && (
        <mesh ref={margin} scale={size * 1.55}>
          <icosahedronGeometry args={[1, 2]} />
          <meshBasicMaterial color="#C9D4DF" wireframe transparent opacity={0.35} />
        </mesh>
      )}
    </group>
  );
}

function DrainDevice({ d, ctx }: { d: DeviceDef; ctx: Ctx }) {
  const route = ctx.routes[d.route ?? 0];
  const { geo, loop } = useMemo(() => {
    const geo = tubeGeometry(route, () => 0.026, 160, 8);
    const end = route.getPointAt(1);
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= 40; k++) {
      const a = (k / 40) * Math.PI * 1.8;
      pts.push(new THREE.Vector3(end.x + Math.sin(a) * 0.09, end.y - (1 - Math.cos(a)) * 0.09, end.z));
    }
    return { geo, loop: tubeGeometry(new THREE.CatmullRomCurve3(pts), () => 0.024, 40, 8) };
  }, [route]);
  const loopRef = useRef<THREE.Mesh>(null);
  const grp = useRef<THREE.Group>(null);
  useFrame(() => {
    const { dp, on } = deviceDp(d, ctx.cfg.devices, ctx.eff());
    if (grp.current) grp.current.visible = on;
    revealTube(geo, 160, 8, clamp01(dp * 1.5));
    if (loopRef.current) loopRef.current.visible = dp > 0.66;
  });
  return (
    <group ref={grp}>
      <mesh geometry={geo}><meshStandardMaterial color="#f3f6f9" roughness={0.4} emissive="#C9D4DF" emissiveIntensity={0.08} /></mesh>
      <mesh ref={loopRef} geometry={loop}><meshStandardMaterial color="#f3f6f9" roughness={0.4} /></mesh>
    </group>
  );
}

function ThrombectomyDevice({ d, ctx }: { d: DeviceDef; ctx: Ctx }) {
  const curve = useMemo(() => devCurve(d, ctx), [d, ctx]);
  const rv = devRadius(d, ctx);
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!mesh.current || !curve) return;
    const { dp, on } = deviceDp(d, ctx.cfg.devices, ctx.eff());
    mesh.current.visible = on && dp < 0.999;
    const t = d.type === "aspiration" ? 0.02 + dp * 0.9 : 1 - dp;
    mesh.current.position.copy(curve.getPointAt(clamp01(t)));
    mesh.current.rotation.set(clock.elapsedTime * 3, clock.elapsedTime * 5, 0);
  });
  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[rv * 0.85, 1]} />
      <meshStandardMaterial color="#e3e9ef" wireframe emissive="#C9D4DF" emissiveIntensity={0.6} />
    </mesh>
  );
}

function BiopsyCore({ d, ctx }: { d: DeviceDef; ctx: Ctx }) {
  const route = ctx.routes[d.route ?? 0];
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const { dp, on } = deviceDp(d, ctx.cfg.devices, ctx.eff());
    if (!mesh.current) return;
    mesh.current.visible = on;
    const t = dp < 0.5 ? 1 : 1 - (dp - 0.5) * 1.6;
    mesh.current.position.copy(route.getPointAt(clamp01(t)));
  });
  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[0.04, 12, 10]} />
      <meshStandardMaterial color="#c34b8f" emissive="#c34b8f" emissiveIntensity={0.5} />
    </mesh>
  );
}

function Device({ d, ctx }: { d: DeviceDef; ctx: Ctx }) {
  switch (d.type) {
    case "graft": return <GraftDevice d={d} ctx={ctx} />;
    case "coil": return <CoilDevice d={d} ctx={ctx} />;
    case "filter": case "epd": return <FilterDevice d={d} ctx={ctx} />;
    case "embolic": case "liquid-embolic": return <EmbolicDevice d={d} ctx={ctx} />;
    case "drain": return <DrainDevice d={d} ctx={ctx} />;
    case "thrombectomy": case "aspiration": return <ThrombectomyDevice d={d} ctx={ctx} />;
    case "biopsy": return <BiopsyCore d={d} ctx={ctx} />;
    case "ablation-rfa": case "ablation-mwa": case "ablation-cryo": case "cement": case "kypho-balloon": case "inject":
      return <ZoneDevice d={d} ctx={ctx} />;
    default: return <TubeDevice d={d} ctx={ctx} />;
  }
}

/* ───────────────────────── wires, plan, camera ───────────────────────── */

function RouteWire({ curve, needle, ctx, hideCatheter }: { curve: THREE.CatmullRomCurve3; needle?: boolean; ctx: Ctx; hideCatheter?: boolean }) {
  const { wire, cath } = useMemo(() => ({
    wire: tubeGeometry(curve, () => (needle ? 0.016 : 0.009), 220, 6),
    cath: tubeGeometry(curve, () => 0.022, 220, 8),
  }), [curve, needle]);
  const plan = useMemo(() => curve.getPoints(160), [curve]);
  const line = useRef<{ material: { dashOffset: number } } | null>(null);
  const planRef = useRef<THREE.Object3D>(null);
  const cathRef = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    const e = ctx.eff();
    let w = 0;
    let c = 0;
    if (e.phase === 3) { w = Math.min(1, e.p * 1.35); c = clamp01((e.p - 0.25) * 1.4); }
    if (e.phase === 4) { w = 1; c = 1; }
    if (e.phase === 5) { w = 1 - e.p * 1.5; c = 1 - e.p * 1.5; }
    revealTube(wire, 220, 6, w);
    revealTube(cath, 220, 8, needle || hideCatheter ? 0 : c);
    if (cathRef.current) cathRef.current.visible = !needle && !hideCatheter;
    if (planRef.current) planRef.current.visible = e.phase === 2;
    if (line.current) line.current.material.dashOffset -= dt * 0.4;
  });
  return (
    <group>
      <mesh geometry={wire}><meshStandardMaterial color={needle ? "#cfd8e3" : "#eef4f8"} metalness={0.95} roughness={0.2} emissive="#C9D4DF" emissiveIntensity={0.15} /></mesh>
      <mesh ref={cathRef} geometry={cath}><meshPhysicalMaterial color="#C9D4DF" transparent opacity={0.7} roughness={0.2} emissive="#B3121B" emissiveIntensity={0.3} /></mesh>
      <group ref={planRef}>
        <Line ref={line as never} points={plan} color="#C9D4DF" lineWidth={2.2} dashed dashSize={0.14} gapSize={0.09} />
      </group>
    </group>
  );
}

function TargetMarkers({ ctx }: { ctx: Ctx }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const e = ctx.eff();
    if (!g.current) return;
    g.current.visible = e.phase === 2 || e.phase === 3;
    const s = 1 + 0.15 * Math.sin(clock.elapsedTime * 4);
    g.current.children.forEach((c) => c.scale.setScalar(s));
  });
  return (
    <group ref={g}>
      {ctx.lpts.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[Math.max(0.12, (ctx.cfg.lesions[i].size ?? 0.15) * 1.3), 16, 12]} />
          <meshBasicMaterial color="#C9D4DF" wireframe transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function Rig({ tpl, focus, ctx, apiRef, reduced }: { tpl: AnatomyTemplate; focus: THREE.Vector3; ctx: Ctx; apiRef?: MutableRefObject<ControlsApi | null>; reduced: boolean }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const goal = useRef<{ target: THREE.Vector3; pos: THREE.Vector3; t: number } | null>(null);
  const lastPhase = useRef(-1);
  const home = useMemo(() => ({ target: vec(tpl.target), pos: vec(tpl.camera) }), [tpl]);
  const setGoal = (phase: number) => {
    const dir = home.pos.clone().sub(home.target);
    if (phase === 4) {
      goal.current = { target: focus.clone(), pos: focus.clone().add(dir.multiplyScalar(0.5)), t: 0 };
    } else goal.current = { target: home.target.clone(), pos: home.pos.clone(), t: 0 };
  };
  useEffect(() => {
    if (!apiRef) return;
    apiRef.current = {
      zoom: (f) => {
        const c = controls.current;
        if (!c) return;
        const d = camera.position.clone().sub(c.target).multiplyScalar(f);
        camera.position.copy(c.target).add(d);
        c.update();
      },
      reset: () => setGoal(0),
      setAutoRotate: (b) => { if (controls.current) controls.current.autoRotate = b; },
    };
  });
  useFrame((_, dt) => {
    const e = ctx.eff();
    if (e.phase !== lastPhase.current) {
      const enteredFocus = e.phase === 4 || lastPhase.current === 4;
      if (lastPhase.current === -1 || enteredFocus) setGoal(e.phase);
      lastPhase.current = e.phase;
    }
    const c = controls.current;
    if (goal.current && c) {
      const k = reduced ? 1 : 1 - Math.exp(-dt * 3);
      camera.position.lerp(goal.current.pos, k);
      c.target.lerp(goal.current.target, k);
      goal.current.t += dt;
      if (goal.current.t > 1.8) goal.current = null;
      c.update();
    }
  });
  return <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.08} minDistance={1.2} maxDistance={22} autoRotateSpeed={0.7}
    onStart={() => { goal.current = null; }} />;
}

/* ───────────────────────── procedure scene ───────────────────────── */

function Ticker({ playing, duration, progressRef, onDone }: { playing: boolean; duration: number; progressRef: MutableRefObject<number>; onDone: () => void }) {
  const fired = useRef(false);
  useFrame((_, dt) => {
    if (!playing) return;
    if (progressRef.current < 1) {
      progressRef.current = Math.min(1, progressRef.current + Math.min(dt, 0.05) / duration);
      fired.current = false;
    } else if (!fired.current) {
      fired.current = true;
      onDone();
    }
  });
  return null;
}

export interface ProcedureCanvasProps {
  cfg: SceneConfig;
  phase: number;
  progressRef: MutableRefObject<number>;
  compare: Compare;
  labels: boolean;
  selected: string | null;
  onSelect: (id: string | null) => void;
  playing: boolean;
  onStepDone: () => void;
  apiRef?: MutableRefObject<ControlsApi | null>;
  reduced: boolean;
  active: boolean;
}

function SceneContent(props: ProcedureCanvasProps) {
  const { cfg, phase, compare, labels, selected, onSelect, progressRef } = props;
  const stRef = useRef({ phase, compare });
  stRef.current = { phase, compare };
  const tpl = TEMPLATES[cfg.template];

  const ctx = useMemo<Ctx>(() => {
    const vmap = new Map<string, VesselDef>();
    const curves: CurveMap = new Map();
    tpl.vessels.forEach((v) => {
      const nv = cfg.names?.[v.id] ? { ...v, name: cfg.names[v.id], label: true } : v;
      vmap.set(v.id, nv);
      curves.set(v.id, curveOf(v.pts));
    });
    const routes = cfg.routes.map((r) => buildRoute(r, curves));
    const lpts = cfg.lesions.map((l) => lesionPoint(l, curves));
    const lr = cfg.lesions.map((l) => {
      const v = l.vessel ? vmap.get(l.vessel) : undefined;
      return v ? vesselRadiusAt(v, l.t ?? 0.5) : (l.size ?? 0.15);
    });
    const eff = (): Eff => {
      const s = stRef.current;
      if (s.compare === "normal") return { phase: 0, p: 1 };
      if (s.compare === "disease") return { phase: 1, p: 1 };
      return { phase: s.phase, p: progressRef.current };
    };
    return { cfg, tpl, vmap, curves, routes, lpts, lr, eff };
  }, [cfg, tpl, progressRef]);

  const focusKinds = cfg.focus;
  const vessels = [...ctx.vmap.values()];
  const flowItems = useMemo(() => vessels.filter((v) => !v.noFlow && v.kind !== "airway").map((def) => ({ def, curve: ctx.curves.get(def.id)! })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ctx]);
  const sev = useMemo(() => {
    const m = new Map<string, number>();
    let max = 0;
    cfg.lesions.forEach((l) => {
      const s = SEVERITY[l.type] ?? 0;
      max = Math.max(max, s);
      if (l.vessel) m.set(l.vessel, Math.max(m.get(l.vessel) ?? 0, s));
    });
    (cfg.distal ?? []).forEach((id) => m.set(id, Math.max(m.get(id) ?? 0, max || 0.6)));
    return m;
  }, [cfg]);
  const refluxV = useMemo(() => new Set(cfg.lesions.filter((l) => l.type === "reflux").map((l) => l.vessel)), [cfg]);
  const factor = (id: string) => {
    const e = ctx.eff();
    const def = ctx.vmap.get(id)!;
    if (def.only) return e.phase >= 1 && e.phase <= 4 ? growth(e) : e.phase === 5 ? 0.12 * (1 - 0) : 0;
    let f = 1;
    const s = sev.get(id) ?? 0;
    if (s > 0) {
      f = 1 - s * growth(e);
      if (e.phase === 4) f += (1 - f) * clamp01((e.p - 0.6) / 0.4);
      if (e.phase === 5) f = 1;
    }
    if (cfg.stopFlow?.includes(id)) {
      if (e.phase === 4) f *= 1 - e.p * 0.95;
      if (e.phase === 5) f = 0.04;
    }
    if (refluxV.has(id) && e.phase === 5) f = 0;
    return f;
  };
  const onlyVis = (def: VesselDef) => () => {
    const e = ctx.eff();
    if (e.phase >= 1 && e.phase <= 4) return growth(e);
    return e.phase === 5 ? 0.35 : 0;
  };
  const organs = [...tpl.organs.filter((o) => !cfg.hideOrgans?.includes(o.id)), ...(cfg.extraOrgans ?? [])];
  const [lbl, setLbl] = useState(0);
  useFrame(() => {
    const e = ctx.eff();
    const v = e.phase >= 1 && !(e.phase === 5 && e.p > 0.5) ? 1 : 0;
    if (v !== lbl) setLbl(v);
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#e6ecf2", "#132a40", 0.6]} />
      <directionalLight position={[5, 8, 6]} intensity={1.5} />
      <pointLight position={[-4, 2, 4]} intensity={18} color="#C9D4DF" />
      <pointLight position={[4, -3, 2]} intensity={10} color="#B3121B" />

      {vessels.map((v) => (
        <VesselMesh key={v.id} def={v} curve={ctx.curves.get(v.id)!}
          opacity={focusKinds && !focusKinds.includes(v.kind) ? 0.16 : v.kind === "cord" ? 0.35 : 0.5}
          selected={selected === v.id} onSelect={onSelect} visibleFn={v.only ? onlyVis(v) : undefined} />
      ))}
      {organs.map((o) => <OrganMesh key={o.id} o={o} selected={selected === o.id} onSelect={onSelect} />)}

      {cfg.lesions.map((l, i) =>
        ["stenosis", "occlusion", "thrombus", "compression", "stricture", "reflux"].includes(l.type)
          ? <TubeLesion key={i} l={l} i={i} ctx={ctx} />
          : <BlobLesion key={i} l={l} i={i} ctx={ctx} devices={cfg.devices} />,
      )}
      {ctx.routes.map((r, i) => <RouteWire key={i} curve={r} needle={cfg.routes[i].needle} ctx={ctx}
        hideCatheter={cfg.devices.some((d) => d.type === "drain" && (d.route ?? 0) === i)} />)}
      <TargetMarkers ctx={ctx} />
      {cfg.devices.map((d, i) => <Device key={i} d={d} ctx={ctx} />)}
      <FlowParticles items={flowItems} factor={factor} speed={props.reduced ? 0.4 : 1} />

      {labels && vessels.filter((v) => v.label !== false && !v.only).map((v) => (
        <Tag key={v.id} position={ctx.curves.get(v.id)!.getPointAt(0.5).add(new THREE.Vector3(0, 0, v.r + 0.05))} text={v.name} />
      ))}
      {labels && organs.filter((o) => o.label !== false).map((o) => (
        <Tag key={o.id} position={[o.pos[0], o.pos[1] + o.scale[1] * 0.7, o.pos[2]]} text={o.name} />
      ))}
      {selected && !labels && (() => {
        const v = ctx.vmap.get(selected);
        const o = organs.find((x) => x.id === selected);
        if (v) return <Tag position={ctx.curves.get(v.id)!.getPointAt(0.5)} text={v.name} />;
        if (o) return <Tag position={o.pos} text={o.name} />;
        return null;
      })()}
      {lbl === 1 && cfg.lesions.map((l, i) => l.label ? <Tag key={`l${i}`} tone="alert" position={ctx.lpts[i].clone().add(new THREE.Vector3(0.25, 0.22, 0.1))} text={l.label} /> : null)}

      <Rig tpl={tpl} focus={ctx.lpts[0] ?? vec(tpl.target)} ctx={ctx} apiRef={props.apiRef} reduced={props.reduced} />
      <Ticker playing={props.playing} duration={props.reduced ? 3.5 : 5.5} progressRef={progressRef} onDone={props.onStepDone} />
    </>
  );
}

export default function ProcedureCanvas(props: ProcedureCanvasProps) {
  const tpl = TEMPLATES[props.cfg.template];
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: tpl.camera, fov: 40, near: 0.05, far: 100 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={props.active ? "always" : "never"}
      onPointerMissed={() => props.onSelect(null)}
      data-testid="procedure-3d-canvas"
    >
      <SceneContent key={props.cfg.template + JSON.stringify(props.cfg.lesions)} {...props} />
    </Canvas>
  );
}
