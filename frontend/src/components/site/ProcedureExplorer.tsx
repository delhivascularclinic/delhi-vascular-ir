"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Rotate3d, Share2, Tags, ZoomIn, ZoomOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiPost, errorMessage } from "@/lib/api";
import { PHASES, KIND_LABEL } from "@/components/three/core";
import { TEMPLATES } from "@/components/three/anatomy";
import type { Compare, ControlsApi } from "@/components/three/ProcedureScene";
import { CATEGORIES, PROCEDURES, getProcedure } from "@/data";
import { buttonVariants } from "@/components/ui/button";
import { useInView, useReducedMotion, useWebGL } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const ProcedureCanvas = dynamic(() => import("@/components/three/ProcedureScene"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center font-mono text-xs uppercase tracking-widest text-cyan/70">Loading 3D anatomy…</div>,
});

function IconBtn({ label, onClick, children, active, testid }: { label: string; onClick: () => void; children: React.ReactNode; active?: boolean; testid: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} data-testid={testid} aria-pressed={active}
      className={cn("grid size-9 place-items-center rounded-lg border text-slate-200 transition-[background-color,color,border-color] duration-200 focus-visible:outline-2 focus-visible:outline-cyan",
        active ? "border-cyan/60 bg-cyan/15 text-cyan" : "border-white/10 bg-white/5 hover:border-cyan/40 hover:text-white")}>
      {children}
    </button>
  );
}

export interface PatientContent { title: string; summary: string; patient: string; steps: string[]; indications: string[]; risks: string[]; alternatives: string[] }
export interface TranslationOut { slug: string; lang: string; cached: boolean; content: PatientContent }

type Procedure = NonNullable<ReturnType<typeof getProcedure>>;
type Lang = "en" | "hi";
type Mode = "patient" | "doctor";
interface PatientText { steps: string[]; patient: string; indications: string[]; risks: string[]; alternatives: string[] }

/** On-demand Hindi translation of the patient-facing text, falling back to English. */
function useHindiContent(proc: Procedure, enabled: boolean) {
  const hi = useQuery({
    queryKey: ["translation-hi", proc.slug],
    queryFn: () => apiPost<TranslationOut>(`/translate/${proc.slug}`, {
      title: proc.title, summary: proc.summary, patient: proc.patient, steps: proc.steps,
      indications: proc.indications, risks: proc.risks, alternatives: proc.alternatives,
    } satisfies PatientContent),
    enabled,
    staleTime: Infinity,
    retry: 0,
  });
  const hindi = enabled ? hi.data?.content : undefined;
  const tx: PatientText = {
    steps: hindi?.steps ?? proc.steps, patient: hindi?.patient ?? proc.patient, indications: hindi?.indications ?? proc.indications,
    risks: hindi?.risks ?? proc.risks, alternatives: hindi?.alternatives ?? proc.alternatives,
  };
  return { hi, hindi, tx };
}

function ProcedureList({ list, current, onPick }: { list: Procedure[]; current: string; onPick: (slug: string) => void }) {
  return (
    <aside className="max-h-[720px] overflow-y-auto rounded-2xl border border-[#2a4866] bg-navy-2 p-3" aria-label="Procedures" data-testid="explorer-procedure-list">
      {CATEGORIES.map((c) => {
        const items = list.filter((p) => p.category === c.id);
        if (!items.length) return null;
        return (
          <div key={c.id} className="mb-3">
            <p className="label-mono px-2 py-1.5 text-slate-500">{c.title}</p>
            {items.map((p) => (
              <button key={p.slug} type="button" onClick={() => onPick(p.slug)} data-testid={`explorer-select-${p.slug}`}
                className={cn("block w-full rounded-lg px-2.5 py-2 text-left text-[13px] leading-snug transition-colors", p.slug === current ? "bg-teal/15 text-cyan" : "text-slate-300 hover:bg-white/5 hover:text-white")}>
                {p.title}
              </button>
            ))}
          </div>
        );
      })}
    </aside>
  );
}

