import type { AnatomyTemplate, OrganDef, V3, VesselDef } from "./core";

// Schematic, anatomically plausible templates. Viewer faces the patient: patient-right = -x, anterior = +z.
const A = (id: string, name: string, pts: V3[], r: number, r2?: number, extra: Partial<VesselDef> = {}): VesselDef => ({ id, name, kind: "artery", pts, r, r2, ...extra });
const Vn = (id: string, name: string, pts: V3[], r: number, r2?: number, extra: Partial<VesselDef> = {}): VesselDef => ({ id, name, kind: "vein", pts, r, r2, ...extra });
const O = (id: string, name: string, pos: V3, scale: V3, color: string, opacity = 0.16, extra: Partial<OrganDef> = {}): OrganDef => ({ id, name, pos, scale, color, opacity, ...extra });
const BONE = "#dfe6ee";

const leg: AnatomyTemplate = {
  id: "leg",
  target: [-0.4, -0.6, 0],
  camera: [-4.5, 0.2, 9.5],
  vessels: [
    A("aorta", "Distal abdominal aorta", [[0, 3.2, 0], [0, 2.4, 0]], 0.16, 0.15),
    A("cia_r", "Right common iliac artery", [[0, 2.4, 0], [-0.25, 2.0, 0.05], [-0.45, 1.6, 0.05]], 0.1, 0.09),
    A("cia_l", "Left common iliac artery", [[0, 2.4, 0], [0.25, 2.0, 0.05], [0.45, 1.6, 0.05]], 0.1, 0.09, { label: false }),
    A("eia_r", "Right external iliac artery", [[-0.45, 1.6, 0.05], [-0.6, 1.2, 0.12], [-0.65, 0.9, 0.15]], 0.085, 0.08),
    A("eia_l", "Left external iliac artery", [[0.45, 1.6, 0.05], [0.6, 1.2, 0.12], [0.65, 0.9, 0.15]], 0.085, 0.08, { label: false }),
    A("iia_r", "Right internal iliac artery", [[-0.45, 1.6, 0.05], [-0.3, 1.3, -0.15], [-0.2, 1.1, -0.2]], 0.06, 0.04, { label: false }),
    A("cfa_r", "Common femoral artery", [[-0.65, 0.9, 0.15], [-0.66, 0.6, 0.15]], 0.08, 0.075),
    A("pfa_r", "Profunda femoris artery", [[-0.66, 0.6, 0.15], [-0.85, 0.2, 0.0], [-0.9, -0.4, -0.05]], 0.05, 0.035),
    A("sfa_r", "Superficial femoral artery", [[-0.66, 0.6, 0.15], [-0.6, 0, 0.1], [-0.5, -0.8, 0], [-0.42, -1.5, -0.1]], 0.065, 0.06),
    A("pop_r", "Popliteal artery", [[-0.42, -1.5, -0.1], [-0.4, -1.9, -0.15], [-0.42, -2.2, -0.1]], 0.06, 0.055),
    A("ata_r", "Anterior tibial artery", [[-0.42, -2.2, -0.1], [-0.52, -2.4, 0.05], [-0.55, -3.2, 0.08], [-0.55, -3.9, 0.15]], 0.038, 0.032),
    A("tpt_r", "Tibioperoneal trunk", [[-0.42, -2.2, -0.1], [-0.38, -2.5, -0.12]], 0.045, 0.043, { label: false }),
    A("pta_r", "Posterior tibial artery", [[-0.38, -2.5, -0.12], [-0.3, -3.2, -0.15], [-0.28, -3.9, -0.12], [-0.3, -4.15, 0.2], [-0.38, -4.2, 0.6]], 0.034, 0.026),
    A("per_r", "Peroneal artery", [[-0.38, -2.5, -0.12], [-0.45, -3.3, -0.1], [-0.48, -3.85, -0.05]], 0.03, 0.024),
    A("dpa_r", "Dorsalis pedis artery", [[-0.55, -3.9, 0.15], [-0.5, -4.08, 0.45], [-0.42, -4.12, 0.78]], 0.026, 0.02),
    A("arch_r", "Pedal arch", [[-0.5, -4.08, 0.45], [-0.42, -4.2, 0.52], [-0.36, -4.21, 0.6]], 0.018, 0.016, { label: false }),
    Vn("fv_r", "Femoral vein", [[-0.55, 0.9, 0.1], [-0.56, 0.6, 0.08], [-0.5, 0, 0.02], [-0.38, -0.8, -0.08], [-0.3, -1.5, -0.2]], 0.07, 0.06, { dir: -1, label: false }),
    Vn("gsv_r", "Great saphenous vein", [[-0.58, 0.62, 0.22], [-0.42, -0.8, 0.32], [-0.2, -2.2, 0.22], [-0.18, -3.9, 0.25]], 0.042, 0.035, { dir: -1 }),
  ],
  organs: [
    O("femur", "Femur", [-0.55, -0.45, -0.25], [0.11, 1.15, 0.11], BONE, 0.12, { shape: "capsule", rot: [0, 0, -0.08] }),
    O("tibia", "Tibia", [-0.45, -3.05, -0.05], [0.09, 0.9, 0.09], BONE, 0.12, { shape: "capsule" }),
    O("foot", "Foot", [-0.42, -4.25, 0.45], [0.22, 0.08, 0.5], BONE, 0.1, { shape: "box" }),
  ],
};

