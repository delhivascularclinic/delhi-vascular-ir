"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Dr. Girendra Shankar" },
  { href: "/services/peripheral-vascular", label: "Peripheral Vascular" },
  { href: "/services/neurointerventional", label: "Neurointerventional" },
  { href: "/services/hepatobiliary", label: "Hepatobiliary" },
  { href: "/services/office-based", label: "Office-Based Procedures" },
  { href: "/services/complex-interventions", label: "Complex Interventions" },
  { href: "/explorer", label: "3D Procedure Explorer" },
  { href: "/patient-information", label: "Patient Information" },
  { href: "/referrals", label: "Doctor Referrals" },
  { href: "/academics", label: "Academics" },
  { href: "/contact", label: "Contact" },
];
const PRIMARY = ["/about", "/explorer", "/patient-information", "/referrals", "/contact"];
const slug = (h: string) => (h === "/" ? "home" : h.split("/").filter(Boolean).join("-"));

export default function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [path]);
  if (path?.startsWith("/admin")) return null;

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-300",
      scrolled ? "border-[#1E3A5F]/60 bg-navy/90 backdrop-blur-xl" : "border-transparent bg-gradient-to-b from-navy/80 to-transparent")} data-testid="site-header">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-5 lg:px-8">
        <Link href="/" className="group flex items-center gap-3" data-testid="nav-brand-link">
          <span className="relative grid size-9 place-items-center rounded-lg border border-cyan/40 bg-deep">
            <svg viewBox="0 0 24 24" className="size-5 text-cyan" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2v7m0 0-5 6m5-6 5 6M7 15l-2 7m2-7 3 7m7-7-3 7m3-7 2 7" strokeLinecap="round" /></svg>
          </span>
          <span className="whitespace-nowrap leading-tight">
            <span className="block font-heading text-[15px] font-semibold text-white">Delhi Vascular IR Clinic</span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">Dr. Girendra Shankar · FVIR, EBIR</span>
          </span>
        </Link>
        <nav className="ml-auto hidden items-center gap-1 whitespace-nowrap 2xl:flex" aria-label="Primary">
          {NAV.filter((n) => PRIMARY.includes(n.href)).map((n) => (
            <Link key={n.href} href={n.href} data-testid={`nav-${slug(n.href)}-link`}
              className={cn("rounded-md px-3 py-2 text-sm text-slate-300 transition-colors hover:text-white", path === n.href && "text-cyan")}>
              {n.label.replace("About Dr. Girendra Shankar", "About Dr.")}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 2xl:ml-2">
          <Link href="/referrals#refer" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "hidden border-cyan/40 bg-transparent text-cyan hover:bg-cyan/10 hover:text-cyan sm:inline-flex")} data-testid="nav-refer-patient-btn">Refer a Patient</Link>
          <Link href="/contact#book" className={cn(buttonVariants({ size: "sm" }), "bg-teal text-navy hover:bg-cyan")} data-testid="nav-book-consult-btn">Book Consultation</Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="grid size-9 place-items-center rounded-md border border-white/15 text-white hover:bg-white/10" aria-label="Open menu" data-testid="nav-menu-button">
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] border-[#1E3A5F] bg-navy text-white">
              <SheetTitle className="px-5 pt-5 font-heading text-white">Navigate</SheetTitle>
              <nav className="flex flex-col gap-0.5 overflow-y-auto px-3 pb-6" aria-label="All pages">
                {NAV.map((n, i) => (
                  <Link key={n.href} href={n.href} data-testid={`menu-${slug(n.href)}-link`}
                    className={cn("flex items-baseline gap-3 rounded-md px-3 py-2.5 text-[15px] text-slate-200 transition-colors hover:bg-white/5 hover:text-white", path === n.href && "bg-white/5 text-cyan")}>
                    <span className="font-mono text-[10px] text-slate-500">{String(i + 1).padStart(2, "0")}</span>{n.label}
                  </Link>
                ))}
                <Link href="/referrals#refer" className={cn(buttonVariants({ variant: "outline" }), "mt-4 border-cyan/40 bg-transparent text-cyan")} data-testid="menu-refer-btn">Refer a Patient</Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
