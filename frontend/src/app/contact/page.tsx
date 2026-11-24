import type { Metadata } from "next";
import { Notice, PageHero } from "@/components/site/Blocks";
import { ConsultationForm } from "@/components/site/Forms";
import { CLINIC } from "@/data";
import { DetailValue } from "@/components/site/ClinicContact";
import OpenStatus from "@/components/site/OpenStatus";

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
            <div className="rounded-2xl border border-border bg-white p-6" data-testid="contact-hours">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="label-mono text-teal">Clinic timings</p>
                <OpenStatus />
              </div>
              <dl className="mt-3 divide-y divide-border text-sm">
                {CLINIC.hours.map((h) => (
                  <div key={h.days} className="flex justify-between gap-4 py-2.5"><dt className="text-slate-600">{h.days}</dt><dd className="font-medium text-slate-900">{h.time}</dd></div>
                ))}
              </dl>
            </div>
            <iframe title="Clinic location map" src={CLINIC.mapEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              className="aspect-video w-full rounded-2xl border border-border bg-white" data-testid="contact-map" />
            <p className="text-sm text-slate-700" data-testid="contact-landmark"><span className="font-semibold">Landmark:</span> {CLINIC.landmark}, Shivaji Marg (Najafgarh Road), Moti Nagar — clinic on the 1st floor.</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <a href={CLINIC.mapLink} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#a00000] hover:underline" data-testid="contact-directions-link">Get directions on Google Maps →</a>
              <a href={CLINIC.reviewsLink} target="_blank" rel="noopener noreferrer" data-testid="contact-reviews-link"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-slate-800 transition-[border-color,box-shadow] hover:border-teal/50 hover:shadow-sm">
                <span className="text-[#f5a524]" aria-hidden>★★★★★</span> Leave a Google review
              </a>
            </div>
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
