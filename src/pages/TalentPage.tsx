import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { classFromSlug, classIdFromSlug, classListForClassIds } from "@/data/talents";
import { resolveServerContext } from "@/data/servers";
import { fetchTalentTrees } from "@/api/chronicle";
import { TalentTreeViewer } from "@/components/TalentTreeViewer";
import { NotFoundPage } from "./NotFoundPage";
import { cn } from "@/lib/utils";
import { iconUrl } from "@/lib/icons";

export function TalentDataState({ children, hasTalentData, isError, isLoading }: { children?: ReactNode; hasTalentData: boolean; isError: boolean; isLoading: boolean }) {
  if (isLoading) return <div className="wiki-card p-5 text-muted-foreground">Loading talent data…</div>;
  if (isError) return <div className="wiki-card p-5 text-muted-foreground">Unable to load talent data</div>;
  if (!hasTalentData) return <div className="wiki-card p-5 text-muted-foreground">No talent build available</div>;
  return children;
}

export function TalentPage() {
  const { serverSlug, classSlug } = useParams();
  const context = resolveServerContext(serverSlug);
  if (!context) return <NotFoundPage />;
  const availableClasses = classListForClassIds(context.talents.classIds);
  const requestedClass = classFromSlug(classSlug);
  if (classSlug && (!requestedClass || !context.talents.classIds.includes(requestedClass.id))) return <NotFoundPage />;

  const selectedClassId = classIdFromSlug(classSlug, context.talents.classIds);
  const { data, isError, isLoading } = useQuery({
    queryKey: ["talents", context.server.slug],
    queryFn: () => fetchTalentTrees(context),
  });
  const talentTreeData = data?.data;
  const selected = talentTreeData?.classes[String(selectedClassId)] ?? Object.values(talentTreeData?.classes ?? {})[0];

  return (
    <div className="space-y-6">
      <div className="wiki-card p-5">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">{context.server.name}</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">Talent calculator</h1>
          <p className="mt-2 max-w-3xl text-zinc-300">Plan, compare, and share class builds for {context.server.name}.</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {availableClasses.map((cls) => (
            <Link
              key={cls.id}
              to={`/${context.server.slug}/talents/${cls.slug}`}
              className={cn("inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition", cls.id === selectedClassId ? "border-primary/70 bg-primary/15 text-white" : "border-border/60 bg-black/40 text-muted-foreground hover:border-primary/50 hover:text-white")}
            >
              <img src={iconUrl(cls.iconTexture, context)} alt="" className="h-6 w-6 rounded border border-border/60 object-cover" />
              <span>{cls.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <TalentDataState isLoading={isLoading} isError={isError} hasTalentData={Boolean(talentTreeData)}>
        {selected ? <TalentTreeViewer data={selected} context={context} /> : <div className="wiki-card p-5 text-muted-foreground">No talent data for this class yet.</div>}
      </TalentDataState>
    </div>
  );
}
