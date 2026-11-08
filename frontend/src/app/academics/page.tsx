import type { Metadata } from "next";
import { CtaBand, PageHero } from "@/components/site/Blocks";

export const metadata: Metadata = { title: "Academics", description: "Academic, teaching and research contributions of Dr. Girendra Shankar." };

export default function AcademicsPage() {
  return (
    <>
      <PageHero kicker="Academics" title="Academic & research contributions" intro="Publications, presentations, teaching and professional memberships will be listed here once supplied and verified." />
      <section className="bg-clinical px-5 py-16 lg:px-8">
        <div className="mx-auto grid max-w-[1400px] gap-4 md:grid-cols-3">
          {["Publications", "Conference presentations", "Teaching & training"].map((x) => (
            <div key={x} className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8" data-testid="academics-placeholder">
              <h2 className="text-xl font-semibold text-slate-900">{x}</h2>
              <p className="mt-2 text-sm text-slate-500">[To be supplied]</p>
            </div>
          ))}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
