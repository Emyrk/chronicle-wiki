import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { classIdFromSlug, classList } from "@/data/talents";
import { flavors, resolveServerContext, serverList } from "@/data/servers";
import { fetchTalentTrees } from "@/api/chronicle";
import { TalentTreeViewer } from "@/components/TalentTreeViewer";
import { NotFoundPage } from "./NotFoundPage";
import { cn } from "@/lib/utils";

export function TalentPage() {
  const { serverSlug, classSlug } = useParams();
  const navigate = useNavigate();
  const context = resolveServerContext(serverSlug);
  if (!context) return <NotFoundPage />;
  const selectedClassId = classIdFromSlug(classSlug);
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["talents", context.server.slug],
    queryFn: () => fetchTalentTrees(context),
  });
  const selected = data?.data.classes[String(selectedClassId)] ?? Object.values(data?.data.classes ?? {})[0];

  return (
    <div className="space-y-6">
      <div className="wiki-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">{context.server.name}</p>
            <h1 className="mt-2 font-serif text-4xl font-bold text-white">Talent calculator</h1>
            <p className="mt-2 max-w-3xl text-zinc-300">
              Loads talent trees from {context.server.chronicleBaseUrl}. If the API is unavailable, this builder falls back to local Warrior/Mage fixtures so the UI stays testable.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
            <p className="mb-2 font-semibold text-white">Builder data controls</p>
            <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground" htmlFor="talent-format">Format</label>
            <select id="talent-format" className="mt-1 w-full rounded border border-white/10 bg-zinc-950 px-2 py-1 text-white" value="chronicle-api-json" disabled>
              <option value="chronicle-api-json">Chronicle API JSON</option>
            </select>
            <label className="mt-3 block text-xs uppercase tracking-[0.18em] text-muted-foreground" htmlFor="talent-flavor">Server / flavor</label>
            <select
              id="talent-flavor"
              className="mt-1 w-full rounded border border-white/10 bg-zinc-950 px-2 py-1 text-white"
              value={context.server.slug}
              onChange={(event) => navigate(`/${event.target.value}/talents/${classSlug ?? "mage"}`)}
            >
              {serverList.map((server) => (
                <option key={server.slug} value={server.slug}>{server.name} — {flavors[server.flavor]?.name ?? server.flavor}</option>
              ))}
            </select>
            <button
              type="button"
              className="mt-3 w-full rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-white hover:bg-primary/20 disabled:opacity-50"
              disabled={isFetching}
              onClick={() => void refetch()}
            >
              {isFetching ? "Reparsing current source…" : "Reparse current source"}
            </button>
            <p className="mt-2 max-w-xs text-xs text-muted-foreground">
              Static/git-driven for now: no DB admin panel. Reparse refetches the selected server API and preserves the regression contract.
            </p>
          </div>
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
