import { VASCULAR } from "./procedures-vascular";
import { ADVANCED } from "./procedures-advanced";
import type { CategoryId, Procedure } from "./types";

export const PROCEDURES: Procedure[] = [...VASCULAR, ...ADVANCED];
export const getProcedure = (slug: string) => PROCEDURES.find((p) => p.slug === slug);
export const FLAGSHIP_SLUGS = ["clti-limb-salvage", "evar", "iliocaval-reconstruction", "dvt-thrombectomy", "dialysis-access-salvage", "aneurysm-coiling"];

export const CATEGORIES: { id: CategoryId; title: string }[] = [
  { id: "peripheral", title: "Peripheral Arterial & Limb Salvage" },
  { id: "aortic", title: "Aortic & Aortoiliac" },
  { id: "venous", title: "Venous & DVT" },
  { id: "dialysis", title: "Dialysis Access" },
  { id: "neuro", title: "Neurointervention" },
  { id: "hepatobiliary", title: "Hepatobiliary & Portal" },
  { id: "ablation", title: "Tumour Ablation" },
  { id: "embolisation", title: "Advanced Embolisation" },
  { id: "nonvascular", title: "Biopsy, Drainage & Pain" },
];

export const CLINIC = {
  name: "Delhi Vascular IR Clinic",
  logo: "https://customer-assets-lqy194kg.emergentagent.net/job_delhi-vascular-ir--7t3oh8d2/artifacts/4de9011ed6b2ad91_Delhi%20IR%20%282%29.png",
  procedureImage: "https://customer-assets-lqy194kg.emergentagent.net/job_delhi-vascular-ir--7t3oh8d2/artifacts/3c31fdb1a30ba6f0_Gemini_Generated_Image_c6cgmgc6cgmgc6cg.webp",
  doctor: "Dr. Girendra Shankar",
  quals: "MBBS, MD, FVIR, EBIR",
  role: "Vascular & Interventional Radiologist",
  location: "Moti Nagar, New Delhi",
  current: "Max Super Speciality Hospital, Shalimar Bagh",
  previous: ["Sri Balaji Action Medical Institute", "Action Cancer Hospital", "Medanta – The Medicity, Gurugram"],
  phone: "+91 70658 00025",
  email: "delhivascularclinic@gmail.com",
  whatsapp: "https://wa.me/917065800025",
  address: "Delhi Vascular IR Clinic, 1st Floor, 29, Shivaji Marg, Moti Nagar, Block C, Najafgarh Road Industrial Area, New Delhi, Delhi 110015",
  mapEmbed: "https://maps.google.com/maps?q=Delhi+Vascular+IR+Clinic%4028.662746,77.154222&ll=28.662746,77.154222&z=17&output=embed",
  mapLink: "https://maps.google.com/?cid=6847658182754647482",
  placeholders: [
    { label: "Clinic phone", value: "+91 70658 00025", href: "tel:+917065800025" },
    { label: "WhatsApp", value: "+91 70658 00025", href: "https://wa.me/917065800025" },
    { label: "Email", value: "delhivascularclinic@gmail.com", href: "mailto:delhivascularclinic@gmail.com" },
    { label: "Address", value: "Delhi Vascular IR Clinic, 1st Floor, 29, Shivaji Marg, Moti Nagar, Block C, Najafgarh Road Industrial Area, New Delhi, Delhi 110015", href: "https://maps.google.com/?cid=6847658182754647482" },
    { label: "Clinic timings", value: "[Clinic timings — to be added]" },
    { label: "Appointment link", value: "[Online booking link — to be added]" },
    { label: "Social media", value: "[Social media links — to be added]" },
  ] as { label: string; value: string; href?: string }[],
};

export interface ServiceItem { name: string; slug?: string; note?: string }
export interface Service { slug: string; title: string; kicker: string; intro: string; groups: { title: string; items: ServiceItem[] }[]; note?: string }

const I = (name: string, slug?: string, note?: string): ServiceItem => ({ name, slug, note });

