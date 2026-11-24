"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Brain, Activity, Stethoscope, Syringe, Waves, HeartPulse } from "lucide-react";
import ProcedureExplorer from "@/components/site/ProcedureExplorer";
import { CtaBand } from "@/components/site/Blocks";
import { buttonVariants } from "@/components/ui/button";
import { CLINIC, FLAGSHIP_SLUGS, PROCEDURES, SERVICES } from "@/data";
import { useInView, useReducedMotion, useWebGL } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });
const ICONS = [Activity, Brain, HeartPulse, Syringe, Waves];

export default function HomePage() {
  const reduced = useReducedMotion();
  const gl = useWebGL();
  const heroRef = useRef<HTMLElement>(null);
  const heroVisible = useInView(heroRef, "0px");
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const on = () => setWide(window.innerWidth >= 1024);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  useEffect(() => {
    if (reduced || !heroRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.to("[data-hero-canvas]", { opacity: 0.15, scale: 1.08, ease: "none", scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: true } });
    }, heroRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <>
      <section ref={heroRef} className="relative min-h-[100svh] overflow-hidden bg-navy text-white" data-testid="home-hero">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(160,0,0,0.16),transparent_65%)]" aria-hidden />
        <div className="grid-fade absolute inset-0 opacity-40" aria-hidden />
        <div data-hero-canvas className="absolute inset-0">
          {gl === "ok" && <HeroScene reduced={reduced} offsetX={wide ? 2.3 : 0} active={heroVisible} />}
        </div>
        <div className="relative mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-center px-5 pb-24 pt-28 lg:px-8">
          <motion.div initial={reduced ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }} className="max-w-2xl">
            <p className="label-mono text-cyan">Complex Interventions. Precision. Expertise.</p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.04] sm:text-6xl" data-testid="hero-headline">Advanced Vascular &amp; Image-Guided Interventions</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">Precision-driven minimally invasive treatments for complex vascular, neurological, hepatobiliary and oncological conditions.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact#book" className={cn(buttonVariants({ size: "lg" }), "bg-teal px-6 text-white hover:bg-[#7d0000]")} data-testid="hero-book-btn">Book a Consultation</Link>
              <Link href="/referrals#refer" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "border-cyan/50 bg-transparent px-6 text-cyan hover:bg-cyan/10 hover:text-cyan")} data-testid="hero-refer-btn">Refer a Patient</Link>
              <Link href="#explorer" className={cn(buttonVariants({ size: "lg", variant: "ghost" }), "px-4 text-white hover:bg-white/10 hover:text-white")} data-testid="hero-explore-btn">Explore Procedures <ArrowRight className="ml-1 size-4" /></Link>
            </div>
          </motion.div>
          <motion.div initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}
            className="mt-14 inline-flex max-w-md flex-col gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md" data-testid="hero-doctor-card">
            <p className="font-heading text-lg font-semibold">{CLINIC.doctor}</p>
            <p className="font-mono text-xs tracking-wider text-cyan">{CLINIC.quals}</p>
            <p className="text-sm text-slate-300">{CLINIC.role}</p>
            <p className="text-sm text-slate-400">{CLINIC.name}, {CLINIC.location}</p>
          </motion.div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-clinical" aria-hidden />
      </section>

      <section className="bg-clinical px-5 py-20 lg:px-8" data-testid="home-intro-section">
        <div className="mx-auto grid max-w-[1400px] items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div>
            <p className="label-mono text-teal">Image-guided, minimally invasive</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">An independent specialist practice for complex image-guided care.</h2>
            <div className="mt-6 space-y-4 text-slate-600">
              <p>Delhi Vascular IR Clinic in Moti Nagar is the independent practice of {CLINIC.doctor}. Procedures that need hospital facilities are performed in appropriately equipped hospital settings. Dr. Shankar&apos;s current hospital affiliation is {CLINIC.current}; the clinic itself is separate from the hospital.</p>
              <p>Treatment recommendations are based on individual assessment, imaging and — where needed — multidisciplinary discussion. Minimally invasive options are explained alongside medical and surgical alternatives.</p>
              <p>Interventional radiology treats disease from inside the blood vessels or through a needle, using live X-ray, ultrasound or CT guidance — usually through a pinhole rather than an open incision.</p>
            </div>
          </div>
          <motion.figure initial={reduced ? false : { opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }} className="relative" data-testid="home-procedure-photo">
            <div className="absolute -inset-3 -z-0 rounded-[2rem] bg-gradient-to-br from-teal/15 via-transparent to-deep/20 blur-2xl" aria-hidden />
            <div className="group relative overflow-hidden rounded-3xl shadow-[0_30px_80px_-30px_rgba(12,26,42,0.55)] ring-1 ring-black/5">
              <img src={CLINIC.procedureImage} alt="Interventional radiologist guiding a catheter under live angiography in a hybrid procedure suite" width={1493} height={2000} loading="lazy"
                className="aspect-[4/5] w-full object-cover object-[center_45%] transition-transform duration-700 group-hover:scale-[1.03] lg:max-h-[620px]" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy/80 to-transparent" aria-hidden />
              <figcaption className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/15 bg-navy/60 px-4 py-3 text-white backdrop-blur-md" data-testid="home-procedure-photo-caption">
                <p className="label-mono text-cyan">Catheter-based treatment</p>
                <p className="mt-1 text-sm text-slate-200">Live imaging guides wires and devices through the blood vessels. Illustrative image.</p>
              </figcaption>
            </div>
          </motion.figure>
        </div>
      </section>

      <section id="explorer" className="scroll-mt-20 bg-navy px-5 py-24 text-white lg:px-8" data-testid="home-explorer-section">
        <div className="mx-auto max-w-[1400px]">
          <p className="label-mono text-cyan">Signature experience</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold sm:text-5xl">Advanced Vascular Interventions — Visualised in 3D</h2>
          <p className="mt-5 max-w-3xl text-lg text-slate-300">Explore how complex vascular conditions can be treated using modern, minimally invasive, image-guided techniques. Rotate, zoom, compare normal and diseased anatomy, and step through each procedure.</p>
          <div className="mt-10"><ProcedureExplorer slugs={FLAGSHIP_SLUGS} compact /></div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-slate-400">{PROCEDURES.length} procedures animated across 9 categories. Schematic educational illustrations only.</p>
            <Link href="/explorer" className={cn(buttonVariants({ variant: "outline" }), "border-cyan/50 bg-transparent text-cyan hover:bg-cyan/10 hover:text-cyan")} data-testid="home-open-explorer-btn">Open full 3D Procedure Explorer <ArrowRight className="ml-1 size-4" /></Link>
          </div>
        </div>
      </section>

      <section className="bg-clinical px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-[1400px]">
          <p className="label-mono text-teal">Clinical service lines</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Specialist interventions</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            {SERVICES.map((s, i) => {
              const Icon = ICONS[i];
              return (
                <Link key={s.slug} href={`/services/${s.slug}`} data-testid={`home-service-${s.slug}`}
                  className={cn("group rounded-2xl border border-border bg-white p-7 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-teal/50 hover:shadow-[0_20px_50px_-20px_rgba(7,21,37,0.25)]", i < 2 ? "lg:col-span-3" : "lg:col-span-2")}>
                  <Icon className="size-6 text-teal" />
                  <p className="label-mono mt-6 text-slate-500">{s.kicker}</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">{s.title}</h3>
                  <p className="mt-3 line-clamp-3 text-sm text-slate-600">{s.intro}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-[#a00000]">View service <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-24 lg:px-8">
        <div className="mx-auto grid max-w-[1400px] gap-6 lg:grid-cols-2">
          {[
            { k: "For patients & families", t: "Understand your condition and options", steps: ["Understand the condition", "Explore treatment options", "Watch the 3D animation", "Read preparation & recovery", "Request a consultation"], href: "/patient-information", cta: "Patient information", Icon: HeartPulse, id: "patients" },
            { k: "For referring doctors", t: "Refer, discuss or review technical approach", steps: ["Explore specialist services", "Review intervention capabilities", "Access technical summaries (Doctor mode)", "Submit a referral with imaging", "Request a professional discussion"], href: "/referrals", cta: "Doctor referral portal", Icon: Stethoscope, id: "doctors" },
          ].map((j) => (
            <div key={j.id} className="rounded-3xl border border-border bg-clinical p-8 lg:p-10" data-testid={`journey-${j.id}`}>
              <j.Icon className="size-7 text-teal" />
              <p className="label-mono mt-6 text-slate-500">{j.k}</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">{j.t}</h3>
              <ol className="mt-6 space-y-3">{j.steps.map((s, i) => <li key={s} className="flex items-center gap-3 text-slate-700"><span className="grid size-7 place-items-center rounded-full bg-deep font-mono text-xs text-cyan">{i + 1}</span>{s}</li>)}</ol>
              <Link href={j.href} className={cn(buttonVariants(), "mt-8 bg-deep text-white hover:bg-navy")} data-testid={`journey-${j.id}-cta`}>{j.cta}</Link>
            </div>
          ))}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
