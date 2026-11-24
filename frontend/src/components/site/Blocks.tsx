import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PageHero({ kicker, title, intro, children }: { kicker: string; title: string; intro?: string; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-navy pb-20 pt-36 text-white">
      <div className="grid-fade absolute inset-0 opacity-60" aria-hidden />
      <div className="absolute -right-40 top-0 size-[520px] rounded-full bg-teal/15 blur-[120px]" aria-hidden />
      <div className="relative mx-auto max-w-[1400px] px-5 lg:px-8">
        <p className="label-mono text-cyan">{kicker}</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.08] sm:text-5xl" data-testid="page-title">{title}</h1>
        {intro && <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300">{intro}</p>}
        {children}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-clinical" aria-hidden />
    </section>
  );
}

export function Notice({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "warn" }) {
  return (
    <div className={cn("rounded-xl border-l-4 px-5 py-4 text-sm leading-relaxed", tone === "warn" ? "border-amber-500 bg-amber-50 text-amber-950" : "border-teal bg-[#fbeaea] text-[#7d0000]")} data-testid="notice">
      {children}
    </div>
  );
}

export function CtaBand() {
  return (
    <section className="bg-clinical px-5 py-20 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8 rounded-3xl bg-deep p-10 text-white md:flex-row md:items-center md:justify-between lg:p-14">
        <div>
          <p className="label-mono text-cyan">Next step</p>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold">Every treatment decision starts with an individual assessment.</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/contact#book" className={cn(buttonVariants({ size: "lg" }), "bg-teal text-white hover:bg-[#7d0000]")} data-testid="cta-book-btn">Book a Consultation</Link>
          <Link href="/referrals#refer" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "border-cyan/50 bg-transparent text-cyan hover:bg-cyan/10")} data-testid="cta-refer-btn">Refer a Patient</Link>
        </div>
      </div>
    </section>
  );
}
