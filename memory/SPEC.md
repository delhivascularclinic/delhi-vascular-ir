# Delhi Vascular IR Clinic — SPEC

## What it is
Premium medical website for Dr. Girendra Shankar (MBBS, MD, FVIR, EBIR), Vascular & Interventional Radiologist, independent clinic in Moti Nagar, New Delhi. Current affiliation: Max Super Speciality Hospital, Shalimar Bagh (shown as separate from the clinic). Previous: Sri Balaji Action Medical Institute, Action Cancer Hospital, Medanta.

## Stack
- Frontend: **Next.js 15 (App Router)** in /app/frontend (migrated from the Vite template per user request), React 19, TS strict, Tailwind v4 (@tailwindcss/postcss), shadcn/base-ui, Three.js + React Three Fiber + Drei, GSAP (hero scroll), motion. Dev: `next dev` on :3000, `/api/*` rewritten to :8001 in dev; prod = `output: "export"` static build.
- Backend: FastAPI + Mongo (motor). Routers: backend/routers/forms.py (public), backend/routers/admin.py (auth). Models: backend/models/forms.py.
- Typecheck: `cd /app/frontend && yarn typecheck` (tsc --noEmit).

## Pages
/ (3D hero + home explorer with 6 flagship procedures), /about, /services/{peripheral-vascular|neurointerventional|hepatobiliary|office-based|complex-interventions}, /explorer, /explorer/[slug] (47 procedures), /patient-information, /patient-information/[slug] (10 conditions), /referrals (#refer form w/ uploads), /academics (placeholders), /contact (#book consultation form), /admin (staff inbox).

## 3D engine (frontend/src/components/three)
- core.ts types/geometry; anatomy.ts procedural templates (leg, aorta, venous, arm, brain, liver, visceral, pelvis, spine, chest, body).
- ProcedureScene.tsx: data-driven scene from SceneConfig (lesions, routes, devices, flow). 6 phases: Normal → Disease → Strategy → Navigation → Intervention → Result.
- Explorer controls: zoom in/out, auto-rotate, labels, reset, prev/play-pause/next, step buttons, Normal/Diseased compare, click structure to select; Patient/Doctor mode panel.
- Procedure content: frontend/src/data/procedures-vascular.ts, procedures-advanced.ts. Services/conditions/clinic placeholders: data/index.ts.
- WebGL fallback (data-testid=webgl-fallback), reduced-motion support, frameloop paused offscreen.

## API
- POST /api/consultations (JSON ConsultationCreate) → 201 {id, reference "CONS-xxxx"}; consent must be true (422).
- POST /api/referrals (multipart: `payload` JSON string of ReferralCreate + `files[]`, ≤5 files, ≤25MB, ext pdf/jpg/jpeg/png/dcm/zip/doc/docx) → 201 {id, reference "REF-xxxx"}. Files stored in UPLOAD_DIR by opaque id, never public.
- Admin (cookie): POST /api/admin/login, POST /api/admin/logout, GET /api/admin/me, GET /api/admin/counts, GET /api/admin/consultations, GET /api/admin/referrals, PATCH /api/admin/{consultations|referrals}/{id} {status: new|reviewed|scheduled|closed}, GET /api/admin/files/{file_id}.

## Seed / data facts
No seed script. Test submissions may exist from smoke tests ("Test Patient", "Browser Test", referral "Pat One" with scan.pdf).

## Placeholders (do not invent)
Timings, booking link, socials, photo, biography details, academics.

## Clinic contact (real, supplied by user)
Phone/WhatsApp +91 70658 00025 (tel:/wa.me links, floating WhatsApp button), delhivascularclinic@gmail.com, "Delhi Vascular IR Clinic, 1st Floor, 29, Shivaji Marg, Moti Nagar, Block C, Najafgarh Road Industrial Area, New Delhi, Delhi 110015" — Google Maps listing cid 6847658182754647482 (/g/11zyvz0k8w), pin 28.662746,77.154222 (embed on /contact, directions links open the listing). Stored in CLINIC in frontend/src/data/index.ts.

## Email alerts (Emergent managed Resend)
backend/lib/email.py — on every consultation/referral submission a BackgroundTask emails CLINIC_ALERT_EMAIL (delhivascularclinic@gmail.com) with a server-side template (no clinical summary/imaging in email; staff inbox link). Failures are logged and never break submission. Env: EMERGENT_EMAIL_KEY, EMAIL_FROM_NAME, EMAIL_REPLY_TO, CLINIC_ALERT_EMAIL, PUBLIC_SITE_URL.

## Hindi patient mode
POST /api/translate/{slug} with PatientContent {title, summary, patient, steps[6], indications, risks, alternatives} → TranslationOut {slug, lang:"hi", cached, content}. Gemini 3 Flash via EMERGENT_LLM_KEY; cached in Mongo `translations` by sha256(slug+content); 40 uncached req/hour/IP. Explorer patient mode has English/हिन्दी toggle.

## Shareable links
Explorer share button → /explorer/{slug}?step=N (native share sheet or clipboard); explorer opens paused at that step.

## Brand & logo
- Palette derived from the clinic logo: crimson `#a00000` (Tailwind token `teal` — primary buttons, accents on light), light crimson `#f0646a` (token `cyan` — accents on dark), logo navy `#1f3a55` (`deep`), dark navy `#0c1a2a`/`#132a40` (`navy`/`navy-2`), silver `#b8c0c8` (`silver`). Token names kept for compatibility.
- Logo is a public uploaded asset, referenced as `CLINIC.logo` in `frontend/src/data/index.ts`; used in header (logo only on mobile), footer lockup, admin inbox header, favicon/apple icon and OpenGraph image.
- 3D scenes: device/glow accents silver, lights crimson; anatomy colours unchanged.
- Homepage intro section shows an uploaded, illustrative procedure-suite photo (`CLINIC.procedureImage`, public asset) captioned 'Illustrative image'. It is AI-generated and intentionally NOT used as Dr. Shankar's portrait (About page placeholder remains).
- Doctor portrait (public asset, `CLINIC.portrait`) on About page and homepage hero doctor card.
- Clinic timings `CLINIC.hours`: Mon–Sat 6–9 PM, Sun 9 AM–12 PM (contact page table + details list + footer). Landmark: opposite DLF MidTown Plaza mall. Google reviews link `CLINIC.reviewsLink` (search "girendra shankar") on contact page + footer.
