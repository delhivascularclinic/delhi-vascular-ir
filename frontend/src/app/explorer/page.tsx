import type { Metadata } from "next";
import ProcedureExplorer from "@/components/site/ProcedureExplorer";
import { PageHero } from "@/components/site/Blocks";
import { PROCEDURES } from "@/data";

export const metadata: Metadata = { title: "3D Procedure Explorer", description: "Interactive 3D educational animations of vascular, neurointerventional, hepatobiliary, embolisation and non-vascular image-guided procedures." };

export default function ExplorerPage() {
  return (
    <>
      <PageHero kicker="3D Procedure Explorer" title="See each intervention, step by step" intro={`${PROCEDURES.length} interactive procedures. Choose a procedure, then move through normal anatomy, disease, strategy, catheter navigation, intervention and the intended result. Switch between Patient and Doctor mode for the level of detail you need.`} />
      <section className="bg-navy px-3 pb-20 sm:px-5 lg:px-8"><div className="mx-auto max-w-[1600px]"><ProcedureExplorer /></div></section>
    </>
  );
}
