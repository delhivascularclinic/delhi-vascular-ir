import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProcedureExplorer from "@/components/site/ProcedureExplorer";
import { PageHero } from "@/components/site/Blocks";
import { PROCEDURES, getProcedure } from "@/data";

export const dynamicParams = false;
export function generateStaticParams() { return PROCEDURES.map((p) => ({ slug: p.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProcedure((await params).slug);
  return p ? { title: `${p.title} — 3D explained`, description: p.summary } : {};
}

export default async function ProcedurePage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProcedure((await params).slug);
  if (!p) notFound();
  return (
    <>
      <PageHero kicker="3D Procedure Explorer" title={p.title} intro={p.summary} />
      <section className="bg-navy px-3 pb-20 sm:px-5 lg:px-8"><div className="mx-auto max-w-[1600px]"><ProcedureExplorer initialSlug={p.slug} /></div></section>
    </>
  );
}