function ExplorerInfoPanel({ proc, step, mode, setMode, lang, setLang, hi, hindi, tx }: {
  proc: Procedure; step: number; mode: Mode; setMode: (m: Mode) => void; lang: Lang; setLang: (l: Lang) => void;
  hi: ReturnType<typeof useHindiContent>["hi"]; hindi: PatientContent | undefined; tx: PatientText;
}) {
  return (
  <section className="flex max-h-[720px] flex-col overflow-hidden rounded-2xl border border-border bg-white text-slate-900" aria-label="Procedure explanation" data-testid="explorer-info-panel">
    <div className="flex border-b border-border p-1.5" role="tablist" aria-label="Explanation mode">
      {(["patient", "doctor"] as const).map((m) => (
        <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)} data-testid={`explorer-mode-${m}`}
          className={cn("flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors", mode === m ? "bg-deep text-white" : "text-slate-600 hover:bg-slate-100")}>
          {m === "patient" ? "Patient mode" : "Doctor mode"}
        </button>
      ))}
    </div>
    <div className="flex-1 space-y-5 overflow-y-auto p-5 text-sm leading-relaxed" lang={hindi ? "hi" : "en"}>
      {mode === "patient" && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex rounded-lg border border-border p-0.5 text-xs" role="group" aria-label="Language">
            {([["en", "English"], ["hi", "हिन्दी"]] as const).map(([l, name]) => (
              <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l} data-testid={`explorer-lang-${l}`}
                className={cn("rounded-md px-3 py-1.5 transition-colors", lang === l ? "bg-teal text-white" : "text-slate-600 hover:text-slate-900")}>{name}</button>
            ))}
          </div>
          {lang === "hi" && hi.isFetching && <span className="text-xs text-slate-500" data-testid="explorer-hindi-loading">हिन्दी अनुवाद तैयार हो रहा है…</span>}
          {lang === "hi" && hi.isError && <button type="button" onClick={() => hi.refetch()} className="text-xs text-red-600 underline" data-testid="explorer-hindi-error">{errorMessage(hi.error)} Retry</button>}
        </div>
      )}
      {hindi && <p className="text-xs text-slate-500" data-testid="explorer-hindi-note">AI-translated from English for easier reading — please confirm details with the doctor.</p>}
      <div className="rounded-xl bg-[#fbeaea] p-4" data-testid="explorer-step-caption">
        <p className="label-mono text-[#a00000]">Step {step + 1}: {PHASES[step]}</p>
        <p className="mt-1 text-[#7d0000]">{mode === "patient" ? tx.steps[step] : proc.tech[step]}</p>
      </div>
      {mode === "patient" ? <p className="text-slate-700" data-testid="explorer-patient-text">{tx.patient}</p> : (
        <>
          <p className="text-slate-700">{proc.doctor}</p>
          <p><span className="label-mono text-teal">Access</span><br />{proc.access}</p>
        </>
      )}
      {[["Common indications", tx.indications], ["Risks & limitations", tx.risks], ["Alternatives", tx.alternatives]].map(([h, items]) => (
        <div key={h as string}>
          <p className="label-mono text-slate-500">{h as string}</p>
          <ul className="mt-2 space-y-1.5">{(items as string[]).map((x) => <li key={x} className="flex gap-2 text-slate-700"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-teal" />{x}</li>)}</ul>
        </div>
      ))}
      <p className="rounded-lg border border-border bg-slate-50 p-3 text-xs text-slate-500">Schematic educational illustration — not a patient-specific plan. Suitability depends on individual clinical and imaging assessment; not every patient needs or benefits from this procedure.</p>
    </div>
    <div className="flex gap-2 border-t border-border p-4">
      <Link href={`/contact?area=${encodeURIComponent(proc.title)}#book`} className={cn(buttonVariants(), "flex-1 bg-teal text-white hover:bg-[#7d0000]")} data-testid="explorer-consult-link">Book consultation</Link>
      <Link href={`/referrals?category=${encodeURIComponent(proc.title)}#refer`} className={cn(buttonVariants({ variant: "outline" }), "flex-1")} data-testid="explorer-refer-link">Refer a patient</Link>
    </div>
  </section>
  );
}