const aorta: AnatomyTemplate = {
  id: "aorta",
  target: [0, 0.2, 0],
  camera: [2.5, 0.8, 8.5],
  vessels: [
    A("aorta", "Abdominal aorta", [[0.05, 3, 0], [0.05, 1.8, 0.05], [0.05, 0.6, 0.1], [0.05, -0.6, 0.1]], 0.3, 0.26),
    A("celiac", "Coeliac trunk", [[0.05, 2.2, 0.05], [0.05, 2.25, 0.5], [0.25, 2.35, 0.7]], 0.08, 0.07),
    A("sma", "Superior mesenteric artery", [[0.05, 1.9, 0.08], [0.05, 1.6, 0.6], [0.1, 0.8, 0.85]], 0.08, 0.06),
    A("renal_r", "Right renal artery", [[0.05, 1.4, 0.05], [-0.6, 1.35, 0], [-1.1, 1.3, -0.1]], 0.09, 0.07),
    A("renal_l", "Left renal artery", [[0.05, 1.45, 0.05], [0.65, 1.4, 0], [1.15, 1.35, -0.1]], 0.09, 0.07),
    A("cia_r", "Right common iliac artery", [[0.05, -0.6, 0.1], [-0.35, -1.4, 0.1], [-0.55, -2.0, 0.1]], 0.16, 0.14),
    A("cia_l", "Left common iliac artery", [[0.05, -0.6, 0.1], [0.45, -1.4, 0.1], [0.65, -2.0, 0.1]], 0.16, 0.14),
    A("eia_r", "Right external iliac artery", [[-0.55, -2.0, 0.1], [-0.75, -2.8, 0.25], [-0.85, -3.6, 0.35]], 0.12, 0.11),
    A("eia_l", "Left external iliac artery", [[0.65, -2.0, 0.1], [0.85, -2.8, 0.25], [0.95, -3.6, 0.35]], 0.12, 0.11),
    A("iia_r", "Right internal iliac artery", [[-0.55, -2.0, 0.1], [-0.45, -2.5, -0.3]], 0.09, 0.07, { label: false }),
    A("iia_l", "Left internal iliac artery", [[0.65, -2.0, 0.1], [0.55, -2.5, -0.3]], 0.09, 0.07, { label: false }),
    Vn("ivc", "Inferior vena cava", [[-0.55, 3, -0.1], [-0.55, 1.5, -0.1], [-0.5, -0.4, -0.05]], 0.26, 0.24, { dir: -1, label: false }),
    { id: "ureter_r", name: "Right ureter", kind: "duct", pts: [[-1.25, 1.05, -0.05], [-0.95, 0.0, 0.0], [-0.8, -1.5, 0.1]], r: 0.04, label: false },
  ],
  organs: [
    O("kidney_r", "Right kidney", [-1.4, 1.3, -0.15], [0.3, 0.55, 0.25], "#b5525e", 0.22),
    O("kidney_l", "Left kidney", [1.45, 1.35, -0.15], [0.3, 0.55, 0.25], "#b5525e", 0.22),
    O("spine", "Lumbar spine", [0.05, 0.5, -0.75], [0.32, 2.8, 0.3], BONE, 0.08, { shape: "box" }),
  ],
};

