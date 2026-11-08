import type { Metadata } from "next";
import { CtaBand, Notice, PageHero } from "@/components/site/Blocks";
import { CLINIC } from "@/data";

export const metadata: Metadata = { title: "About Dr. Girendra Shankar", description: "Dr. Girendra Shankar, MBBS, MD, FVIR, EBIR — Vascular & Interventional Radiologist, Complex Intervention Specialist." };

const INTERESTS = ["Complex peripheral arterial disease & limb salvage", "Aortic and aortoiliac endovascular intervention", "Deep venous and iliocaval reconstruction", "Dialysis access salvage", "Neurointervention", "Hepatobiliary and liver-directed oncology", "Image-guided tumour ablation", "Advanced embolisation"];

export default function AboutPage() {
  return (
    <>
      <PageHero kicker="About" title={CLINIC.doctor} intro={`${CLINIC.quals} · ${CLINIC.role} | Complex Intervention Specialist`} />
      <section className="bg-clinical px-5 py-16 lg:px-8">
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[360px_1fr]">
          <div>
            <div className="grid aspect-[4/5] place-items-center rounded-3xl border-2 border-dashed border-slate-300 bg-white text-center text-sm text-slate-400" data-testid="about-photo-placeholder">Professional photograph<br />to be supplied</div>
            <div className="mt-6 rounded-2xl bg-deep p-6 text-white">
              <p className="label-mono text-cyan">Qualifications</p>
              <p className="mt-2 font-heading text-xl">{CLINIC.quals}</p>
            </div>
          </div>
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Professional biography</h2>
              <p className="mt-4 max-w-3xl leading-relaxed text-slate-600">{CLINIC.doctor} is a Vascular and Interventional Radiologist with a focus on complex, minimally invasive image-guided interventions across vascular, neurovascular, hepatobiliary and oncological practice. He leads Delhi Vascular IR Clinic, an independent specialist practice in {CLINIC.location}.</p>
              <p className="mt-3 text-sm text-slate-500" data-testid="about-bio-placeholder">[Detailed biography, training history and years of practice — to be supplied by Dr. Shankar.]</p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Institutional experience</h2>
              <ol className="relative mt-6 space-y-6 border-l-2 border-teal/30 pl-8" data-testid="about-affiliations">
                <li className="relative">
                  <span className="absolute -left-[41px] top-1 size-4 rounded-full border-4 border-clinical bg-teal" />
                  <p className="label-mono text-teal">Current affiliation</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{CLINIC.current}</p>
                  <p className="text-sm text-slate-500">Hospital affiliation — separate from the independent Moti Nagar clinic.</p>
                </li>
                {CLINIC.previous.map((p) => (
                  <li key={p} className="relative">
                    <span className="absolute -left-[39px] top-1.5 size-3 rounded-full bg-slate-300" />
                    <p className="label-mono text-slate-500">Previous affiliation</p>
                    <p className="mt-1 text-lg font-medium text-slate-800">{p}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Clinical interests & areas of expertise</h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">{INTERESTS.map((x) => <li key={x} className="rounded-xl border border-border bg-white px-4 py-3 text-slate-700">{x}</li>)}</ul>
            </div>
            <Notice>Academic and research contributions will be listed on the Academics page once supplied. No figures for experience, procedure volumes or outcomes are shown on this website.</Notice>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
