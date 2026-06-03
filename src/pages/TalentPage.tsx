import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { classIdFromSlug, classList } from "@/data/talents";
import { resolveServerContext } from "@/data/servers";
import { fetchTalentTrees } from "@/api/chronicle";
import { TalentTreeViewer } from "@/components/TalentTreeViewer";
import { NotFoundPage } from "./NotFoundPage";
import { cn } from "@/lib/utils";

export function TalentPage() {
  const { serverSlug, classSlug } = useParams();
  const context = resolveServerContext(serverSlug);
  if (!context) return <NotFoundPage />;
  const selectedClassId = classIdFromSlug(classSlug);
  const { data, isLoading } = useQuery({
    queryKey: ["talents", context.server.slug],
    queryFn: () => fetchTalentTrees(context),
  });
  const selected = data?.data.classes[String(selectedClassId)] ?? Object.values(data?.data.classes ?? {})[0];

  return (
    <div className="space-y-6">
      <div className="wiki-card p-5">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">{context.server.name}</p>
          <h1 className="mt-2 font-serif text-4xl font-bold text-white">Talent calculator</h1>
          <p className="mt-2 max-w-3xl text-zinc-300">
            Loads talent trees from {context.server.chronicleBaseUrl}. If the API is unavailable, this builder falls back to local Warrior/Mage fixtures so the UI stays testable.
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {classList.map((cls) => (
            <Link
              key={cls.id}
              to={`/${context.server.slug}/talents/${cls.slug}`}
              className={cn("rounded-lg border px-3 py-2 text-sm", cls.id === selectedClassId ? "border-primary bg-primary/15 text-white" : "border-white/10 bg-white/5 text-muted-foreground hover:text-white")}
            >
              {cls.name}
            </Link>
          ))}
        </div>
      </div>

      {isLoading && <div className="wiki-card p-5 text-muted-foreground">Loading talent data…</div>}
      {data?.source === "fallback" && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
          Using local fixture data because the Chronicle API did not return talent-tree data.
        </div>
      )}
      {selected ? <TalentTreeViewer data={selected} context={context} /> : <div className="wiki-card p-5 text-muted-foreground">No talent data for this class yet.</div>}
    </div>
  );
}
