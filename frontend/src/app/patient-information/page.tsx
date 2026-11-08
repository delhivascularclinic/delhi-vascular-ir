import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, Notice, PageHero } from "@/components/site/Blocks";
import { CONDITIONS } from "@/data";

export const metadata: Metadata = { title: "Patient Information Centre", description: "What interventional radiology is, how image-guided procedures work, preparation, recovery, risks and FAQs." };

const TOPICS = [
  ["What is interventional radiology?", "Interventional radiology (IR) uses imaging — X-ray, ultrasound, CT or MRI — to guide thin instruments such as needles, wires and catheters through tiny skin punctures to diagnose and treat conditions from inside the body."],
  ["How image-guided procedures work", "A small puncture, usually in the groin, wrist or skin over the target, gives access. Live imaging guides instruments precisely to the problem area, where balloons, stents, coils, embolic agents or ablation probes are used."],
  ["Benefits and limitations", "Benefits can include smaller wounds, less pain and shorter recovery than open surgery. Limitations: not every condition or anatomy is suitable, some treatments need repeating, and surgery or medicines may sometimes be the better option."],
  ["Preparation before a procedure", "You may need blood tests, imaging and a review of medicines (especially blood thinners and diabetes medicines). Fasting instructions, allergies (including to contrast) and kidney function are checked. Bring previous reports and scans."],
  ["What happens during treatment", "Most procedures use local anaesthetic with or without sedation; some need general anaesthesia. Your heart rate, blood pressure and oxygen are monitored throughout. You may feel pressure or warmth from contrast dye."],
  ["Recovery and follow-up", "Many patients go home the same or next day; complex procedures may need longer hospital stays. You will receive instructions on wound care, activity and medicines, and follow-up imaging or clinic visits."],
  ["Potential risks and complications", "Risks depend on the procedure and include bleeding or bruising, infection, contrast reactions, kidney strain, vessel injury, and procedure-specific risks explained before consent. No procedure is risk-free."],
];
const FAQ = [
  ["Will I be awake?", "Often yes, with local anaesthetic and sedation for comfort. Some procedures (e.g. some neurointerventions) use general anaesthesia."],
  ["Is a minimally invasive procedure always better than surgery?", "No. The right option depends on your condition, anatomy and overall health. A more complex or expensive procedure is not necessarily better."],
  ["Are the 3D animations my actual treatment?", "No. They are schematic educational illustrations to explain concepts. Your plan is based on your own scans and assessment."],
  ["Do I need a referral?", "You can request a consultation directly. If you have a referring doctor, bring their letter and your reports."],
];

export default function PatientInfoPage() {
  return (
    <>
      <PageHero kicker="Patient Information Centre" title="Clear information, before you decide" intro="Plain-language explanations of interventional radiology, preparation, recovery and risks — and pages for common conditions." />
      <section className="bg-clinical px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-[1400px] space-y-16">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {TOPICS.map(([h, b]) => (
              <article key={h} className="rounded-2xl border border-border bg-white p-7" data-testid="patient-topic">
                <h2 className="text-lg font-semibold text-slate-900">{h}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{b}</p>
              </article>
            ))}
          </div>
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">Conditions</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {CONDITIONS.map((c) => (
                <Link key={c.slug} href={`/patient-information/${c.slug}`} data-testid={`condition-link-${c.slug}`}
                  className="rounded-xl border border-border bg-white p-5 font-medium text-slate-800 transition-[border-color,transform] hover:-translate-y-0.5 hover:border-teal">{c.title}</Link>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">Frequently asked questions</h2>
            <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-white">
              {FAQ.map(([q, a]) => (
                <details key={q} className="group p-6" data-testid="faq-item">
                  <summary className="cursor-pointer list-none font-medium text-slate-900 marker:hidden">{q}<span className="float-right text-teal transition-transform group-open:rotate-45">+</span></summary>
                  <p className="mt-3 text-sm text-slate-600">{a}</p>
                </details>
              ))}
            </div>
          </div>
          <Notice>This information is general and educational. It does not replace advice from your own doctor.</Notice>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
