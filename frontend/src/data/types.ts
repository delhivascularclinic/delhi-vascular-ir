import type { SceneConfig } from "@/components/three/core";

export type CategoryId = "peripheral" | "aortic" | "venous" | "dialysis" | "neuro" | "hepatobiliary" | "ablation" | "embolisation" | "nonvascular";

export interface Procedure {
  slug: string;
  title: string;
  category: CategoryId;
  flagship?: boolean;
  summary: string; // one-line patient summary
  patient: string; // patient-mode explanation
  doctor: string; // doctor-mode technical summary
  access: string; // access strategy (doctor mode)
  indications: string[];
  risks: string[];
  alternatives: string[];
  steps: string[]; // 6 patient-mode captions, one per phase
  tech: string[]; // 6 doctor-mode captions, one per phase
  scene: SceneConfig;
}
