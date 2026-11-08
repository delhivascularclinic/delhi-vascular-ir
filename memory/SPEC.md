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
Phone, WhatsApp, email, exact address, maps, booking link, socials, timings, photo, biography details, academics.