export const SERVICES: Service[] = [
  {
    slug: "peripheral-vascular", title: "Peripheral Vascular Interventions", kicker: "Arteries · Veins · Aorta · Dialysis access",
    intro: "Minimally invasive, image-guided treatment of arterial and venous disease of the limbs, pelvis and abdomen — from claudication and limb-threatening ischaemia to aneurysms, DVT and dialysis access dysfunction. Every plan is individualised after clinical and imaging assessment, and often coordinated with vascular surgery, nephrology, diabetology and wound-care teams.",
    groups: [
      { title: "Arterial disease & limb salvage", items: [I("Peripheral arterial disease", "pad-angioplasty-stenting"), I("Angioplasty and stenting", "pad-angioplasty-stenting"), I("Chronic total occlusion recanalisation", "cto-recanalisation"), I("Below-the-knee interventions", "below-knee-angioplasty"), I("Chronic limb-threatening ischaemia (CLTI)", "clti-limb-salvage"), I("Limb salvage", "clti-limb-salvage")] },
      { title: "Aortic", items: [I("Aortoiliac interventions", "aortoiliac-kissing-stents"), I("Aneurysm-related endovascular procedures (EVAR)", "evar"), I("Advanced aortic repair concepts", "fevar-concept", "Educational; availability case-dependent")] },
      { title: "Venous", items: [I("Deep vein thrombosis", "dvt-thrombectomy"), I("Mechanical thrombectomy", "dvt-thrombectomy"), I("Iliocaval reconstruction", "iliocaval-reconstruction"), I("May-Thurner syndrome", "may-thurner-stenting"), I("Varicose vein interventions", "varicose-vein-ablation"), I("IVC filter placement and retrieval", "ivc-filter")] },
      { title: "Dialysis access & visceral", items: [I("Dialysis access interventions", "avf-angioplasty"), I("Fistula thrombectomy & salvage", "dialysis-access-salvage"), I("Central venous stenosis", "central-venous-stenosis"), I("Visceral vascular interventions", "visceral-aneurysm-embolisation")] },
    ],
  },
  {
    slug: "neurointerventional", title: "Neurointerventional Radiology", kicker: "Brain · Neck · Spine",
    intro: "Endovascular treatment of cerebrovascular and spinal vascular disease, delivered in an appropriately equipped hospital neuro-angiography suite in coordination with neurology, neurosurgery and critical-care teams.",
    groups: [
      { title: "Aneurysms", items: [I("Cerebral aneurysm coiling", "aneurysm-coiling"), I("Flow diverter placement", "flow-diverter"), I("Stent-assisted and balloon-assisted coiling", "stent-assisted-coiling")] },
      { title: "Stroke & carotid", items: [I("Mechanical thrombectomy for stroke", "stroke-thrombectomy"), I("Carotid artery stenting", "carotid-stenting")] },
      { title: "Vascular malformations & tumours", items: [I("AVM embolisation", "avm-embolisation"), I("Dural AV fistula embolisation", "dural-avf-embolisation"), I("Spinal vascular malformation embolisation", "spinal-vm-embolisation"), I("Tumour embolisation", "tumour-embolisation")] },
      { title: "Diagnostics", items: [I("Cerebral and spinal angiography", undefined, "Diagnostic catheter angiography")] },
    ],
    note: "Stroke is an emergency. For sudden face drooping, arm weakness or speech difficulty, call emergency services immediately — do not wait for a clinic appointment.",
  },
  {
    slug: "hepatobiliary", title: "Hepatobiliary Interventions", kicker: "Liver · Bile ducts · Portal system",
    intro: "Image-guided therapies for liver tumours, portal hypertension and biliary obstruction, planned with hepatology, oncology and hepatobiliary surgery colleagues through tumour-board discussion where relevant.",
    groups: [
      { title: "Liver tumour therapies", items: [I("TACE", "tace"), I("DEB-TACE", "deb-tace"), I("TARE, where available", "tare"), I("Tumour embolisation", "tumour-embolisation"), I("RFA and MWA", "rfa-ablation"), I("Cryoablation", "cryo-ablation"), I("Liver biopsy", "image-guided-biopsy")] },
      { title: "Biliary", items: [I("PTBD", "ptbd-biliary-stenting"), I("Internal-external biliary drainage", "ptbd-biliary-stenting"), I("Biliary stenting", "ptbd-biliary-stenting"), I("Biliary stricture management", "ptbd-biliary-stenting")] },
      { title: "Portal & visceral", items: [I("Portal vein interventions", "portal-vein-embolisation"), I("TIPS, where offered", "tips"), I("Visceral embolisation", "gi-bleed-embolisation")] },
    ],
  },
  {
    slug: "office-based", title: "Office-Based Interventional Radiology", kicker: "Pain · Biopsy · Drainage",
    intro: "Selected low-risk image-guided procedures can be performed on an outpatient basis, with same-day discharge for appropriate patients.",
    groups: [
      { title: "Pain interventions", items: [I("Epidural steroid injections"), I("Transforaminal nerve root blocks", "nerve-root-block"), I("Facet joint injections", "facet-joint-injection"), I("Medial branch blocks", "facet-joint-injection"), I("Sacroiliac joint injections"), I("Peripheral nerve blocks"), I("Ultrasound-guided musculoskeletal injections"), I("Trigger point injections"), I("Selected joint and periarticular injections")] },
      { title: "Image-guided biopsies", items: [I("Ultrasound-guided biopsies", "image-guided-biopsy"), I("CT-guided biopsies", "image-guided-biopsy"), I("Thyroid and lymph node biopsies"), I("Breast biopsies, where offered"), I("Liver biopsies", "image-guided-biopsy"), I("Renal biopsies"), I("Lung and pleural biopsies"), I("Soft tissue and musculoskeletal biopsies"), I("Abdominal and pelvic mass biopsies"), I("FNAC and core needle biopsy")] },
      { title: "Image-guided drainage", items: [I("Abdominal and pelvic collections", "image-guided-drainage"), I("Perihepatic collections", "image-guided-drainage"), I("Postoperative collections"), I("Pleural collections"), I("Selected superficial and deep collections"), I("Ascitic drainage"), I("Seroma drainage"), I("Pigtail catheter placement", "image-guided-drainage")] },
    ],
    note: "Outpatient or office-based treatment is offered only when clinically appropriate and when imaging, monitoring, infection control, emergency preparedness and supporting facilities are adequate. Higher-risk procedures are performed in an appropriately equipped hospital setting.",
  },
  {
    slug: "complex-interventions", title: "Complex Oncological & Non-Vascular Interventions", kicker: "Oncology · Urology · Spine · Embolisation",
    intro: "Advanced image-guided procedures for cancer care, organ drainage, spinal fractures and haemorrhage control. Services are displayed only where offered and supported by appropriate facilities; suitability is always individually assessed.",
    groups: [
      { title: "Oncology", items: [I("Image-guided biopsies", "image-guided-biopsy"), I("Tumour ablation", "mwa-ablation"), I("Tumour embolisation", "tumour-embolisation")] },
      { title: "Drainage & access", items: [I("Abscess drainage", "image-guided-drainage"), I("Nephrostomy", "nephrostomy"), I("Gastrostomy", "gastrostomy"), I("Selected biliary and urinary interventions", "ptbd-biliary-stenting")] },
      { title: "Spine", items: [I("Vertebroplasty", "vertebroplasty"), I("Kyphoplasty", "kyphoplasty")] },
      { title: "Embolisation", items: [I("Uterine artery embolisation", "uterine-artery-embolisation"), I("Prostatic artery embolisation", "prostatic-artery-embolisation"), I("Bronchial artery embolisation", "bronchial-artery-embolisation"), I("GI bleeding embolisation", "gi-bleed-embolisation"), I("Visceral artery aneurysm embolisation", "visceral-aneurysm-embolisation"), I("Trauma-related arterial embolisation", "trauma-embolisation")] },
    ],
  },
];

