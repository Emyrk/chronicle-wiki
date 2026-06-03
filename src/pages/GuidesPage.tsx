import { Link, useParams } from "react-router-dom";
import { BookOpen, Search } from "lucide-react";
import { guideSections, searchGuideEntries } from "@/data/guideIndex";
import { resolveServerContext } from "@/data/servers";
import { useMemo, useState } from "react";
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
      <div className="wiki-card p-6">
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">{context.server.name}</p>
        <h1 className="mt-2 font-serif text-5xl font-bold text-white">Guides</h1>
        <p className="mt-3 max-w-3xl text-zinc-300">
          Raid and dungeon guides organized by instance type. Molten Core is the first raid guide; dungeons get their own lane instead of being buried under vague navigation.
        </p>
        <label className="mt-5 flex max-w-xl items-center gap-3 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-muted-foreground focus-within:border-primary/70 focus-within:text-white">
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
          <h2 className="font-serif text-2xl font-bold text-white">Search results</h2>
          {matchingEntries.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {matchingEntries.map((entry) => (
                <GuideCard key={`${entry.sectionSlug}/${entry.slug}`} serverSlug={context.server.slug} entry={entry} section={entry.section} />
              ))}
            </div>
          ) : (
            <div className="wiki-card p-5 text-sm text-muted-foreground">No guide matches yet. If Chronicle has logs for it, this is where the AI eventually stops pretending and starts citing.</div>
          )}
        </section>
      ) : (
        guideSections.map((section) => (
          <section key={section.slug} className="space-y-3">
            <div>
              <h2 className="font-serif text-3xl font-bold text-white">{section.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
            </div>
            {section.entries.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {section.entries.map((entry) => (
                  <GuideCard key={entry.slug} serverSlug={context.server.slug} entry={entry} section={section.title} />
                ))}
              </div>
            ) : (
              <div className="wiki-card p-5 text-sm text-muted-foreground">No {section.title.toLowerCase()} published yet.</div>
            )}
          </section>
        ))
      )}
    </div>
  );
}

function GuideCard({ serverSlug, entry, section }: { serverSlug: string; entry: { title: string; description: string; status: string; href: (serverSlug: string) => string }; section: string }) {
  return (
    <Link to={entry.href(serverSlug)} className="wiki-card p-5 transition hover:-translate-y-1 hover:border-primary/60">
      <BookOpen className="mb-4 h-8 w-8 text-primary" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{section}</p>
          <h3 className="mt-1 font-serif text-2xl font-bold text-white">{entry.title}</h3>
        </div>
        <span className="wiki-pill">{entry.status}</span>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{entry.description}</p>
    </Link>
  );
}
