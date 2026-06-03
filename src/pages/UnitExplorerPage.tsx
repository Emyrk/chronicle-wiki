import { useParams } from "react-router-dom";
import { resolveServerContext } from "@/data/servers";
import { resolveGuide } from "@/data/guides";
import { UnitExplorer } from "@/components/UnitExplorer";
import { NotFoundPage } from "./NotFoundPage";

export function UnitExplorerPage() {
  const { serverSlug } = useParams();
  const context = resolveServerContext(serverSlug);
  if (!context) return <NotFoundPage />;
  const garr = resolveGuide(context.server.slug, "raids/molten-core/garr");

  return (
    <div className="space-y-6">
      <div className="wiki-card p-6">
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">{context.server.name}</p>
        <h1 className="mt-2 text-4xl font-bold text-white">Molten Core unit explorer</h1>
        <p className="mt-3 max-w-3xl text-zinc-300">
          Review Garr and Firesworn abilities in one place so raid leaders can check assignments, dispels, and add-control risks quickly.
        </p>
      </div>
      {garr ? <UnitExplorer creatures={garr.creatures} /> : <div className="wiki-card p-5">No unit data yet.</div>}
    </div>
  );
}