const venous: AnatomyTemplate = {
  id: "venous",
  target: [0, -0.6, 0],
  camera: [1.5, 0.2, 9],
  vessels: [
    Vn("ivc", "Inferior vena cava", [[-0.3, 3, 0], [-0.3, 1.5, 0], [-0.25, 0, 0]], 0.22, 0.2, { dir: -1 }),
    Vn("rv_r", "Right renal vein", [[-0.3, 1.6, 0], [-1.1, 1.55, 0]], 0.08, 0.07, { dir: -1, label: false }),
    Vn("rv_l", "Left renal vein", [[-0.3, 1.55, 0], [0.4, 1.6, 0.25], [1.1, 1.6, 0]], 0.09, 0.08, { dir: -1, label: false }),
    Vn("cciv_r", "Right common iliac vein", [[-0.25, 0, 0], [-0.55, -0.9, 0], [-0.75, -1.7, 0]], 0.14, 0.13, { dir: -1 }),
    Vn("cciv_l", "Left common iliac vein", [[-0.25, 0, 0], [0.2, -0.6, -0.1], [0.6, -1.1, -0.05], [0.8, -1.7, 0]], 0.14, 0.13, { dir: -1 }),
    Vn("eiv_r", "Right external iliac vein", [[-0.75, -1.7, 0], [-0.95, -2.6, 0.15], [-1.0, -3.4, 0.25]], 0.12, 0.11, { dir: -1, label: false }),
    Vn("eiv_l", "Left external iliac vein", [[0.8, -1.7, 0], [1.0, -2.6, 0.15], [1.05, -3.4, 0.25]], 0.12, 0.11, { dir: -1 }),
    Vn("fv_r", "Right common femoral vein", [[-1.0, -3.4, 0.25], [-0.95, -4.6, 0.25]], 0.1, 0.09, { dir: -1, label: false }),
    Vn("fv_l", "Left common femoral vein", [[1.05, -3.4, 0.25], [1.0, -4.6, 0.25]], 0.1, 0.09, { dir: -1 }),
    Vn("col_r", "Right ascending lumbar collateral", [[-0.8, -1.6, -0.1], [-1.25, -0.5, -0.3], [-1.05, 1.0, -0.35], [-0.5, 2.3, -0.2]], 0.04, 0.035, { only: "disease" }),
    Vn("col_l", "Left ascending lumbar collateral", [[0.85, -1.6, -0.1], [1.3, -0.5, -0.3], [1.1, 1.0, -0.35], [0.4, 1.6, 0.1]], 0.04, 0.035, { only: "disease", label: false }),
    Vn("col_p", "Pelvic cross-over collateral", [[1.0, -2.6, 0.1], [0, -3.0, 0.35], [-0.95, -2.6, 0.1]], 0.035, 0.035, { only: "disease" }),
    A("aorta", "Aorta", [[0.15, 3, 0.25], [0.15, 0.2, 0.2]], 0.18, 0.17, { label: false }),
    A("cia_r", "Right common iliac artery", [[0.15, 0.2, 0.2], [-0.3, -0.6, 0.2], [-0.6, -1.5, 0.12]], 0.11, 0.1),
    A("cia_l", "Left common iliac artery", [[0.15, 0.2, 0.2], [0.6, -0.8, 0.15], [0.85, -1.5, 0.15]], 0.11, 0.1, { label: false }),
  ],
  organs: [O("spine", "Lumbar spine", [0, 0, -0.55], [0.3, 2.8, 0.25], BONE, 0.08, { shape: "box" })],
};

const arm: AnatomyTemplate = {
  id: "arm",
  target: [-1.2, 0.2, 0],
  camera: [-1, 1.4, 8.5],
  vessels: [
    A("brachial", "Brachial artery", [[-2.2, 0, 0], [0, -0.05, 0.05], [0.8, -0.1, 0.05]], 0.07, 0.065),
    A("radial", "Radial artery", [[0.8, -0.1, 0.05], [2, -0.05, 0.15], [2.8, 0, 0.2]], 0.05, 0.045),
    A("ulnar", "Ulnar artery", [[0.8, -0.1, 0.05], [2, -0.3, -0.1], [2.8, -0.3, -0.1]], 0.045, 0.04, { label: false }),
    A("anast", "AV anastomosis", [[2.42, -0.02, 0.19], [2.5, -0.01, 0.21], [2.58, 0.01, 0.23]], 0.05, 0.06),
    Vn("cephalic", "Cephalic vein (fistula outflow)", [[2.58, 0.01, 0.23], [1.5, 0.3, 0.35], [0, 0.45, 0.35], [-1.5, 0.5, 0.3], [-2.3, 0.6, 0.1]], 0.1, 0.09),
    Vn("subclavian", "Axillary-subclavian vein", [[-2.3, 0.6, 0.1], [-3.2, 0.9, 0], [-3.9, 1.1, -0.1]], 0.12, 0.13),
    Vn("brachioceph", "Brachiocephalic vein", [[-3.9, 1.1, -0.1], [-4.6, 0.9, -0.1], [-5.0, 0.4, -0.1]], 0.14, 0.15),
    Vn("svc", "Superior vena cava", [[-5.0, 0.4, -0.1], [-5.1, -0.7, -0.1]], 0.18, 0.18),
  ],
  organs: [
    O("humerus", "Humerus", [-0.75, -0.25, -0.3], [1.45, 0.1, 0.1], BONE, 0.1, { shape: "capsule", rot: [0, 0, Math.PI / 2] }),
    O("radius", "Forearm bones", [1.85, -0.2, -0.25], [1.0, 0.08, 0.08], BONE, 0.1, { shape: "capsule", rot: [0, 0, Math.PI / 2] }),
    O("heart", "Heart (right atrium)", [-5.15, -1.25, 0], [0.55, 0.5, 0.45], "#c0394b", 0.18),
  ],
};

