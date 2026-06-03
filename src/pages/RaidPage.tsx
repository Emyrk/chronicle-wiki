import { Link, useParams } from "react-router-dom";
import { resolveServerContext } from "@/data/servers";
import { buildInstanceOverview, getRaidInstance, instanceAnchorId } from "@/data/instances";
import { resolveGuide } from "@/data/guides";
import { NotFoundPage } from "./NotFoundPage";

export function RaidPage() {
  const { serverSlug, instanceSlug } = useParams();
  const context = resolveServerContext(serverSlug);
  const instance = getRaidInstance(instanceSlug ?? "molten-core");
  if (!context || !instance) return <NotFoundPage />;

  const overview = buildInstanceOverview(instance);

  return (
    <div className="space-y-6">
      <div className="wiki-card p-6">
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">{context.server.name} · Raid overview</p>
        <h1 className="mt-2 text-5xl font-bold text-white">{instance.title}</h1>
        <p className="mt-3 max-w-3xl text-zinc-300">{instance.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="wiki-pill">{context.flavor.name}</span>
          <span className="wiki-pill">{instance.encounters.length} encounters</span>
          <span className="wiki-pill">{statusLabel(instance.status)}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
        <aside className="wiki-card p-4 lg:sticky lg:top-24">
          <h2 className="text-xl font-bold text-white">Contents</h2>
          <nav aria-label={`${instance.title} contents`} className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
            {overview.tableOfContents.map((entry) => (
              <a
                key={entry.href}
                href={entry.href}
                className={entry.depth === 1
                  ? "block shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10 hover:text-white"
                  : "block shrink-0 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/10 hover:text-white lg:ml-3"}
              >
                {entry.label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="space-y-6">
          {instance.overviewSections.map((section) => (
            <section key={section.id} id={section.id} className="wiki-card prose-wiki scroll-mt-24 p-6">
              <h2>{section.title}</h2>
              {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}

          <section className="space-y-4" aria-labelledby="instance-encounter-list">
            <h2 id="instance-encounter-list" className="sr-only">Encounter list</h2>
            {instance.encounters.map((encounter) => {
              const guide = resolveGuide(context.server.slug, `raids/${instance.slug}/${encounter.slug}`);
              return (
                <article key={encounter.slug} id={instanceAnchorId(encounter.slug)} className="wiki-card scroll-mt-24 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{encounter.role ?? "Encounter"}</p>
                      <h3 className="mt-1 text-3xl font-bold text-white">{encounter.name}</h3>
                    </div>
                    <span className="wiki-pill">{statusLabel(encounter.status)}</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{guide?.summary ?? encounter.summary}</p>
                  {guide ? (
                    <Link to={`/${context.server.slug}/raids/${instance.slug}/${encounter.slug}`} className="mt-4 inline-flex text-sm font-semibold text-primary underline">
                      Open {encounter.name} guide
                    </Link>
                  ) : null}
                </article>
              );
            })}
          </section>
        </main>
      </div>
    </div>
  );
}

function statusLabel(status: "available" | "guide-pending" | "planned") {
  if (status === "available") return "Available";
  return "Coming soon";
}
