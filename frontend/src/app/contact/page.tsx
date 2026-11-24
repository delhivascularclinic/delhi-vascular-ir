import type { Metadata } from "next";
import { Notice, PageHero } from "@/components/site/Blocks";
import { ConsultationForm } from "@/components/site/Forms";
import { CLINIC } from "@/data";
import { DetailValue } from "@/components/site/ClinicContact";

export const metadata: Metadata = { title: "Contact & Book a Consultation", description: "Book a consultation with Dr. Girendra Shankar at Delhi Vascular IR Clinic, Moti Nagar, New Delhi." };

export default function ContactPage() {
  return (
    <>
      <PageHero kicker="Contact" title="Contact & consultations" intro={`${CLINIC.name} · ${CLINIC.location}`} />
      <section id="book" className="scroll-mt-20 bg-clinical px-5 py-16 lg:px-8">
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-6">
            <div className="rounded-2xl bg-deep p-7 text-white" data-testid="contact-details">
              <p className="label-mono text-cyan">Clinic details</p>
              <ul className="mt-4 space-y-3 text-sm">{CLINIC.placeholders.map((p) => <li key={p.label}><span className="block text-slate-400">{p.label}</span><DetailValue d={p} testid={`contact-${p.label.toLowerCase().replace(/\s+/g, "-")}`} /></li>)}</ul>
            </div>
            <iframe title="Clinic location map" src={CLINIC.mapEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              className="aspect-video w-full rounded-2xl border border-border bg-white" data-testid="contact-map" />
            <a href={CLINIC.mapLink} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#a00000] hover:underline" data-testid="contact-directions-link">Get directions on Google Maps →</a>
            <Notice tone="warn">For emergencies such as stroke symptoms, sudden severe pain, heavy bleeding or breathlessness, call emergency services or go to the nearest emergency department.</Notice>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Book a consultation</h2>
            <p className="mb-6 mt-2 text-sm text-slate-600">Submit a request and the clinic team will contact you to confirm a time.</p>
            <ConsultationForm />
          </div>
        </div>
      </section>
    </>
  );
}
