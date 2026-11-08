"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiPost, apiPostForm, errorMessage } from "@/lib/api";
import { AREAS } from "@/data";
import { cn } from "@/lib/utils";
import { useMounted } from "@/lib/hooks";

export interface SubmissionReceipt { id: string; reference: string }
export interface ConsultationCreate {
  full_name: string; phone: string; email: string | null; age: number | null; area_of_concern: string;
  preferred_mode: "in_person" | "video" | "either"; preferred_date: string | null; message: string; consent: boolean;
}
export interface ReferralCreate {
  referrer_name: string; referrer_qualification: string; referrer_institution: string; referrer_phone: string; referrer_email: string;
  patient_name: string; patient_age: number | null; patient_sex: "female" | "male" | "other" | "unspecified"; category: string;
  urgency: "routine" | "soon" | "urgent"; clinical_summary: string; imaging_summary: string; question: string; consent: boolean;
}

const selectCls = "h-10 w-full rounded-md border border-input bg-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring";
export function Field({ label, id, children, hint }: { label: string; id: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-slate-700">{label}</Label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function Done({ reference, onReset, what, testid }: { reference: string; onReset: () => void; what: string; testid: string }) {
  return (
    <div className="rounded-2xl border border-teal/40 bg-[#E6FFFA] p-8 text-[#0D5E58]" data-testid={testid}>
      <CheckCircle2 className="size-8" />
      <p className="mt-3 font-heading text-xl font-semibold">{what} received</p>
      <p className="mt-1 text-sm">Reference: <span className="font-mono font-semibold" data-testid={`${testid}-reference`}>{reference}</span>. The clinic team will contact you. For emergencies, contact emergency services.</p>
      <Button variant="outline" className="mt-5" onClick={onReset} data-testid={`${testid}-new`}>Submit another</Button>
    </div>
  );
}

const queryParam = (k: string) => (typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get(k));

export function ConsultationForm() {
  const empty: ConsultationCreate = { full_name: "", phone: "", email: null, age: null, area_of_concern: "", preferred_mode: "in_person", preferred_date: null, message: "", consent: false };
  const [f, setF] = useState<ConsultationCreate>(empty);
  const [done, setDone] = useState<string | null>(null);
  const mounted = useMounted();
  useEffect(() => { const a = queryParam("area"); if (a) setF((x) => ({ ...x, area_of_concern: "Other / not sure", message: `Interested in: ${a}` })); }, []);
  const m = useMutation({
    mutationFn: (b: ConsultationCreate) => apiPost<SubmissionReceipt>("/consultations", b),
    onSuccess: (r) => { setDone(r.reference); setF(empty); toast.success("Consultation request sent"); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const set = <K extends keyof ConsultationCreate>(k: K, v: ConsultationCreate[K]) => setF((x) => ({ ...x, [k]: v }));
  if (done) return <Done reference={done} onReset={() => setDone(null)} what="Consultation request" testid="consult-success" />;
  return (
    <form className="grid gap-5 rounded-2xl border border-border bg-white p-6 sm:grid-cols-2 lg:p-8" data-testid="consult-form"
      onSubmit={(e) => { e.preventDefault(); m.mutate(f); }}>
      <Field label="Full name *" id="c-name"><Input id="c-name" required value={f.full_name} onChange={(e) => set("full_name", e.target.value)} data-testid="consult-name-input" /></Field>
      <Field label="Phone *" id="c-phone"><Input id="c-phone" required type="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} data-testid="consult-phone-input" /></Field>
      <Field label="Email" id="c-email"><Input id="c-email" type="email" value={f.email ?? ""} onChange={(e) => set("email", e.target.value || null)} data-testid="consult-email-input" /></Field>
      <Field label="Age" id="c-age"><Input id="c-age" type="number" min={0} max={120} value={f.age ?? ""} onChange={(e) => set("age", e.target.value ? Number(e.target.value) : null)} data-testid="consult-age-input" /></Field>
      <Field label="Area of concern *" id="c-area">
        <select id="c-area" required className={selectCls} value={f.area_of_concern} onChange={(e) => set("area_of_concern", e.target.value)} data-testid="consult-area-select">
          <option value="">Select…</option>{AREAS.map((a) => <option key={a}>{a}</option>)}
        </select>
      </Field>
      <Field label="Preferred consultation" id="c-mode">
        <select id="c-mode" className={selectCls} value={f.preferred_mode} onChange={(e) => set("preferred_mode", e.target.value as ConsultationCreate["preferred_mode"])} data-testid="consult-mode-select">
          <option value="in_person">In person (Moti Nagar)</option><option value="video">Video consultation</option><option value="either">Either</option>
        </select>
      </Field>
      <Field label="Preferred date" id="c-date"><Input id="c-date" type="date" value={f.preferred_date ?? ""} onChange={(e) => set("preferred_date", e.target.value || null)} data-testid="consult-date-input" /></Field>
      <div className="sm:col-span-2"><Field label="Brief description (optional)" id="c-msg" hint="Please avoid sharing detailed medical records here; bring reports to your appointment.">
        <Textarea id="c-msg" rows={4} value={f.message} onChange={(e) => set("message", e.target.value)} data-testid="consult-message-input" /></Field></div>
      <label className="flex items-start gap-3 text-sm text-slate-600 sm:col-span-2">
        <input type="checkbox" className="mt-1 size-4 accent-[#00B8B0]" checked={f.consent} onChange={(e) => set("consent", e.target.checked)} required data-testid="consult-consent-checkbox" />
        I consent to the clinic storing these details to contact me about my request. I understand this form is not for emergencies.
      </label>
      <Button type="submit" disabled={!mounted || m.isPending} className="h-11 bg-teal text-navy hover:bg-cyan sm:col-span-2" data-testid="consult-submit-btn">{m.isPending ? "Sending…" : "Request consultation"}</Button>
    </form>
  );
}

const ALLOWED = ".pdf,.jpg,.jpeg,.png,.dcm,.zip,.doc,.docx";
export function ReferralForm() {
  const empty: ReferralCreate = { referrer_name: "", referrer_qualification: "", referrer_institution: "", referrer_phone: "", referrer_email: "", patient_name: "", patient_age: null, patient_sex: "unspecified", category: "", urgency: "routine", clinical_summary: "", imaging_summary: "", question: "", consent: false };
  const [f, setF] = useState<ReferralCreate>(empty);
  const [files, setFiles] = useState<File[]>([]);
  const [done, setDone] = useState<string | null>(null);
  const mounted = useMounted();
  useEffect(() => { const c = queryParam("category"); if (c) setF((x) => ({ ...x, category: "Other / not sure", question: `Regarding: ${c}` })); }, []);
  const m = useMutation({
    mutationFn: (b: ReferralCreate) => {
      const fd = new FormData();
      fd.append("payload", JSON.stringify(b));
      files.forEach((x) => fd.append("files", x));
      return apiPostForm<SubmissionReceipt>("/referrals", fd);
    },
    onSuccess: (r) => { setDone(r.reference); setF(empty); setFiles([]); toast.success("Referral submitted securely"); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const set = <K extends keyof ReferralCreate>(k: K, v: ReferralCreate[K]) => setF((x) => ({ ...x, [k]: v }));
  const onFiles = (list: FileList | null) => {
    const arr = Array.from(list ?? []);
    const bad = arr.find((x) => x.size > 25 * 1024 * 1024);
    if (bad) return toast.error(`${bad.name} exceeds 25 MB`);
    if (arr.length > 5) return toast.error("Maximum 5 files");
    setFiles(arr);
  };
  if (done) return <Done reference={done} onReset={() => setDone(null)} what="Referral" testid="referral-success" />;
  return (
    <form className="space-y-8 rounded-2xl border border-border bg-white p-6 lg:p-8" data-testid="referral-form" onSubmit={(e) => { e.preventDefault(); m.mutate(f); }}>
      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="label-mono mb-4 text-teal">Referring clinician</legend>
        <Field label="Name *" id="r-name"><Input id="r-name" required value={f.referrer_name} onChange={(e) => set("referrer_name", e.target.value)} data-testid="referral-referrer-name-input" /></Field>
        <Field label="Qualification / specialty" id="r-qual"><Input id="r-qual" value={f.referrer_qualification} onChange={(e) => set("referrer_qualification", e.target.value)} data-testid="referral-qualification-input" /></Field>
        <Field label="Hospital / clinic *" id="r-inst"><Input id="r-inst" required value={f.referrer_institution} onChange={(e) => set("referrer_institution", e.target.value)} data-testid="referral-institution-input" /></Field>
        <Field label="Phone *" id="r-phone"><Input id="r-phone" type="tel" required value={f.referrer_phone} onChange={(e) => set("referrer_phone", e.target.value)} data-testid="referral-phone-input" /></Field>
        <div className="sm:col-span-2"><Field label="Email *" id="r-email"><Input id="r-email" type="email" required value={f.referrer_email} onChange={(e) => set("referrer_email", e.target.value)} data-testid="referral-email-input" /></Field></div>
      </fieldset>
      <fieldset className="grid gap-5 sm:grid-cols-3">
        <legend className="label-mono mb-4 text-teal">Patient & case</legend>
        <Field label="Patient name *" id="r-pname"><Input id="r-pname" required value={f.patient_name} onChange={(e) => set("patient_name", e.target.value)} data-testid="referral-patient-name-input" /></Field>
        <Field label="Age" id="r-page"><Input id="r-page" type="number" min={0} max={120} value={f.patient_age ?? ""} onChange={(e) => set("patient_age", e.target.value ? Number(e.target.value) : null)} data-testid="referral-patient-age-input" /></Field>
        <Field label="Sex" id="r-psex">
          <select id="r-psex" className={selectCls} value={f.patient_sex} onChange={(e) => set("patient_sex", e.target.value as ReferralCreate["patient_sex"])} data-testid="referral-patient-sex-select">
            <option value="unspecified">Not specified</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option>
          </select>
        </Field>
        <Field label="Intervention category *" id="r-cat">
          <select id="r-cat" required className={selectCls} value={f.category} onChange={(e) => set("category", e.target.value)} data-testid="referral-category-select">
            <option value="">Select…</option>{AREAS.map((a) => <option key={a}>{a}</option>)}
          </select>
        </Field>
        <Field label="Urgency" id="r-urg">
          <select id="r-urg" className={selectCls} value={f.urgency} onChange={(e) => set("urgency", e.target.value as ReferralCreate["urgency"])} data-testid="referral-urgency-select">
            <option value="routine">Routine</option><option value="soon">Soon (within 1–2 weeks)</option><option value="urgent">Urgent — please also call</option>
          </select>
        </Field>
        <div className="sm:col-span-3"><Field label="Clinical summary *" id="r-sum"><Textarea id="r-sum" required minLength={10} rows={4} value={f.clinical_summary} onChange={(e) => set("clinical_summary", e.target.value)} data-testid="referral-clinical-summary-input" /></Field></div>
        <div className="sm:col-span-3"><Field label="Imaging summary" id="r-img"><Textarea id="r-img" rows={2} value={f.imaging_summary} onChange={(e) => set("imaging_summary", e.target.value)} data-testid="referral-imaging-summary-input" /></Field></div>
        <div className="sm:col-span-3"><Field label="Specific question / request for discussion" id="r-q"><Textarea id="r-q" rows={2} value={f.question} onChange={(e) => set("question", e.target.value)} data-testid="referral-question-input" /></Field></div>
        <div className="sm:col-span-3"><Field label="Imaging & reports (optional)" id="r-files" hint="Up to 5 files, 25 MB each (PDF, JPG, PNG, DICOM, ZIP, DOC). Stored privately — accessible only to authorised clinic staff, never publicly.">
          <Input id="r-files" type="file" multiple accept={ALLOWED} onChange={(e) => onFiles(e.target.files)} data-testid="referral-files-input" /></Field>
          {files.length > 0 && <ul className="mt-2 text-xs text-slate-600" data-testid="referral-file-list">{files.map((x) => <li key={x.name}>{x.name} · {(x.size / 1024 / 1024).toFixed(1)} MB</li>)}</ul>}
        </div>
      </fieldset>
      <label className="flex items-start gap-3 text-sm text-slate-600">
        <input type="checkbox" className="mt-1 size-4 accent-[#00B8B0]" checked={f.consent} onChange={(e) => set("consent", e.target.checked)} required data-testid="referral-consent-checkbox" />
        I confirm the patient has consented to sharing this information for referral and specialist review.
      </label>
      <Button type="submit" disabled={!mounted || m.isPending} className={cn("h-11 w-full bg-deep text-white hover:bg-navy")} data-testid="referral-submit-btn">{m.isPending ? "Uploading securely…" : "Submit referral"}</Button>
    </form>
  );
}
