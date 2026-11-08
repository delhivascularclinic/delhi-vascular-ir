import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand, Notice, PageHero } from "@/components/site/Blocks";
import { CONDITIONS, getProcedure } from "@/data";

export const dynamicParams = false;
export function generateStaticParams() { return CONDITIONS.map((c) => ({ slug: c.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = CONDITIONS.find((x) => x.slug === slug);
  return c ? { title: c.title, description: c.what } : {};
}

export default async function ConditionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = CONDITIONS.find((x) => x.slug === slug);
  if (!c) notFound();
  return (
    <>
      <PageHero kicker="Patient Information" title={c.title} intro={c.what} />
      <section className="bg-clinical px-5 py-16 lg:px-8">
        <div className="mx-auto grid max-w-[1400px] gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-white p-7"><h2 className="text-lg font-semibold">Common symptoms</h2><ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-600">{c.symptoms.map((s) => <li key={s}>{s}</li>)}</ul></div>
          <div className="rounded-2xl border border-border bg-white p-7"><h2 className="text-lg font-semibold">Treatment options</h2><ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-600">{c.options.map((s) => <li key={s}>{s}</li>)}</ul></div>
          <div className="rounded-2xl bg-deep p-7 text-white"><h2 className="text-lg font-semibold">Watch in 3D</h2>
            <ul className="mt-3 space-y-2">{c.procedures.map((s) => { const p = getProcedure(s); return p ? <li key={s}><Link href={`/explorer/${s}`} className="text-sm text-cyan hover:underline" data-testid={`condition-3d-link-${s}`}>{p.title} →</Link></li> : null; })}</ul>
          </div>
          <div className="lg:col-span-3"><Notice>The best option depends on your individual assessment. Minimally invasive treatment is one option among several and is not suitable for everyone.</Notice></div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
