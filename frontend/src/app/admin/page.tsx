"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, type ConsultationCreate, type ReferralCreate } from "@/components/site/Forms";
import { ApiError, apiGet, apiPatch, apiPost, errorMessage } from "@/lib/api";
import { beginSession, endSession } from "@/lib/session";
import { useMounted } from "@/lib/hooks";

type Status = "new" | "reviewed" | "scheduled" | "closed";
interface AdminMe { email: string }
interface InboxCounts { consultations_new: number; referrals_new: number }
interface Attachment { id: string; filename: string; content_type: string; size: number }
interface Consultation extends ConsultationCreate { id: string; created_at: string; status: Status }
interface Referral extends ReferralCreate { id: string; created_at: string; status: Status; attachments: Attachment[] }
const STATUSES: Status[] = ["new", "reviewed", "scheduled", "closed"];

function Login() {
  const mounted = useMounted();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const m = useMutation({
    mutationFn: () => apiPost<AdminMe>("/admin/login", { email, password }),
    onSuccess: () => { beginSession(); window.location.assign("/admin"); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <div className="grid min-h-screen place-items-center bg-navy px-5">
      <form className="w-full max-w-sm space-y-5 rounded-2xl border border-[#1E3A5F] bg-navy-2 p-8 text-white" onSubmit={(e) => { e.preventDefault(); m.mutate(); }} data-testid="admin-login-form">
        <ShieldCheck className="size-8 text-cyan" />
        <div><h1 className="text-2xl font-semibold">Clinic staff sign-in</h1><p className="mt-1 text-sm text-slate-400">Consultation & referral inbox</p></div>
        <div className="[&_label]:text-slate-300"><Field label="Email" id="a-email"><Input id="a-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white text-slate-900" data-testid="admin-email-input" /></Field></div>
        <div className="[&_label]:text-slate-300"><Field label="Password" id="a-pw"><Input id="a-pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white text-slate-900" data-testid="admin-password-input" /></Field></div>
        <Button type="submit" disabled={!mounted || m.isPending} className="h-11 w-full bg-teal text-navy hover:bg-cyan" data-testid="admin-login-btn">{m.isPending ? "Signing in…" : "Sign in"}</Button>
      </form>
    </div>
  );
}

function StatusSelect({ value, onChange, testid }: { value: Status; onChange: (s: Status) => void; testid: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as Status)} className="h-8 rounded-md border border-input bg-white px-2 text-xs" data-testid={testid}>
      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}
const when = (d: string) => new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

function Inbox({ me }: { me: AdminMe }) {
  const qc = useQueryClient();
  const counts = useQuery({ queryKey: ["admin-counts"], queryFn: () => apiGet<InboxCounts>("/admin/counts") });
  const cons = useQuery({ queryKey: ["admin-consultations"], queryFn: () => apiGet<Consultation[]>("/admin/consultations") });
  const refs = useQuery({ queryKey: ["admin-referrals"], queryFn: () => apiGet<Referral[]>("/admin/referrals") });
  const upd = useMutation({
    mutationFn: ({ kind, id, status }: { kind: "consultations" | "referrals"; id: string; status: Status }) => apiPatch(`/admin/${kind}/${id}`, { status }),
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: [`admin-${v.kind}`] }); qc.invalidateQueries({ queryKey: ["admin-counts"] }); toast.success("Status updated"); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <div className="min-h-screen bg-clinical">
      <header className="flex items-center justify-between bg-navy px-6 py-4 text-white">
        <p className="font-heading font-semibold">Delhi Vascular IR Clinic · Inbox</p>
        <div className="flex items-center gap-3 text-sm"><span className="text-slate-400" data-testid="admin-user-email">{me.email}</span>
          <Button size="sm" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10" onClick={() => endSession("/admin")} data-testid="admin-logout-btn"><LogOut className="mr-1 size-4" />Sign out</Button></div>
      </header>
      <div className="mx-auto max-w-6xl p-6">
        <Tabs defaultValue="referrals">
          <TabsList>
            <TabsTrigger value="referrals" data-testid="admin-tab-referrals">Referrals <Badge className="ml-2" data-testid="admin-referrals-new-count">{counts.data?.referrals_new ?? 0}</Badge></TabsTrigger>
            <TabsTrigger value="consultations" data-testid="admin-tab-consultations">Consultations <Badge className="ml-2" data-testid="admin-consultations-new-count">{counts.data?.consultations_new ?? 0}</Badge></TabsTrigger>
          </TabsList>
          <TabsContent value="referrals" className="mt-4 space-y-3">
            {refs.isError && <p className="text-sm text-red-600">Could not load referrals.</p>}
            {refs.data?.length === 0 && <p className="text-sm text-slate-500" data-testid="admin-referrals-empty">No referrals yet.</p>}
            {refs.data?.map((r) => (
              <article key={r.id} className="rounded-xl border border-border bg-white p-5 text-sm" data-testid="admin-referral-item">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-semibold text-slate-900">{r.patient_name}{r.patient_age != null ? `, ${r.patient_age}` : ""}</p>
                  <Badge variant={r.urgency === "urgent" ? "destructive" : "secondary"}>{r.urgency}</Badge>
                  <span className="text-slate-500">{r.category}</span>
                  <span className="ml-auto text-xs text-slate-400">{when(r.created_at)}</span>
                  <StatusSelect value={r.status} onChange={(s) => upd.mutate({ kind: "referrals", id: r.id, status: s })} testid={`admin-referral-status-${r.id}`} />
                </div>
                <p className="mt-2 text-slate-600">From {r.referrer_name} {r.referrer_qualification && `(${r.referrer_qualification})`} · {r.referrer_institution} · {r.referrer_phone} · {r.referrer_email}</p>
                <p className="mt-2 whitespace-pre-line text-slate-800">{r.clinical_summary}</p>
                {r.imaging_summary && <p className="mt-1 text-slate-600">Imaging: {r.imaging_summary}</p>}
                {r.question && <p className="mt-1 text-slate-600">Question: {r.question}</p>}
                {r.attachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">{r.attachments.map((a) => (
                    <a key={a.id} href={`/api/admin/files/${a.id}`} className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs text-[#008B85] hover:bg-slate-50" data-testid={`admin-attachment-${a.id}`}>
                      <Download className="size-3.5" />{a.filename} ({(a.size / 1024).toFixed(0)} KB)</a>))}
                  </div>
                )}
              </article>
            ))}
          </TabsContent>
          <TabsContent value="consultations" className="mt-4 space-y-3">
            {cons.data?.length === 0 && <p className="text-sm text-slate-500" data-testid="admin-consultations-empty">No consultation requests yet.</p>}
            {cons.data?.map((c) => (
              <article key={c.id} className="rounded-xl border border-border bg-white p-5 text-sm" data-testid="admin-consultation-item">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-semibold text-slate-900">{c.full_name}{c.age != null ? `, ${c.age}` : ""}</p>
                  <span className="text-slate-500">{c.area_of_concern}</span>
                  <span className="ml-auto text-xs text-slate-400">{when(c.created_at)}</span>
                  <StatusSelect value={c.status} onChange={(s) => upd.mutate({ kind: "consultations", id: c.id, status: s })} testid={`admin-consultation-status-${c.id}`} />
                </div>
                <p className="mt-2 text-slate-600">{c.phone}{c.email ? ` · ${c.email}` : ""} · {c.preferred_mode.replace("_", " ")}{c.preferred_date ? ` · prefers ${c.preferred_date}` : ""}</p>
                {c.message && <p className="mt-2 whitespace-pre-line text-slate-800">{c.message}</p>}
              </article>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const me = useQuery({ queryKey: ["admin-me"], queryFn: () => apiGet<AdminMe>("/admin/me"), retry: (n, e) => !(e instanceof ApiError && e.status === 401) && n < 1 });
  if (me.isPending) return <div className="grid min-h-screen place-items-center bg-navy text-sm text-slate-400">Loading…</div>;
  if (me.isError || !me.data) return <Login />;
  return <Inbox me={me.data} />;
}
