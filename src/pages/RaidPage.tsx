import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { resolveServerContext } from "@/data/servers";
import { getRaidInstance } from "@/data/instances";
import { resolveGuide } from "@/data/guides";
import { formatSuccessRate, moltenCoreBossSuccessRate } from "@/data/bossSuccessRates";
import { fetchRecentRaidLogs, type RecentRaidLog } from "@/api/chronicle";
import type { ResolvedServerContext, SpellRef } from "@/types";
import { NotFoundPage } from "./NotFoundPage";

export function RaidPage() {
  const { serverSlug, instanceSlug } = useParams();
  const [searchParams] = useSearchParams();
  const context = resolveServerContext(serverSlug);
  const instance = getRaidInstance(instanceSlug ?? "molten-core");
  if (!context || !instance) return <NotFoundPage />;

  const bossParam = searchParams.get("boss");
  const selectedEncounter = instance.encounters.find((encounter) => encounter.slug === bossParam) ?? instance.encounters[0];
  const selectedGuide = selectedEncounter ? resolveGuide(context.server.slug, `raids/${instance.slug}/${selectedEncounter.slug}`) : undefined;
  const selectedSuccessRate = selectedEncounter ? moltenCoreBossSuccessRate(context.server.slug, selectedEncounter.slug) : undefined;
  const mechanics = selectedGuide ? mechanicsForGuide(selectedGuide.creatures) : [];
  const tableOfContents = [
    ...instance.overviewSections.map((section) => ({ label: section.title, href: `#${section.id}`, depth: 1 as const })),
    { label: "Bosses", href: "#bosses", depth: 1 as const },
  ];

  return (
    <div className="space-y-6">
      <div className="wiki-card p-4 sm:p-6">
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">{context.server.name} · Raid overview</p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-5xl">{instance.title}</h1>
        <p className="mt-3 max-w-3xl text-zinc-300">{instance.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="wiki-pill">{context.flavor.name}</span>
          <span className="wiki-pill">{instance.encounters.length} encounters</span>
          <span className="wiki-pill">{statusLabel(instance.status)}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
        <aside className="wiki-card max-w-full overflow-hidden p-4 lg:sticky lg:top-24">
          <h2 className="text-xl font-bold text-white">Contents</h2>
          <nav aria-label={`${instance.title} contents`} className="mt-3 flex snap-x gap-2 overflow-x-auto overscroll-x-contain pb-1 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
            {tableOfContents.map((entry) => (
              <a
                key={entry.href}
                href={entry.href}
                className={entry.depth === 1
                  ? "block shrink-0 snap-start rounded-lg px-3 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10 hover:text-white"
                  : "block shrink-0 snap-start rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/10 hover:text-white lg:ml-3"}
              >
                {entry.label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="space-y-6">
          {instance.overviewSections.map((section) => (
            <section key={section.id} id={section.id} className="wiki-card prose-wiki scroll-mt-24 p-4 sm:p-6">
              <h2>{section.title}</h2>
              {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}

          <RecentRaidsSection context={context} instanceTitle={instance.title} />

          <section id="bosses" className="wiki-card scroll-mt-24 p-4 sm:p-6" aria-labelledby="instance-boss-tabs">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Boss guides</p>
                <h2 id="instance-boss-tabs" className="text-3xl font-bold text-white">Molten Core bosses</h2>
              </div>
              <span className="wiki-pill">{instance.encounters.length} bosses</span>
            </div>

            <div role="tablist" aria-label="Molten Core boss guides" className="mt-5 flex snap-x gap-2 overflow-x-auto overscroll-x-contain pb-2">
              {instance.encounters.map((encounter) => {
                const selected = encounter.slug === selectedEncounter?.slug;
                return (
                  <Link
                    key={encounter.slug}
                    role="tab"
                    aria-selected={selected}
                    aria-controls="active-boss-guide"
                    to={`/${context.server.slug}/raids/${instance.slug}?boss=${encounter.slug}`}
                    className={selected
                      ? "shrink-0 snap-start rounded-full border border-primary/70 bg-primary/20 px-3 py-2 text-sm font-semibold text-white"
                      : "shrink-0 snap-start rounded-full border border-border/70 bg-black/30 px-3 py-2 text-sm font-semibold text-zinc-300 hover:border-primary/60 hover:text-white"}
                  >
                    {encounter.name}
                  </Link>
                );
              })}
            </div>

            {selectedEncounter && selectedGuide ? (
              <article id="active-boss-guide" role="tabpanel" className="mt-5 rounded-2xl border border-border/70 bg-black/25 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{selectedEncounter.role ?? "Boss"}</p>
                    <h3 className="mt-1 text-3xl font-bold text-white">{selectedGuide.title}</h3>
                  </div>
                  <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">Success rate</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-100">{formatSuccessRate(selectedSuccessRate)}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <h4 className="text-lg font-semibold text-white">Mechanics</h4>
                  <ul className="mt-3 grid gap-3">
                    {mechanics.map((mechanic) => (
                      <li key={`${mechanic.id}-${mechanic.name}`} className="rounded-xl border border-border/60 bg-black/30 p-3">
                        <SpellMechanicLink spell={mechanic} chronicleBaseUrl={context.chronicle.baseUrl} />
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ) : null}
          </section>
        </main>
      </div>
    </div>
  );
}

function RecentRaidsSection({ context, instanceTitle }: { context: ResolvedServerContext; instanceTitle: string }) {
  const { raids, status } = useRecentRaidLogs(context, instanceTitle);

  return (
    <section id="recent-raids" className="wiki-card scroll-mt-24 p-4 sm:p-6" aria-labelledby="recent-raids-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{context.server.shortName} raid history</p>
          <h2 id="recent-raids-title" className="text-3xl font-bold text-white">Recent raids</h2>
        </div>
        <span className="wiki-pill">Latest 5</span>
      </div>
      <p className="mt-3 max-w-3xl text-sm text-zinc-300">
        Recent {instanceTitle} runs from {context.server.shortName} Chronicle, useful for checking current clears, wipes, and roster context before raid night.
      </p>
      <RecentRaidState status={status} raids={raids} chronicleBaseUrl={context.chronicle.baseUrl} />
    </section>
  );
}

export function RecentRaidState({ status, raids, chronicleBaseUrl }: { status: RecentRaidStatus; raids: RecentRaidLog[]; chronicleBaseUrl: string }) {
  if (status === "loading") {
    return <p className="mt-4 rounded-xl border border-border/70 bg-black/25 p-4 text-sm text-zinc-300">Loading recent raid cards…</p>;
  }

  if (status === "error") {
    return <p className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm text-amber-100">Recent raid cards are unavailable right now. Try again soon.</p>;
  }

  if (raids.length === 0) {
    return <p className="mt-4 rounded-xl border border-border/70 bg-black/25 p-4 text-sm text-zinc-300">No recent raid cards found for this instance yet.</p>;
  }

  return <RecentRaidCards raids={raids} chronicleBaseUrl={chronicleBaseUrl} />;
}

export function RecentRaidCards({ raids, chronicleBaseUrl }: { raids: RecentRaidLog[]; chronicleBaseUrl: string }) {
  return (
    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {raids.map((raid) => (
        <a
          key={raid.id}
          data-raid-card="recent"
          href={`${chronicleBaseUrl}/raids/${raid.slug}`}
          className="rounded-2xl border border-border/70 bg-black/30 p-4 text-zinc-200 transition hover:border-primary/60 hover:bg-primary/10 hover:text-white"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{raid.realmName}</p>
              <h3 className="mt-1 text-xl font-bold text-white">{raid.name}</h3>
            </div>
            <span className="wiki-pill">{raid.bossKills}/{raid.bossCount} bosses</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <RaidCardStat label="Players" value={`${raid.playerCount} players`} />
            <RaidCardStat label="Duration" value={formatDuration(raid.durationMs)} />
            <RaidCardStat label="Started" value={formatRaidDate(raid.firstEncounterTime)} />
            <RaidCardStat label="Recorder" value={raid.uploaderName} />
          </div>
        </a>
      ))}
    </div>
  );
}

function RaidCardStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-black/25 px-3 py-2">
      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

type RecentRaidStatus = "loading" | "loaded" | "empty" | "error";

function useRecentRaidLogs(context: ResolvedServerContext, instanceTitle: string) {
  const [raids, setRaids] = useState<RecentRaidLog[]>([]);
  const [status, setStatus] = useState<RecentRaidStatus>("loading");

  useEffect(() => {
    let active = true;
    setStatus("loading");
    fetchRecentRaidLogs(context, instanceTitle)
      .then((nextRaids) => {
        if (!active) return;
        setRaids(nextRaids);
        setStatus(nextRaids.length > 0 ? "loaded" : "empty");
      })
      .catch(() => {
        if (!active) return;
        setRaids([]);
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [context.chronicle.baseUrl, instanceTitle]);

  return { raids, status };
}

function formatDuration(durationMs: number) {
  const totalMinutes = Math.max(0, Math.round(durationMs / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function formatRaidDate(value: string) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function mechanicsForGuide(creatures: Array<{ spells: SpellRef[] }>) {
  const seen = new Set<number>();
  return creatures.flatMap((creature) => creature.spells).filter((spell) => {
    if (spell.id <= 0) return false;
    if (seen.has(spell.id)) return false;
    seen.add(spell.id);
    return true;
  });
}

function SpellMechanicLink({ spell, chronicleBaseUrl }: { spell: SpellRef; chronicleBaseUrl: string }) {
  const tooltipId = `spell-tooltip-${spell.id}`;
  return (
    <div className="group relative">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <a
          href={`${chronicleBaseUrl}/wowdb/spell/${spell.id}`}
          aria-describedby={tooltipId}
          className="font-semibold text-primary underline decoration-primary/50 underline-offset-4 hover:text-white"
        >
          {spell.name}
        </a>
        {spell.school ? <span className="wiki-pill">{spell.school}</span> : null}
      </div>
      {spell.notes ? <p className="mt-1 text-sm text-zinc-300">{spell.notes}</p> : null}
      <div id={tooltipId} role="tooltip" className="pointer-events-none absolute left-0 top-full z-20 mt-2 hidden w-72 rounded-xl border border-border/80 bg-zinc-950 p-3 text-sm text-zinc-200 shadow-2xl group-hover:block group-focus-within:block">
        <p className="font-semibold text-white">{spell.name}</p>
        {spell.notes ? <p className="mt-1">{spell.notes}</p> : null}
      </div>
    </div>
  );
}

function statusLabel(status: "available" | "guide-pending" | "planned") {
  if (status === "available") return "Available";
  return "Coming soon";
}
