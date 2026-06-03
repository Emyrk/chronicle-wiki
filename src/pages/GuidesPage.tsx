import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BookOpen, Search } from "lucide-react";
import { guideSections, searchGuideEntries, type GuideIndexEntry } from "@/data/guideIndex";
import { resolveServerContext } from "@/data/servers";
import { NotFoundPage } from "./NotFoundPage";

export function GuidesPage() {
  const { serverSlug } = useParams();
  const context = resolveServerContext(serverSlug);
  const [query, setQuery] = useState("");

  const matchingEntries = useMemo(() => searchGuideEntries(query), [query]);
  if (!context) return <NotFoundPage />;

  const hasQuery = query.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="wiki-card p-4 sm:p-6">
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">{context.server.name}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">Guides</h1>
        <p className="mt-3 max-w-3xl text-zinc-300">
          Raid and dungeon guides organized by instance type. Open available raid guides, browse boss notes, or check back soon for more instance coverage.
        </p>
        <label className="mt-5 flex max-w-xl items-center gap-3 rounded-lg border border-border/60 bg-black/50 px-3 py-2 text-sm text-muted-foreground focus-within:border-primary/70 focus-within:text-white">
          <Search className="h-4 w-4" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search guides, bosses, raids, dungeons..."
            className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>

      {hasQuery ? (
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">Search results</h2>
          {matchingEntries.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {matchingEntries.map((entry) => (
                <GuideCard key={`${entry.sectionSlug}/${entry.slug}`} serverSlug={context.server.slug} entry={entry} section={entry.section} />
              ))}
            </div>
          ) : (
            <div className="wiki-card p-5 text-sm text-muted-foreground">No guide matches yet. Try a raid, boss, dungeon, or server keyword.</div>
          )}
        </section>
      ) : (
        guideSections.map((section) => (
          <section key={section.slug} className="space-y-3">
            <div>
              <h2 className="text-3xl font-bold text-white">{section.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
            </div>
            {section.entries.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {section.entries.map((entry) => (
                  <GuideCard key={entry.slug} serverSlug={context.server.slug} entry={entry} section={section.title} />
                ))}
              </div>
            ) : (
              <div className="wiki-card p-5 text-sm text-muted-foreground">Coming soon. No {section.slug === "dungeons" ? "dungeon" : section.title.toLowerCase()} guides are available yet.</div>
            )}
          </section>
        ))
      )}
    </div>
  );
}

export function guideCardBackgroundStyle(entry: Pick<GuideIndexEntry, "backgroundImageUrl">): CSSProperties | undefined {
  return entry.backgroundImageUrl ? { backgroundImage: `url(${entry.backgroundImageUrl})` } : undefined;
}

function GuideCard({ serverSlug, entry, section }: { serverSlug: string; entry: GuideIndexEntry; section: string }) {
  const backgroundStyle = guideCardBackgroundStyle(entry);
  const hasBackground = Boolean(backgroundStyle);

  return (
    <Link
      to={entry.href(serverSlug)}
      className="wiki-card group relative min-h-52 overflow-hidden p-5 transition hover:border-primary/50 hover:bg-black/70"
      style={backgroundStyle}
    >
      {hasBackground ? (
        <>
          <div className="absolute inset-0 bg-cover bg-center transition duration-300 group-hover:scale-105" style={backgroundStyle} aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/75 to-black/35" aria-hidden="true" />
        </>
      ) : (
        <BookOpen className="mb-4 h-8 w-8 text-primary" />
      )}
      <div className={hasBackground ? "relative z-10 flex h-full min-h-42 flex-col justify-end" : undefined}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{section}</p>
            <h3 className="mt-1 text-2xl font-bold text-white">{entry.title}</h3>
          </div>
          <span className="wiki-pill">{guideStatusLabel(entry.status)}</span>
        </div>
        <p className="mt-3 text-sm text-zinc-200">{entry.description}</p>
      </div>
    </Link>
  );
}

function guideStatusLabel(status: GuideIndexEntry["status"]) {
  if (status === "available") return "Open guide";
  return "Coming soon";
}
