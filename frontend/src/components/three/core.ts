import * as THREE from "three";

export type V3 = [number, number, number];
export type VesselKind = "artery" | "vein" | "portal" | "duct" | "airway" | "nerve" | "cord";

export interface VesselDef {
  id: string;
  name: string;
  kind: VesselKind;
  pts: V3[];
  r: number;
  r2?: number;
  dir?: 1 | -1; // flow direction along pts
  only?: "disease"; // collaterals / varices that exist only with disease
  label?: boolean;
  noFlow?: boolean;
}

export interface OrganDef {
  id: string;
  name: string;
  pos: V3;
  scale: V3;
  color: string;
  opacity?: number;
  rot?: V3;
  shape?: "sphere" | "box" | "capsule";
  label?: boolean;
}

export interface AnatomyTemplate {
  id: string;
  target: V3;
  camera: V3;
  vessels: VesselDef[];
  organs: OrganDef[];
}

export type LesionType =
  | "stenosis" | "occlusion" | "aneurysm" | "thrombus" | "tumour" | "compression" | "bleed"
  | "nidus" | "collection" | "fracture" | "stricture" | "reflux" | "inflammation";

export interface LesionDef {
  type: LesionType;
  vessel?: string;
  t?: number;
  len?: number;
  size?: number;
  pos?: V3;
  offset?: V3; // e.g. saccular aneurysm dome offset from the parent vessel
  label?: string;
}

export interface RouteSeg { v: string; t0?: number; t1?: number }
export interface RouteDef { entry?: V3; segs?: RouteSeg[]; pts?: V3[]; tail?: V3[]; needle?: boolean }

export type DeviceType =
  | "balloon" | "dcb" | "stent" | "graft" | "coil" | "flow-diverter" | "stent-retriever" | "aspiration"
  | "thrombectomy" | "filter" | "epd" | "embolic" | "liquid-embolic" | "ablation-rfa" | "ablation-mwa"
  | "ablation-cryo" | "biopsy" | "drain" | "cement" | "kypho-balloon" | "inject" | "endovenous";

export interface DeviceDef {
  type: DeviceType;
  lesion?: number;
  route?: number;
  stage?: number;
  seg?: [string, number, number];
  segs?: [string, number, number][];
  pts?: V3[];
  color?: string;
  scale?: number;
}

export interface SceneConfig {
  template: string;
  lesions: LesionDef[];
  routes: RouteDef[];
  devices: DeviceDef[];
  distal?: string[]; // vessels with reduced flow from the disease
  stopFlow?: string[]; // vessels intentionally embolised (flow stops after treatment)
  focus?: VesselKind[];
  names?: Record<string, string>;
  extraOrgans?: OrganDef[];
  hideOrgans?: string[];
}

export const PHASES = [
  "Normal anatomy",
  "Disease",
  "Treatment strategy",
  "Catheter & device navigation",
  "Intervention",
  "Intended result",
] as const;

export const KIND_COLOR: Record<VesselKind, string> = {
  artery: "#e0475a",
  vein: "#3f7fe0",
  portal: "#9a6ae0",
  duct: "#34b87a",
  airway: "#a9c1d3",
  nerve: "#e8c547",
  cord: "#e6d7a3",
};

export const KIND_LABEL: Record<VesselKind, string> = {
  artery: "Artery",
  vein: "Vein",
  portal: "Portal venous system",
  duct: "Duct",
  airway: "Airway",
  nerve: "Nerve",
  cord: "Spinal cord",
};

export const vec = (p: V3) => new THREE.Vector3(p[0], p[1], p[2]);
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export function curveOf(pts: V3[]) {
  return new THREE.CatmullRomCurve3(pts.map(vec), false, "centripetal");
}

