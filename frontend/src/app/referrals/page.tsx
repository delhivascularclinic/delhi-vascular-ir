import type { Metadata } from "next";
import Link from "next/link";
import { Notice, PageHero } from "@/components/site/Blocks";
import { ReferralForm } from "@/components/site/Forms";
import { CATEGORIES, CLINIC, PROCEDURES } from "@/data";
import { DetailValue } from "@/components/site/ClinicContact";

export const metadata: Metadata = { title: "Doctor Referral Portal", description: "Refer a patient, submit a case with imaging, or request a professional discussion with Dr. Girendra Shankar." };

const PATHWAY = ["Submit the referral with clinical summary and imaging", "Specialist review of history and imaging", "Professional discussion with the referring doctor / MDT where appropriate", "Patient consultation and shared decision-making", "Procedure in an appropriately equipped setting, with feedback to the referrer"];

export default function ReferralsPage() {
  return (
    <>
      <PageHero kicker="Referring Doctor Portal" title="Refer a patient or discuss a case" intro="A direct pathway for clinicians to refer patients, submit cases with imaging and coordinate multidisciplinary care." />
      <section className="bg-clinical px-5 py-16 lg:px-8">
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[1fr_1.5fr]">
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Referral pathway</h2>
              <ol className="mt-4 space-y-3">{PATHWAY.map((s, i) => <li key={s} className="flex gap-3 text-sm text-slate-700"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-deep font-mono text-[11px] text-cyan">{i + 1}</span>{s}</li>)}</ol>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Technical overview (Doctor mode)</h2>
              <p className="mt-2 text-sm text-slate-600">Every procedure in the 3D Explorer has a Doctor mode with access strategy, procedural steps and clinical considerations.</p>
              <div className="mt-4 space-y-3">
                {CATEGORIES.map((c) => (
                  <div key={c.id}><p className="label-mono text-slate-500">{c.title}</p>
                    <p className="mt-1 text-sm">{PROCEDURES.filter((p) => p.category === c.id).map((p, i, a) => <span key={p.slug}><Link href={`/explorer/${p.slug}`} className="text-[#a00000] hover:underline">{p.title}</Link>{i < a.length - 1 ? " · " : ""}</span>)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-deep p-6 text-sm text-white">
              <p className="label-mono text-cyan">Professional contact</p>
              <p className="mt-2"><DetailValue d={CLINIC.placeholders[0]} testid="referral-contact-phone" /><br /><DetailValue d={CLINIC.placeholders[2]} testid="referral-contact-email" /></p>
              <p className="mt-3 text-slate-400">Urgent referrals: please submit and also call the clinic.</p>
            </div>
          </div>
          <div id="refer" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold text-slate-900">Referral & case submission</h2>
            <div className="mb-6 mt-3"><Notice>Submissions are transmitted over HTTPS and stored privately. Uploaded imaging is never publicly accessible — only authorised clinic staff can view it after signing in.</Notice></div>
            <ReferralForm />
          </div>
        </div>
      </section>
    </>
  );
}
