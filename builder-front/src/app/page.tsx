// import Link from "next/link"; // Supprimé car plus utilisé directement
import NewFlowButton from "@/components/NewFlowButton";
// import FlowItem from "@/components/FlowItem"; // Supprimé car géré par FlowsAccordion
import FlowsAccordion from "@/components/FlowsAccordion"; // Ajout de l'importation de FlowsAccordion

type Flow = { id: string; name: string | null };

export default async function Home() {
  const res = await fetch("http://localhost:3000/api/flows", {
    next: { revalidate: 0 }, // pas de cache pendant le dev
  });
  const flows: Flow[] = await res.json();

  return (
    <main className="p-6 space-y-4 flex flex-col items-center"> {/* Ajout de flex flex-col items-center pour centrer l'accordéon */}
      <div className="flex items-center justify-between w-full max-w-md"> {/* Ajout de w-full max-w-md pour aligner avec l'accordéon */}
        <h1 className="text-2xl font-bold">Mes flows</h1>
        <NewFlowButton />
      </div>

      {/* Utilisation de FlowsAccordion ici */}
      <FlowsAccordion flows={flows} />
      {/* L'ancienne liste ul a été supprimée */}
    </main>
  );
}