/** Tube with a per-u radius; index order is per tubular segment so setDrawRange reveals it progressively. */
export function tubeGeometry(
  curve: THREE.Curve<THREE.Vector3>,
  radius: (u: number) => number,
  tubular = 64,
  radial = 12,
) {
  const frames = curve.computeFrenetFrames(tubular, false);
  const pos: number[] = [];
  const nor: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const P = new THREE.Vector3();
  const N = new THREE.Vector3();
  for (let i = 0; i <= tubular; i++) {
    const u = i / tubular;
    curve.getPointAt(u, P);
    const r = radius(u);
    const n = frames.normals[i];
    const b = frames.binormals[i];
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const s = Math.sin(a);
      const c = -Math.cos(a);
      N.set(c * n.x + s * b.x, c * n.y + s * b.y, c * n.z + s * b.z).normalize();
      pos.push(P.x + r * N.x, P.y + r * N.y, P.z + r * N.z);
      nor.push(N.x, N.y, N.z);
      uv.push(u, j / radial);
    }
  }
  for (let i = 0; i < tubular; i++) {
    for (let j = 0; j < radial; j++) {
      const a = (radial + 1) * i + j;
      const b = (radial + 1) * (i + 1) + j;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setIndex(idx);
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  return g;
}

export function revealTube(g: THREE.BufferGeometry, tubular: number, radial: number, f: number) {
  g.setDrawRange(0, Math.floor(clamp01(f) * tubular) * radial * 6);
}

export function subCurve(c: THREE.Curve<THREE.Vector3>, t0: number, t1: number, n = 24) {
  const a = clamp01(t0);
  const b = clamp01(t1);
  const pts: THREE.Vector3[] = [];
  for (let k = 0; k <= n; k++) pts.push(c.getPointAt(a + ((b - a) * k) / n));
  return new THREE.CatmullRomCurve3(pts, false, "centripetal");
}

export function nearestT(c: THREE.Curve<THREE.Vector3>, p: THREE.Vector3, samples = 160) {
  let best = 0;
  let bd = Infinity;
  const tmp = new THREE.Vector3();
  for (let i = 0; i <= samples; i++) {
    const d = c.getPointAt(i / samples, tmp).distanceToSquared(p);
    if (d < bd) {
      bd = d;
      best = i / samples;
    }
  }
  return best;
}

export type CurveMap = Map<string, THREE.CatmullRomCurve3>;

export function buildRoute(r: RouteDef, curves: CurveMap) {
  const pts: THREE.Vector3[] = [];
  if (r.entry) pts.push(vec(r.entry));
  if (r.pts) pts.push(...r.pts.map(vec));
  const segs = r.segs ?? [];
  segs.forEach((s, i) => {
    const c = curves.get(s.v);
    if (!c) return;
    const prev = pts.length ? pts[pts.length - 1] : null;
    const t0 = s.t0 ?? (prev ? nearestT(c, prev) : 0);
    let t1 = 1;
    if (s.t1 !== undefined) t1 = s.t1;
    else {
      const nc = segs[i + 1] && curves.get(segs[i + 1].v);
      if (nc) {
        const a = nc.getPointAt(0);
        const b = nc.getPointAt(1);
        const ta = nearestT(c, a);
        const tb = nearestT(c, b);
        t1 = c.getPointAt(ta).distanceTo(a) <= c.getPointAt(tb).distanceTo(b) ? ta : tb;
      }
    }
    const n = Math.max(3, Math.ceil((Math.abs(t1 - t0) * c.getLength()) / 0.12));
    for (let k = 0; k <= n; k++) pts.push(c.getPointAt(t0 + ((t1 - t0) * k) / n));
  });
  if (r.tail) pts.push(...r.tail.map(vec));
  const clean: THREE.Vector3[] = [];
  for (const p of pts) if (!clean.length || clean[clean.length - 1].distanceTo(p) > 0.03) clean.push(p);
  if (clean.length < 2) clean.push(clean[0].clone().add(new THREE.Vector3(0, 0.01, 0)));
  return new THREE.CatmullRomCurve3(clean, false, "centripetal");
}

export function vesselRadiusAt(v: VesselDef, t: number) {
  return v.r + ((v.r2 ?? v.r) - v.r) * t;
}

/** Deterministic PRNG so coils / nidus tangles look identical on every render. */
export function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