const brain: AnatomyTemplate = {
  id: "brain",
  target: [-0.2, 0.2, 0],
  camera: [-3.2, 1.4, 5.6],
  vessels: [
    A("cca_r", "Right common carotid artery", [[-0.5, -3, 0.2], [-0.55, -1.6, 0.25]], 0.1, 0.095),
    A("ica_r", "Right internal carotid artery", [[-0.55, -1.6, 0.25], [-0.6, -0.8, 0.1], [-0.55, -0.2, 0.15], [-0.45, 0.1, 0.35], [-0.3, 0.25, 0.25]], 0.075, 0.06),
    A("eca_r", "Right external carotid artery", [[-0.55, -1.6, 0.25], [-0.75, -1.0, 0.5], [-0.9, -0.4, 0.6]], 0.05, 0.04),
    A("occ_r", "Occipital artery", [[-0.72, -1.15, 0.45], [-1.0, -0.8, -0.6], [-0.9, 0.3, -1.3]], 0.025, 0.022, { label: false }),
    A("cca_l", "Left common carotid artery", [[0.5, -3, 0.2], [0.55, -1.6, 0.25]], 0.1, 0.095, { label: false }),
    A("ica_l", "Left internal carotid artery", [[0.55, -1.6, 0.25], [0.6, -0.8, 0.1], [0.55, -0.2, 0.15], [0.45, 0.1, 0.35], [0.3, 0.25, 0.25]], 0.075, 0.06, { label: false }),
    A("mca_r", "Right middle cerebral artery (M1)", [[-0.3, 0.25, 0.25], [-0.8, 0.35, 0.2], [-1.2, 0.5, 0.0]], 0.048, 0.042),
    A("mca_r_sup", "MCA superior division", [[-1.2, 0.5, 0], [-1.3, 1.1, -0.2], [-1.1, 1.6, -0.5]], 0.028, 0.02, { label: false }),
    A("mca_r_inf", "MCA inferior division", [[-1.2, 0.5, 0], [-1.35, 0.6, -0.6], [-1.2, 0.6, -1.1]], 0.028, 0.02, { label: false }),
    A("mca_l", "Left middle cerebral artery", [[0.3, 0.25, 0.25], [0.8, 0.35, 0.2], [1.2, 0.5, 0], [1.3, 1.1, -0.3]], 0.046, 0.025, { label: false }),
    A("aca_r", "Anterior cerebral artery", [[-0.3, 0.25, 0.25], [-0.1, 0.35, 0.55], [-0.06, 0.9, 0.9], [-0.05, 1.7, 0.3], [-0.05, 1.9, -0.6]], 0.036, 0.025),
    A("aca_l", "Left anterior cerebral artery", [[0.3, 0.25, 0.25], [0.1, 0.35, 0.55], [0.06, 0.9, 0.9], [0.05, 1.7, 0.3], [0.05, 1.9, -0.6]], 0.036, 0.025, { label: false }),
    A("acom", "Anterior communicating artery", [[-0.1, 0.35, 0.55], [0.1, 0.35, 0.55]], 0.02, 0.02, { label: false }),
    A("vert_r", "Right vertebral artery", [[-0.35, -3, -0.3], [-0.3, -1.2, -0.45], [0, -0.45, -0.35]], 0.05, 0.045, { label: false }),
    A("vert_l", "Left vertebral artery", [[0.35, -3, -0.3], [0.3, -1.2, -0.45], [0, -0.45, -0.35]], 0.05, 0.045, { label: false }),
    A("basilar", "Basilar artery", [[0, -0.45, -0.35], [0, 0.1, -0.15]], 0.055, 0.05),
    A("pca_r", "Posterior cerebral artery", [[0, 0.1, -0.15], [-0.4, 0.15, -0.3], [-0.8, 0.3, -0.9]], 0.036, 0.028, { label: false }),
    A("pca_l", "Left posterior cerebral artery", [[0, 0.1, -0.15], [0.4, 0.15, -0.3], [0.8, 0.3, -0.9]], 0.036, 0.028, { label: false }),
    Vn("sss", "Superior sagittal sinus", [[0, 1.9, 1.3], [0, 2.4, 0], [0, 1.95, -1.4], [0, 1.0, -1.85]], 0.07, 0.09),
    Vn("ts_r", "Right transverse sinus", [[0, 1.0, -1.85], [-0.8, 0.6, -1.6], [-1.1, 0.0, -1.0]], 0.08, 0.08, { label: false }),
    Vn("dv", "Draining vein", [[-1.0, 1.45, -0.6], [-0.6, 2.05, -0.6], [0, 2.3, -0.5]], 0.045, 0.05, { only: "disease" }),
  ],
  organs: [O("brain", "Brain (cerebral hemispheres)", [0, 1.0, -0.2], [1.6, 1.3, 1.9], "#d9a7b0", 0.08)],
};