export const CONDITIONS: { slug: string; title: string; what: string; symptoms: string[]; options: string[]; procedures: string[] }[] = [
  { slug: "peripheral-arterial-disease", title: "Peripheral Arterial Disease & CLTI", what: "Narrowing or blockage of leg arteries, usually from atherosclerosis. Severe forms (CLTI) threaten tissue and the limb.", symptoms: ["Calf pain on walking that settles with rest", "Rest pain in the foot, worse at night", "Non-healing foot wounds, colour change"], options: ["Risk-factor control, exercise, medication", "Angioplasty/stenting", "Surgical bypass"], procedures: ["pad-angioplasty-stenting", "cto-recanalisation", "clti-limb-salvage", "below-knee-angioplasty"] },
  { slug: "aortic-aneurysm", title: "Abdominal Aortic Aneurysm", what: "A weakened, enlarged section of the aorta that may grow and, if large, rupture.", symptoms: ["Often no symptoms — found on scans", "Back or abdominal pain (seek urgent care)"], options: ["Surveillance for small aneurysms", "EVAR", "Open surgical repair"], procedures: ["evar", "fevar-concept"] },
  { slug: "deep-vein-thrombosis", title: "Deep Vein Thrombosis & Venous Obstruction", what: "Clots or chronic blockage in deep veins of the leg, pelvis or abdomen.", symptoms: ["Leg swelling, pain, heaviness", "Skin discolouration or ulcers in chronic disease", "Sudden breathlessness — emergency"], options: ["Anticoagulation and compression", "Catheter-based thrombectomy (selected)", "Venous stenting for obstruction"], procedures: ["dvt-thrombectomy", "iliocaval-reconstruction", "may-thurner-stenting", "ivc-filter"] },
  { slug: "varicose-veins", title: "Varicose Veins", what: "Enlarged surface veins caused by leaking vein valves.", symptoms: ["Visible bulging veins", "Aching, heaviness, itching", "Skin changes near the ankle"], options: ["Compression", "Endovenous ablation", "Sclerotherapy or surgery"], procedures: ["varicose-vein-ablation"] },
  { slug: "stroke-and-brain-aneurysm", title: "Stroke & Brain Aneurysm", what: "Stroke from a blocked brain artery, and aneurysms that may bleed.", symptoms: ["Sudden face droop, arm weakness, speech difficulty — call emergency services", "Sudden severe headache"], options: ["Thrombectomy / thrombolysis for eligible strokes", "Coiling, flow diversion or surgery for aneurysms"], procedures: ["stroke-thrombectomy", "aneurysm-coiling", "flow-diverter", "carotid-stenting"] },
  { slug: "liver-cancer", title: "Liver Tumours", what: "Primary liver cancer (HCC) or spread from other cancers.", symptoms: ["Often found on surveillance scans", "Abdominal discomfort, weight loss"], options: ["Surgery or transplant", "Ablation, TACE, TARE", "Systemic therapy, radiotherapy"], procedures: ["tace", "deb-tace", "tare", "mwa-ablation", "rfa-ablation"] },
  { slug: "uterine-fibroids", title: "Uterine Fibroids", what: "Non-cancerous growths of the womb muscle.", symptoms: ["Heavy menstrual bleeding", "Pelvic pressure, frequent urination"], options: ["Medication", "UAE", "Myomectomy or hysterectomy"], procedures: ["uterine-artery-embolisation"] },
  { slug: "enlarged-prostate", title: "Enlarged Prostate (BPH)", what: "Benign growth of the prostate causing urinary symptoms.", symptoms: ["Weak stream, frequency, waking at night to pass urine"], options: ["Medication", "PAE", "TURP or other surgery"], procedures: ["prostatic-artery-embolisation"] },
  { slug: "spinal-fracture-and-pain", title: "Spinal Fractures & Spine Pain", what: "Painful vertebral compression fractures and nerve-related spine pain.", symptoms: ["Sudden back pain after minor strain (osteoporosis)", "Pain radiating down the leg"], options: ["Medication, physiotherapy, bracing", "Image-guided injections", "Vertebroplasty/kyphoplasty"], procedures: ["vertebroplasty", "kyphoplasty", "nerve-root-block", "facet-joint-injection"] },
  { slug: "kidney-and-bile-blockage", title: "Blocked Kidney or Bile Ducts", what: "Obstruction of urine or bile drainage by stones, strictures or tumours.", symptoms: ["Jaundice, itching, fever", "Flank pain, reduced urine"], options: ["Endoscopic stenting", "Percutaneous drainage and stenting", "Surgery"], procedures: ["nephrostomy", "ptbd-biliary-stenting"] },
];

export const AREAS = ["Peripheral arterial disease", "Limb salvage / CLTI", "Aortic aneurysm", "DVT / venous", "Varicose veins", "Dialysis access", "Stroke / neurovascular", "Liver tumour", "Biliary", "Fibroids (UAE)", "Prostate (PAE)", "Pain intervention", "Biopsy / drainage", "Other / not sure"];