export default function ProcedureExplorer({ initialSlug, slugs, compact = false }: { initialSlug?: string; slugs?: string[]; compact?: boolean }) {
  const list = useMemo(() => (slugs ? slugs.map((s) => getProcedure(s)!).filter(Boolean) : PROCEDURES), [slugs]);
  const [slug, setSlug] = useState(initialSlug ?? list[0].slug);
  const proc = getProcedure(slug) ?? list[0];
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [compare, setCompare] = useState<Compare>("none");
  const [labels, setLabels] = useState(false);
  const [rotate, setRotate] = useState(false);
  const [mode, setMode] = useState<"patient" | "doctor">("patient");
  const [selected, setSelected] = useState<string | null>(null);
  const progressRef = useRef(0);
  const apiRef = useRef<ControlsApi | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const inView = useInView(wrap);
  const reduced = useReducedMotion();
  const gl = useWebGL();

  useEffect(() => { if (reduced) setPlaying(false); }, [reduced]);
  useEffect(() => {
    const s = Number(new URLSearchParams(window.location.search).get("step"));
    if (s >= 1 && s <= 6) { setStep(s - 1); setPlaying(false); progressRef.current = 1; }
  }, []);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const { hi, hindi, tx } = useHindiContent(proc, lang === "hi" && mode === "patient");
  const share = async () => {
    const url = `${window.location.origin}/explorer/${proc.slug}?step=${step + 1}`;
    const text = `${proc.title} — step ${step + 1}: ${PHASES[step]}`;
    try {
      if (navigator.share) await navigator.share({ title: proc.title, text, url });
      else { await navigator.clipboard.writeText(url); toast.success("Link copied", { description: `Opens at step ${step + 1}: ${PHASES[step]}` }); }
    } catch { /* user cancelled share sheet */ }
  };
  const goStep = (s: number) => {
    setCompare("none");
    setStep(Math.max(0, Math.min(5, s)));
    progressRef.current = playing ? 0 : 1;
  };
  const pick = (s: string) => {
    setSlug(s);
    setSelected(null);
    setCompare("none");
    setStep(0);
    progressRef.current = 0;
    setPlaying(!reduced);
  };
  const onStepDone = () => {
    if (step < 5) { setStep((s) => s + 1); progressRef.current = 0; } else setPlaying(false);
  };
  const togglePlay = () => {
    if (!playing && step === 5 && progressRef.current >= 1) { setStep(0); progressRef.current = 0; }
    setCompare("none");
    setPlaying((p) => !p);
  };

  const tpl = TEMPLATES[proc.scene.template];
  const structure = selected ? (() => {
    const v = tpl.vessels.find((x) => x.id === selected);
    if (v) return { name: proc.scene.names?.[v.id] ?? v.name, kind: KIND_LABEL[v.kind] };
    const o = [...tpl.organs, ...(proc.scene.extraOrgans ?? [])].find((x) => x.id === selected);
    return o ? { name: o.name, kind: "Organ / structure" } : null;
  })() : null;

  return (
    <div ref={wrap} className={cn("grid gap-4", !compact && "lg:grid-cols-[260px_1fr_380px]", compact && "xl:grid-cols-[1fr_380px]")} data-testid="procedure-explorer">
      {!compact && <ProcedureList list={list} current={slug} onPick={pick} />}

      <div className="flex min-w-0 flex-col gap-3">
        {compact && (
          <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Featured procedures">
            {list.map((p) => (
              <button key={p.slug} type="button" role="tab" aria-selected={p.slug === slug} onClick={() => pick(p.slug)} data-testid={`explorer-tab-${p.slug}`}
                className={cn("shrink-0 rounded-full border px-4 py-2 text-sm transition-[background-color,color,border-color]", p.slug === slug ? "border-cyan/60 bg-cyan/15 text-cyan" : "border-white/10 text-slate-300 hover:border-white/30 hover:text-white")}>
                {p.title.split(" — ")[0].replace(/ \(.*\)/, "")}
              </button>
            ))}
          </div>
        )}
        <div className="relative h-[460px] overflow-hidden rounded-2xl border border-[#2a4866] bg-[radial-gradient(circle_at_60%_30%,rgba(160,0,0,0.14),transparent_60%),linear-gradient(180deg,#0c1a2a,#132a40)] sm:h-[560px]">
          <div className="grid-fade absolute inset-0 opacity-50" aria-hidden />
          {gl === "ok" && (
            <ProcedureCanvas sceneId={proc.slug} cfg={proc.scene} phase={step} progressRef={progressRef} compare={compare} labels={labels} selected={selected}
              onSelect={setSelected} playing={playing && compare === "none"} onStepDone={onStepDone} apiRef={apiRef} reduced={reduced} active={inView} />
          )}
          {gl === "none" && (
            <div className="grid h-full place-items-center p-8 text-center" data-testid="webgl-fallback">
              <div>
                <svg viewBox="0 0 200 200" className="mx-auto h-40 text-cyan" fill="none" stroke="currentColor" strokeWidth="2"><path d="M100 10v70m0 0-40 50m40-50 40 50M60 130l-15 60m15-60 20 60m60-60-20 60m20-60 15 60" strokeLinecap="round" /></svg>
                <p className="mt-4 text-sm text-slate-300">3D view unavailable on this device. Step descriptions are shown alongside.</p>
              </div>
            </div>
          )}
          <div className="pointer-events-none absolute left-4 top-4 max-w-[70%]">
            <p className="label-mono text-cyan">Step {step + 1} / 6 · {compare === "none" ? PHASES[step] : compare === "normal" ? "Normal anatomy (compare)" : "Diseased anatomy (compare)"}</p>
            <p className="mt-1 font-heading text-lg font-semibold text-white" data-testid="explorer-procedure-title">{proc.title}</p>
          </div>
          <div className="absolute right-3 top-3 flex flex-col gap-1.5" role="toolbar" aria-label="3D view controls">
            <IconBtn label="Zoom in" onClick={() => apiRef.current?.zoom(0.8)} testid="explorer-zoom-in"><ZoomIn className="size-4" /></IconBtn>
            <IconBtn label="Zoom out" onClick={() => apiRef.current?.zoom(1.25)} testid="explorer-zoom-out"><ZoomOut className="size-4" /></IconBtn>
            <IconBtn label="Auto-rotate" active={rotate} onClick={() => { apiRef.current?.setAutoRotate(!rotate); setRotate(!rotate); }} testid="explorer-rotate"><Rotate3d className="size-4" /></IconBtn>
            <IconBtn label="Show labels" active={labels} onClick={() => setLabels(!labels)} testid="explorer-labels"><Tags className="size-4" /></IconBtn>
            <IconBtn label="Reset view" onClick={() => apiRef.current?.reset()} testid="explorer-reset"><RotateCcw className="size-4" /></IconBtn>
            <IconBtn label="Share this step" onClick={share} testid="explorer-share"><Share2 className="size-4" /></IconBtn>
          </div>
          {structure && (
            <div className="absolute bottom-20 left-4 rounded-xl border border-cyan/30 bg-navy/85 px-4 py-3 backdrop-blur-md" data-testid="explorer-selected-structure">
              <p className="label-mono text-slate-400">{structure.kind}</p>
              <p className="text-sm font-medium text-white">{structure.name}</p>
            </div>
          )}
          <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-navy/80 p-2 backdrop-blur-md">
            <IconBtn label="Previous step" onClick={() => goStep(step - 1)} testid="explorer-prev-step"><ChevronLeft className="size-4" /></IconBtn>
            <IconBtn label={playing ? "Pause" : "Play"} active={playing} onClick={togglePlay} testid="explorer-play-toggle">{playing ? <Pause className="size-4" /> : <Play className="size-4" />}</IconBtn>
            <IconBtn label="Next step" onClick={() => goStep(step + 1)} testid="explorer-next-step"><ChevronRight className="size-4" /></IconBtn>
            <div className="ml-auto flex rounded-lg border border-white/10 p-0.5 text-xs" role="group" aria-label="Compare anatomy">
              {(["normal", "disease"] as const).map((c) => (
                <button key={c} type="button" onClick={() => { setCompare(compare === c ? "none" : c); setPlaying(false); }} aria-pressed={compare === c} data-testid={`explorer-compare-${c}`}
                  className={cn("rounded-md px-3 py-1.5 transition-colors", compare === c ? "bg-teal text-white" : "text-slate-300 hover:text-white")}>
                  {c === "normal" ? "Normal" : "Diseased"}
                </button>
              ))}
            </div>
          </div>
        </div>
        <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6" aria-label="Procedure steps" data-testid="explorer-steps">
          {PHASES.map((ph, i) => (
            <li key={ph}>
              <button type="button" onClick={() => goStep(i)} aria-current={i === step ? "step" : undefined} data-testid={`explorer-step-${i + 1}`}
                className={cn("h-full w-full rounded-xl border px-3 py-2.5 text-left transition-[background-color,border-color]", i === step ? "border-cyan/60 bg-cyan/10" : "border-[#2a4866] bg-navy-2 hover:border-cyan/30")}>
                <span className="font-mono text-[10px] text-cyan">0{i + 1}</span>
                <span className="block text-xs leading-tight text-slate-200">{ph}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <ExplorerInfoPanel proc={proc} step={step} mode={mode} setMode={setMode} lang={lang} setLang={setLang} hi={hi} hindi={hindi} tx={tx} />
    </div>
  );
}