const liver: AnatomyTemplate = {
  id: "liver",
  target: [-0.3, 0.3, 0],
  camera: [-2.5, 1.5, 7],
  vessels: [
    A("aorta", "Abdominal aorta", [[0.4, 2.5, -1.3], [0.4, -2, -1.3]], 0.18, 0.17, { label: false }),
    A("celiac", "Coeliac trunk", [[0.4, -0.4, -1.3], [0.4, -0.45, -0.8]], 0.08, 0.075),
    A("cha", "Common hepatic artery", [[0.4, -0.45, -0.8], [0, -0.5, -0.6], [-0.4, -0.35, -0.4]], 0.06, 0.055),
    A("pha", "Proper hepatic artery", [[-0.4, -0.35, -0.4], [-0.5, 0, -0.2], [-0.4, 0.3, 0]], 0.05, 0.045),
    A("rha", "Right hepatic artery", [[-0.4, 0.3, 0], [-0.9, 0.5, 0.1], [-1.4, 0.7, 0.2]], 0.038, 0.03),
    A("rha_seg", "Segmental tumour-feeding artery", [[-0.9, 0.5, 0.1], [-1.0, 0.85, 0.42], [-0.98, 1.0, 0.58]], 0.022, 0.018),
    A("lha", "Left hepatic artery", [[-0.4, 0.3, 0], [0.3, 0.55, 0.2], [0.9, 0.6, 0.3]], 0.032, 0.026, { label: false }),
    A("gda", "Gastroduodenal artery", [[-0.4, -0.35, -0.4], [-0.45, -0.9, -0.2]], 0.03, 0.028, { label: false }),
    A("splenic", "Splenic artery", [[0.4, -0.45, -0.8], [1.2, -0.3, -1.0], [1.9, -0.2, -1.2]], 0.05, 0.045, { label: false }),
    { id: "pv", name: "Main portal vein", kind: "portal", pts: [[-0.2, -1.6, -0.3], [-0.4, -0.6, -0.2], [-0.5, 0.1, -0.1]], r: 0.12, r2: 0.11 },
    { id: "rpv", name: "Right portal vein", kind: "portal", pts: [[-0.5, 0.1, -0.1], [-1.0, 0.3, -0.1], [-1.5, 0.45, -0.05]], r: 0.075, r2: 0.06 },
    { id: "lpv", name: "Left portal vein", kind: "portal", pts: [[-0.5, 0.1, -0.1], [0.3, 0.35, 0], [0.9, 0.4, 0.05]], r: 0.065, r2: 0.05, label: false },
    Vn("ivc", "Inferior vena cava", [[-0.3, 2.5, -0.9], [-0.3, -2, -0.9]], 0.16, 0.16, { dir: -1 }),
    Vn("rhv", "Right hepatic vein", [[-0.3, 1.2, -0.85], [-0.9, 1.0, -0.5], [-1.5, 0.9, -0.2]], 0.07, 0.05, { dir: -1 }),
    Vn("mhv", "Middle hepatic vein", [[-0.3, 1.2, -0.85], [-0.3, 1.0, -0.2], [-0.2, 0.8, 0.4]], 0.05, 0.04, { dir: -1, label: false }),
    { id: "varix", name: "Gastro-oesophageal varices", kind: "portal", pts: [[-0.3, -0.9, -0.25], [0.2, -0.75, 0.05], [0.6, -0.9, 0.15], [0.95, -0.6, 0.2], [1.2, -0.2, 0.1]], r: 0.05, only: "disease" },
    { id: "cbd", name: "Common bile duct", kind: "duct", pts: [[-0.15, -1.3, 0.2], [-0.25, -0.4, 0.25], [-0.35, 0.15, 0.3]], r: 0.05, r2: 0.05, dir: -1 },
    { id: "rhd", name: "Right hepatic duct", kind: "duct", pts: [[-0.35, 0.15, 0.3], [-0.9, 0.35, 0.35], [-1.4, 0.5, 0.35]], r: 0.036, r2: 0.03, dir: -1, label: false },
    { id: "lhd", name: "Left hepatic duct", kind: "duct", pts: [[-0.35, 0.15, 0.3], [0.3, 0.4, 0.4], [0.9, 0.45, 0.45]], r: 0.03, r2: 0.026, dir: -1, label: false },
  ],
  organs: [
    O("liver", "Liver", [-0.25, 0.6, -0.1], [1.95, 1.05, 1.2], "#8b3a3a", 0.13, { rot: [0, 0, 0.12] }),
    O("spleen", "Spleen", [2.2, 0.0, -1.3], [0.4, 0.6, 0.35], "#7a3b55", 0.15, { label: false }),
  ],
};

