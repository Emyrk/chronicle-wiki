import type { CreatureGuideEntry } from "@/types";

export function UnitExplorer({ creatures }: { creatures: CreatureGuideEntry[] }) {
  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-2">
      {creatures.map((creature) => (
        <article key={creature.id} className="wiki-card p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-2xl font-bold text-white">{creature.name}</h3>
              <p className="text-sm text-muted-foreground">NPC {creature.id} · {creature.role}</p>
            </div>
            <span className="wiki-pill">{creature.spells.length} spells</span>
          </div>
          <p className="mb-4 text-sm text-zinc-300">{creature.notes}</p>
          <div className="space-y-2">
            {creature.spells.map((spell) => (
              <div key={`${creature.id}-${spell.id}-${spell.name}`} className="rounded-lg border border-border/60 bg-black/25 p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <strong className="min-w-0 text-white">{spell.name}</strong>
                  {spell.id > 0 ? <code className="text-xs text-primary">{spell.id}</code> : <span className="text-xs text-muted-foreground">Soon</span>}
                </div>
                {spell.school && <div className="text-xs text-muted-foreground">{spell.school}</div>}
                {spell.notes && <p className="mt-1 text-sm text-zinc-300">{spell.notes}</p>}
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
