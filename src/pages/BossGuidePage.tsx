import { Link, useParams } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { resolveServerContext } from "@/data/servers";
import { resolveGuide } from "@/data/guides";
import { UnitExplorer } from "@/components/UnitExplorer";
import { NotFoundPage } from "./NotFoundPage";

export function BossGuidePage() {
  const { serverSlug, bossSlug } = useParams();
  const context = resolveServerContext(serverSlug);
  if (!context || !bossSlug) return <NotFoundPage />;
  const guide = resolveGuide(context.server.slug, `raids/molten-core/${bossSlug}`);
  if (!guide) return <NotFoundPage />;

  return (
    <article className="space-y-6">
      <div className="wiki-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">{context.server.name} · {guide.raid}</p>
            <h1 className="mt-2 font-serif text-5xl font-bold text-white">{guide.title}</h1>
            <p className="mt-3 max-w-4xl text-lg text-zinc-300">{guide.summary}</p>
          </div>
          <a href={`${context.server.chronicleBaseUrl}/wowdb/creatures`} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-muted-foreground hover:text-white">
            Chronicle WoWDB <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="wiki-pill">Source: {guide.sourceLabel}</span>
          <span className="wiki-pill">{context.flavor.name}</span>
          <span className="wiki-pill">{guide.creatures.length} units</span>
          <span className="wiki-pill">{guide.spellIds.length} tracked spells</span>
        </div>
      </div>

      {guide.callouts?.map((callout) => (
        <div key={callout.title} className={callout.tone === "warning" ? "rounded-xl border border-amber-400/30 bg-amber-400/10 p-4" : "rounded-xl border border-sky-400/30 bg-sky-400/10 p-4"}>
          <h2 className="font-semibold text-white">{callout.title}</h2>
          <p className="mt-1 text-sm text-zinc-200">{callout.body}</p>
        </div>
      ))}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="wiki-card prose-wiki p-6">
          {guide.sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}
        </div>
        <aside className="space-y-4">
          <div className="wiki-card p-5">
            <h2 className="font-serif text-2xl font-bold text-white">Evidence hooks</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Next API slice: recent wipes/clears and log-derived spell casts for this boss from {context.server.shortName} Chronicle.
            </p>
          </div>
          <div className="wiki-card p-5">
            <h2 className="font-serif text-2xl font-bold text-white">Guide inheritance</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Route chooses server. Server chooses live Chronicle API. Server maps to flavor. Flavor patches Legacy content.
            </p>
          </div>
        </aside>
      </div>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-3xl font-bold text-white">Units and spells cast</h2>
            <p className="text-sm text-muted-foreground">Basic explorer for the spell lists you can pull from current logs.</p>
          </div>
          <Link to={`/${context.server.slug}/explorer`} className="text-sm text-amber-300 underline">Open full explorer</Link>
        </div>
        <UnitExplorer creatures={guide.creatures} />
      </section>
    </article>
  );
}