const visceral: AnatomyTemplate = {
  id: "visceral",
  target: [0, 0.8, 0],
  camera: [2.2, 1.6, 8],
  vessels: [
    A("aorta", "Abdominal aorta", [[0, 2.6, -0.6], [0, -2.4, -0.6]], 0.2, 0.18),
    A("celiac", "Coeliac trunk", [[0, 1.8, -0.6], [0, 1.85, -0.15]], 0.07, 0.065),
    A("splenic", "Splenic artery", [[0, 1.85, -0.15], [0.6, 2.0, -0.2], [1.2, 1.85, -0.35], [1.8, 2.05, -0.5]], 0.05, 0.045),
    A("cha", "Common hepatic artery", [[0, 1.85, -0.15], [-0.6, 1.9, -0.05], [-1.1, 2.2, 0]], 0.05, 0.045, { label: false }),
    A("sma", "Superior mesenteric artery", [[0, 1.4, -0.6], [0, 1.2, 0], [0.05, 0, 0.35], [0.25, -1.2, 0.4]], 0.07, 0.05),
    A("jej1", "Jejunal branch", [[0.05, 0.6, 0.25], [0.7, 0.4, 0.45], [1.2, -0.1, 0.5]], 0.025, 0.02, { label: false }),
    A("jej2", "Jejunal branch (bleeding)", [[0.05, 0.1, 0.33], [0.8, -0.4, 0.55], [1.1, -0.9, 0.6]], 0.025, 0.02),
    A("ileocolic", "Ileocolic artery", [[0.15, -0.6, 0.38], [-0.6, -1.0, 0.5], [-1.1, -1.4, 0.45]], 0.028, 0.022, { label: false }),
    A("midcolic", "Middle colic artery", [[0.02, 0.9, 0.15], [-0.4, 1.1, 0.4], [-0.9, 1.0, 0.5]], 0.025, 0.02, { label: false }),
    A("renal_r", "Right renal artery", [[0, 1.1, -0.6], [-0.55, 1.05, -0.65], [-0.95, 1.0, -0.72]], 0.07, 0.06),
    A("renal_l", "Left renal artery", [[0, 1.12, -0.6], [0.55, 1.08, -0.65], [0.95, 1.05, -0.72]], 0.07, 0.06),
    A("renal_l_up", "Upper-pole renal branch", [[0.9, 1.05, -0.72], [1.15, 1.35, -0.75], [1.3, 1.5, -0.78]], 0.03, 0.025, { label: false }),
    A("renal_r_low", "Lower-pole renal branch", [[-0.9, 1.0, -0.72], [-1.15, 0.7, -0.75], [-1.3, 0.55, -0.78]], 0.03, 0.025, { label: false }),
  ],
  organs: [
    O("spleen", "Spleen", [2.15, 2.1, -0.65], [0.45, 0.6, 0.35], "#7a3b55", 0.2),
    O("liver", "Liver", [-1.6, 2.4, -0.2], [1.1, 0.6, 0.8], "#8b3a3a", 0.1),
    O("kidney_r", "Right kidney", [-1.25, 0.95, -0.8], [0.28, 0.5, 0.24], "#b5525e", 0.2),
    O("kidney_l", "Left kidney", [1.25, 1.2, -0.8], [0.28, 0.5, 0.24], "#b5525e", 0.2),
    O("bowel", "Small bowel (schematic)", [0.5, -0.6, 0.6], [1.0, 0.8, 0.3], "#d9a38c", 0.1),
  ],
};

const pelvis: AnatomyTemplate = {
  id: "pelvis",
  target: [0, -0.1, 0],
  camera: [1.5, 0.8, 6.5],
  vessels: [
    A("aorta", "Distal aorta", [[0, 2.5, -0.3], [0, 1.2, -0.2]], 0.17, 0.16, { label: false }),
    A("cia_r", "Right common iliac artery", [[0, 1.2, -0.2], [-0.5, 0.5, -0.2]], 0.11, 0.1, { label: false }),
    A("cia_l", "Left common iliac artery", [[0, 1.2, -0.2], [0.5, 0.5, -0.2]], 0.11, 0.1, { label: false }),
    A("eia_r", "Right external iliac artery", [[-0.5, 0.5, -0.2], [-0.9, -0.5, 0.2], [-1.0, -1.6, 0.4]], 0.09, 0.085),
    A("eia_l", "Left external iliac artery", [[0.5, 0.5, -0.2], [0.9, -0.5, 0.2], [1.0, -1.6, 0.4]], 0.09, 0.085, { label: false }),
    A("iia_r", "Right internal iliac artery", [[-0.5, 0.5, -0.2], [-0.6, 0.0, -0.5], [-0.55, -0.4, -0.6]], 0.07, 0.06),
    A("iia_l", "Left internal iliac artery", [[0.5, 0.5, -0.2], [0.6, 0.0, -0.5], [0.55, -0.4, -0.6]], 0.07, 0.06, { label: false }),
    A("pa_r", "Right target branch", [[-0.55, -0.4, -0.6], [-0.5, -0.62, -0.2], [-0.3, -0.5, 0.0], [-0.12, -0.3, 0.05]], 0.03, 0.022),
    A("pa_l", "Left target branch", [[0.55, -0.4, -0.6], [0.5, -0.62, -0.2], [0.3, -0.5, 0.0], [0.12, -0.3, 0.05]], 0.03, 0.022),
  ],
  organs: [
    O("pelvis", "Bony pelvis", [0, -0.3, -0.3], [1.5, 0.9, 0.9], BONE, 0.05),
    O("bladder", "Bladder", [0, -0.9, 0.45], [0.35, 0.3, 0.3], "#e3d08a", 0.12),
  ],
};

