import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { CtaBand, Notice, PageHero } from "@/components/site/Blocks";
import { SERVICES } from "@/data";

export const dynamicParams = false;
export function generateStaticParams() { return SERVICES.map((s) => ({ slug: s.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = SERVICES.find((x) => x.slug === slug);
  return s ? { title: s.title, description: s.intro.slice(0, 155) } : {};
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = SERVICES.find((x) => x.slug === slug);
  if (!s) notFound();
  return (
    <>
      <PageHero kicker={s.kicker} title={s.title} intro={s.intro} />
      <section className="bg-clinical px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-[1400px] space-y-12">
          {s.note && <Notice tone={s.slug === "office-based" ? "warn" : "info"}>{s.note}</Notice>}
          {s.groups.map((g) => (
            <div key={g.title} className="grid gap-6 lg:grid-cols-[280px_1fr]">
              <h2 className="text-2xl font-semibold text-slate-900">{g.title}</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {g.items.map((it) => (
                  <li key={it.name} className="rounded-xl border border-border bg-white p-5" data-testid="service-item">
                    <p className="font-medium text-slate-900">{it.name}</p>
                    {it.note && <p className="mt-1 text-xs text-slate-500">{it.note}</p>}
                    {it.slug && <Link href={`/explorer/${it.slug}`} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#008B85] hover:underline" data-testid={`service-3d-link-${it.slug}`}>View in 3D <ArrowUpRight className="size-4" /></Link>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <Notice>Not every patient is suitable for every procedure. Options, including medical and surgical alternatives, are discussed after individual assessment. Services requiring hospital infrastructure are performed in appropriately equipped hospital settings.</Notice>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
