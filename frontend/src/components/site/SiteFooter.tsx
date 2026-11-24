"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CLINIC } from "@/data";
import { NAV } from "./SiteHeader";
import { DetailValue, WhatsAppButton } from "./ClinicContact";

export default function SiteFooter() {
  const path = usePathname();
  if (path?.startsWith("/admin")) return null;
  return (
    <footer className="bg-navy text-slate-300" data-testid="site-footer">
      <WhatsAppButton />
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-16 lg:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
        <div>
          <p className="font-heading text-xl font-semibold text-white">{CLINIC.name}</p>
          <p className="mt-2 text-sm text-slate-400">Complex Interventions. Precision. Expertise.</p>
          <p className="mt-6 text-sm">{CLINIC.doctor}, {CLINIC.quals}<br />{CLINIC.role}</p>
          <p className="mt-4 text-sm"><span className="label-mono text-cyan">Clinic</span><br />Independent specialist practice — {CLINIC.location}</p>
          <p className="mt-4 text-sm"><span className="label-mono text-cyan">Current hospital affiliation</span><br />{CLINIC.current} (separate from the clinic)</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {NAV.map((n) => <Link key={n.href} href={n.href} className="text-slate-400 transition-colors hover:text-cyan">{n.label}</Link>)}
        </nav>
        <div className="space-y-2 text-sm">
          {CLINIC.placeholders.slice(0, 5).map((p) => <p key={p.label}><span className="text-slate-500">{p.label}: </span><DetailValue d={p} testid={`footer-${p.label.toLowerCase().replace(/\s+/g, "-")}`} /></p>)}
          <Link href="/admin" className="inline-block pt-3 text-xs text-slate-500 hover:text-cyan" data-testid="footer-admin-link">Staff login</Link>
        </div>
      </div>
      <div className="border-t border-[#1E3A5F]/60">
        <p className="mx-auto max-w-[1400px] px-5 py-6 text-xs leading-relaxed text-slate-500 lg:px-8" data-testid="footer-disclaimer">
          Medical disclaimer: 3D animations and procedure information on this website are schematic educational illustrations only. They are not patient-specific treatment plans and do not guarantee outcomes. Suitability for any procedure, and the choice between alternatives, depends on individual clinical and imaging assessment. In an emergency, contact emergency services. © {new Date().getFullYear()} {CLINIC.name}.
        </p>
      </div>
    </footer>
  );
}