const vertebrae: OrganDef[] = [-1.6, -0.8, 0, 0.8, 1.6].map((y, i) =>
  O(`v${i}`, i === 2 ? "Vertebral body (L2)" : "Vertebral body", [0, y, -0.5], [0.95, 0.55, 0.85], BONE, 0.22, { shape: "box", label: i === 2 }),
);

const spine: AnatomyTemplate = {
  id: "spine",
  target: [0, 0, -0.6],
  camera: [3.6, 1.2, 4.2],
  vessels: [
    A("aorta", "Aorta", [[0.55, 2.4, 0.3], [0.55, -2.4, 0.3]], 0.18, 0.18, { label: false }),
    A("seg1", "Segmental (radiculomedullary) artery", [[0.55, 0.6, 0.3], [0.7, 0.6, -0.4], [0.4, 0.65, -1.0], [0.1, 0.7, -1.18]], 0.025, 0.02),
    A("seg2", "Segmental artery", [[0.55, -1.0, 0.3], [0.7, -1.0, -0.4], [0.4, -0.95, -1.0], [0.1, -0.9, -1.18]], 0.025, 0.02, { label: false }),
    A("asa", "Anterior spinal artery", [[0, 2.4, -1.1], [0, -2.4, -1.1]], 0.015, 0.015, { label: false }),
    { id: "cord", name: "Spinal cord / thecal sac", kind: "cord", pts: [[0, 2.4, -1.28], [0, -2.4, -1.28]], r: 0.14, noFlow: true },
    { id: "root_r", name: "Exiting nerve root", kind: "nerve", pts: [[-0.12, -0.25, -1.25], [-0.5, -0.4, -1.05], [-1.0, -0.65, -0.8]], r: 0.035, r2: 0.03, noFlow: true },
    { id: "root_l", name: "Exiting nerve root", kind: "nerve", pts: [[0.12, -0.25, -1.25], [0.5, -0.4, -1.05], [1.0, -0.65, -0.8]], r: 0.035, r2: 0.03, noFlow: true, label: false },
  ],
  organs: [
    ...vertebrae,
    O("facet", "Facet joint", [-0.42, 0.42, -1.55], [0.14, 0.1, 0.12], BONE, 0.35, { shape: "box" }),
    O("si", "Posterior elements", [0, 0.4, -1.7], [0.9, 0.22, 0.25], BONE, 0.12, { shape: "box", label: false }),
  ],
};

const chest: AnatomyTemplate = {
  id: "chest",
  target: [0, 1, -0.2],
  camera: [2.2, 1.6, 7],
  vessels: [
    A("aorta", "Thoracic aorta", [[0, 1.0, 0.6], [0.3, 2.0, 0.3], [0.5, 2.2, -0.3], [0.6, 1.6, -0.7], [0.6, -2.4, -0.7]], 0.18, 0.16, { dir: 1 }),
    A("ba_r", "Right bronchial artery (hypertrophied)", [[0.6, 1.2, -0.7], [0.1, 1.25, -0.35], [-0.35, 1.0, -0.05], [-0.6, 0.95, -0.25], [-1.0, 0.5, -0.15]], 0.026, 0.02),
    { id: "trachea", name: "Trachea", kind: "airway", pts: [[0, 2.9, 0], [0, 1.4, 0]], r: 0.12, noFlow: true },
    { id: "rb", name: "Right main bronchus", kind: "airway", pts: [[0, 1.4, 0], [-0.6, 0.9, 0], [-1.1, 0.4, -0.1]], r: 0.08, r2: 0.06, noFlow: true, label: false },
    { id: "lb", name: "Left main bronchus", kind: "airway", pts: [[0, 1.4, 0], [0.6, 0.9, 0], [1.0, 0.4, -0.1]], r: 0.08, r2: 0.06, noFlow: true, label: false },
  ],
  organs: [
    O("lung_r", "Right lung", [-1.25, 0.6, -0.2], [0.95, 1.7, 0.9], "#9fd8e6", 0.08),
    O("lung_l", "Left lung", [1.25, 0.6, -0.2], [0.85, 1.65, 0.85], "#9fd8e6", 0.08, { label: false }),
  ],
};

