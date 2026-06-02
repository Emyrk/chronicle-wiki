import { useMemo, useState } from "react";
import type { ClassTalentData, TalentEntry, TalentTabData } from "@/data/talents";
import { iconUrl } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { ResolvedServerContext } from "@/types";

export type TalentRanks = Record<number, number>;

function TalentButton({ talent, rank, context, onChange }: { talent: TalentEntry; rank: number; context: ResolvedServerContext; onChange: (rank: number) => void }) {
  const maxed = rank >= talent.maxRank;
  return (
    <button
      type="button"
      title={`${talent.name} (${rank}/${talent.maxRank})`}
      onClick={(event) => {
        if (event.shiftKey || event.metaKey) onChange(Math.max(0, rank - 1));
        else onChange(Math.min(talent.maxRank, rank + 1));
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        onChange(Math.max(0, rank - 1));
      }}
      className="group relative h-11 w-11 rounded border border-zinc-600 bg-zinc-950 shadow-lg transition hover:scale-105 hover:border-primary"
    >
      <img src={iconUrl(talent.iconTexture, context)} alt="" className={cn("h-full w-full rounded object-cover", rank === 0 && "grayscale opacity-45")} />
      <span className={cn(
        "absolute -bottom-1 -right-1 rounded px-1 text-[10px] font-bold",
        maxed ? "bg-amber-400 text-black" : rank > 0 ? "bg-green-600 text-white" : "bg-zinc-700 text-zinc-300",
      )}>
        {rank}/{talent.maxRank}
      </span>
      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-56 -translate-x-1/2 rounded-lg border border-white/10 bg-zinc-950 p-2 text-left text-xs shadow-2xl group-hover:block">
        <strong className="block text-white">{talent.name}</strong>
        <span className="text-muted-foreground">Spell ranks: {talent.spellRanks.join(", ")}</span>
      </span>
    </button>
  );
}

function TalentTab({ tab, ranks, context, onRankChange }: { tab: TalentTabData; ranks: TalentRanks; context: ResolvedServerContext; onRankChange: (talent: TalentEntry, rank: number) => void }) {
  const points = useMemo(() => tab.talents.reduce((sum, talent) => sum + (ranks[talent.id] ?? 0), 0), [tab.talents, ranks]);
  return (
    <section className="wiki-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={iconUrl(tab.iconTexture, context)} alt="" className="h-10 w-10 rounded border border-white/10" />
          <div>
            <h3 className="font-serif text-xl font-bold text-white">{tab.name}</h3>
            <p className="text-sm text-muted-foreground">{points} points spent</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 rounded-lg border border-white/5 bg-black/25 p-4">
        {Array.from({ length: 7 }).map((_, tier) =>
          Array.from({ length: 4 }).map((__, col) => {
            const talent = tab.talents.find((candidate) => candidate.tierID === tier && candidate.columnIndex === col);
            return (
              <div key={`${tier}-${col}`} className="flex h-14 items-center justify-center">
                {talent && <TalentButton talent={talent} rank={ranks[talent.id] ?? 0} context={context} onChange={(rank) => onRankChange(talent, rank)} />}
              </div>
            );
          }),
        )}
      </div>
    </section>
  );
}

export function TalentTreeViewer({ data, context }: { data: ClassTalentData; context: ResolvedServerContext }) {
  const [ranks, setRanks] = useState<TalentRanks>({});
  const total = useMemo(() => Object.values(ranks).reduce((sum, rank) => sum + rank, 0), [ranks]);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-3xl font-bold text-white">{data.name} talents</h2>
          <p className="text-sm text-muted-foreground">Click to add a point. Right-click, shift-click, or command-click to remove one.</p>
        </div>
        <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-muted-foreground hover:text-white" onClick={() => setRanks({})}>Reset {total} points</button>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {data.tabs.map((tab) => (
          <TalentTab
            key={tab.id}
            tab={tab}
            ranks={ranks}
            context={context}
            onRankChange={(talent, rank) => setRanks((current) => ({ ...current, [talent.id]: rank }))}
          />
        ))}
      </div>
    </div>
  );
}