const body: AnatomyTemplate = {
  id: "body",
  target: [0, 0.2, 0],
  camera: [0, 0.3, 8.5],
  vessels: [
    A("aorta", "Aorta", [[-0.1, 1.3, 0.3], [-0.05, 2.1, 0.25], [0.15, 2.45, 0], [0.35, 2.2, -0.25], [0.3, 1.4, -0.3], [0.15, 0, -0.25], [0.05, -1.2, -0.1]], 0.17, 0.12),
    A("bca", "Brachiocephalic trunk", [[0.0, 2.35, 0.12], [-0.3, 2.9, 0.1]], 0.07, 0.065),
    A("rcca", "Right common carotid", [[-0.3, 2.9, 0.1], [-0.35, 3.85, 0.15]], 0.05, 0.045),
    A("rsub", "Right subclavian", [[-0.3, 2.9, 0.1], [-0.8, 3.0, 0], [-1.4, 2.7, -0.05], [-1.9, 2.0, 0]], 0.05, 0.04),
    A("lcca", "Left common carotid", [[0.1, 2.42, 0.05], [0.3, 3.85, 0.15]], 0.05, 0.045),
    A("lsub", "Left subclavian", [[0.25, 2.38, -0.1], [0.8, 3.0, -0.05], [1.4, 2.7, -0.05], [1.9, 2.0, 0]], 0.05, 0.04),
    A("celiac", "Coeliac trunk", [[0.1, -0.2, -0.22], [0.15, -0.25, 0.15], [0.45, -0.15, 0.25]], 0.04, 0.035),
    A("sma", "SMA", [[0.08, -0.5, -0.2], [0.1, -0.75, 0.2], [0.05, -1.4, 0.35]], 0.045, 0.035),
    A("rra", "Right renal artery", [[0.07, -0.75, -0.18], [-0.7, -0.8, -0.25]], 0.04, 0.035),
    A("lra", "Left renal artery", [[0.07, -0.75, -0.18], [0.75, -0.8, -0.25]], 0.04, 0.035),
    A("rcia", "Right iliac", [[0.05, -1.2, -0.1], [-0.35, -1.8, 0], [-0.6, -2.3, 0.1]], 0.08, 0.07),
    A("lcia", "Left iliac", [[0.05, -1.2, -0.1], [0.4, -1.8, 0], [0.62, -2.3, 0.1]], 0.08, 0.07),
    A("rfa", "Right femoral", [[-0.6, -2.3, 0.1], [-0.75, -2.9, 0.2], [-0.8, -3.7, 0.15]], 0.06, 0.05),
    A("lfa", "Left femoral", [[0.62, -2.3, 0.1], [0.77, -2.9, 0.2], [0.82, -3.7, 0.15]], 0.06, 0.05),
    Vn("rij", "Right internal jugular", [[-0.48, 3.85, 0.08], [-0.42, 2.8, 0.15]], 0.06, 0.065),
    Vn("lij", "Left internal jugular", [[0.48, 3.85, 0.08], [0.32, 2.9, 0.15], [-0.32, 2.78, 0.18]], 0.06, 0.065),
    Vn("svc", "Superior vena cava", [[-0.38, 2.75, 0.17], [-0.36, 1.55, 0.22]], 0.1, 0.1),
    Vn("ivc", "Inferior vena cava", [[-0.28, 1.1, -0.05], [-0.28, -0.2, -0.2], [-0.22, -1.3, -0.15]], 0.12, 0.11, { dir: -1 }),
    Vn("rrv", "Right renal vein", [[-0.27, -0.75, -0.16], [-0.75, -0.82, -0.22]], 0.04, 0.04, { dir: -1 }),
    Vn("lrv", "Left renal vein", [[-0.27, -0.7, -0.16], [0.1, -0.7, 0.02], [0.75, -0.78, -0.22]], 0.04, 0.04, { dir: -1 }),
    Vn("rciv", "Right iliac vein", [[-0.22, -1.3, -0.15], [-0.52, -1.9, -0.05], [-0.74, -2.35, 0.05]], 0.085, 0.075, { dir: -1 }),
    Vn("lciv", "Left iliac vein", [[-0.22, -1.3, -0.15], [0.25, -1.75, -0.1], [0.74, -2.35, 0.05]], 0.085, 0.075, { dir: -1 }),
    Vn("rfv", "Right femoral vein", [[-0.74, -2.35, 0.05], [-0.92, -2.9, 0.12], [-0.97, -3.7, 0.08]], 0.065, 0.06, { dir: -1 }),
    Vn("lfv", "Left femoral vein", [[0.74, -2.35, 0.05], [0.94, -2.9, 0.12], [0.99, -3.7, 0.08]], 0.065, 0.06, { dir: -1 }),
  ],
  organs: [
    O("heart", "Heart", [0.08, 1.15, 0.35], [0.55, 0.5, 0.45], "#c0394b", 0.22),
    O("liver", "Liver", [-0.55, 0.15, 0.1], [1.0, 0.5, 0.6], "#8b3a3a", 0.1),
    O("kidney_r", "Kidney", [-0.92, -0.8, -0.3], [0.22, 0.38, 0.18], "#b5525e", 0.18),
    O("kidney_l", "Kidney", [0.95, -0.8, -0.3], [0.22, 0.38, 0.18], "#b5525e", 0.18),
    O("lung_r", "Lung", [-0.8, 1.6, 0], [0.62, 1.0, 0.5], "#9fd8e6", 0.05),
    O("lung_l", "Lung", [0.8, 1.6, 0], [0.6, 1.0, 0.5], "#9fd8e6", 0.05),
  ],
};

export const TEMPLATES: Record<string, AnatomyTemplate> = { leg, aorta, venous, arm, brain, liver, visceral, pelvis, spine, chest, body };
