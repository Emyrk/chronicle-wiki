import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { ClassTalentData, TalentEntry, TalentTabData } from "../data/talents";
import { iconUrl } from "../lib/icons";
import { cn } from "../lib/utils";
import type { ResolvedServerContext } from "../types";

export type TalentRanks = Record<number, number>;

type TalentPrereqArrow = {
  from: TalentEntry;
  to: TalentEntry;
  requiredRank: number;
};

const TALENT_BUTTON_SIZE = 40;
const TALENT_GRID_COLUMNS = 4;
const TALENT_CELL_WIDTH = 40;
const TALENT_CELL_HEIGHT = 48;
const TALENT_GRID_GAP = 8;
const TALENT_ROW_STRIDE = TALENT_CELL_HEIGHT + TALENT_GRID_GAP;
const TALENT_BUILD_PARAM = "build";

const TALENT_GRID_WIDTH = TALENT_GRID_COLUMNS * (TALENT_CELL_WIDTH + TALENT_GRID_GAP);

function talentGridRows(talents: TalentEntry[]) {
  return Math.max(...talents.map((talent) => talent.tierID), 0) + 1;
}

function talentGridHeight(rows: number) {
  return rows * TALENT_ROW_STRIDE;
}

export function prerequisiteArrows(talents: TalentEntry[]): TalentPrereqArrow[] {
  const byId = new Map(talents.map((talent) => [talent.id, talent]));
  return talents.flatMap((talent) =>
    (talent.prereqTalent ?? []).flatMap((prereqId) => {
      const from = byId.get(prereqId);
      if (!from) return [];
      return [{ from, to: talent, requiredRank: from.maxRank }];
    }),
  );
}

export function rowPointRequirement(talent: Pick<TalentEntry, "tierID">) {
  return talent.tierID * 5;
}

function pointsSpentBeforeRow(talents: TalentEntry[], ranks: TalentRanks, tierID: number) {
  return talents.reduce((sum, talent) => {
    if (talent.tierID >= tierID) return sum;
    return sum + (ranks[talent.id] ?? 0);
  }, 0);
}

function prerequisitesMet(talent: TalentEntry, talents: TalentEntry[], ranks: TalentRanks) {
  const byId = new Map(talents.map((candidate) => [candidate.id, candidate]));
  return (talent.prereqTalent ?? []).every((prereqId) => {
    const prereq = byId.get(prereqId);
    if (!prereq) return true;
    return (ranks[prereq.id] ?? 0) >= prereq.maxRank;
  });
}

export function canUseTalent(talent: TalentEntry, talents: TalentEntry[], ranks: TalentRanks) {
  return pointsSpentBeforeRow(talents, ranks, talent.tierID) >= rowPointRequirement(talent) && prerequisitesMet(talent, talents, ranks);
}

function spentTalentsStillValid(talents: TalentEntry[], ranks: TalentRanks) {
  return talents.every((talent) => (ranks[talent.id] ?? 0) === 0 || canUseTalent(talent, talents, ranks));
}

export function totalTalentPoints(ranks: TalentRanks) {
  return Object.values(ranks).reduce((sum, rank) => sum + rank, 0);
}

function cleanRanks(ranks: TalentRanks): TalentRanks {
  return Object.fromEntries(Object.entries(ranks).filter(([, rank]) => rank > 0).map(([id, rank]) => [Number(id), rank]));
}

export function updateTalentRank(
  talent: TalentEntry,
  requestedRank: number,
  talents: TalentEntry[],
  ranks: TalentRanks,
  options: { maxPoints?: number } = {},
): TalentRanks {
  const currentRank = ranks[talent.id] ?? 0;
  const nextRank = Math.max(0, Math.min(talent.maxRank, requestedRank));
  if (nextRank === currentRank) return ranks;
  if (nextRank > currentRank && !canUseTalent(talent, talents, ranks)) return ranks;

  const nextRanks = { ...ranks, [talent.id]: nextRank };
  if (options.maxPoints !== undefined && totalTalentPoints(nextRanks) > options.maxPoints) return ranks;
  if (nextRank < currentRank && !spentTalentsStillValid(talents, nextRanks)) return ranks;
  return nextRanks;
}

function decodeTalentBuildNumber(value: string, radix: number) {
  if (!/^[0-9a-z]+$/i.test(value)) return Number.NaN;
  const number = Number.parseInt(value, radix);
  return Number.isFinite(number) ? number : Number.NaN;
}

export function encodeTalentBuild(ranks: TalentRanks) {
  return Object.entries(ranks)
    .map(([id, rank]) => [Number(id), rank] as const)
    .filter(([id, rank]) => Number.isFinite(id) && rank > 0)
    .sort(([left], [right]) => left - right)
    .map(([id, rank]) => `${id.toString(36)}.${rank.toString(36)}`)
    .join("_");
}

export function decodeTalentBuild(value: string | null | undefined): TalentRanks {
  if (!value) return {};
  const ranks: TalentRanks = {};
  const isLegacyBuild = value.includes(":") || value.includes(",");
  const entries = isLegacyBuild ? value.split(",").map((part) => part.split(":")) : value.split("_").map((part) => part.split("."));

  for (const [idText, rankText] of entries) {
    const id = decodeTalentBuildNumber(idText ?? "", isLegacyBuild ? 10 : 36);
    const rank = decodeTalentBuildNumber(rankText ?? "", isLegacyBuild ? 10 : 36);
    if (Number.isInteger(id) && Number.isInteger(rank) && id > 0 && rank > 0) ranks[id] = rank;
  }
  return ranks;
}

export function normalizeTalentRanks(tabs: TalentEntry[][], rawRanks: TalentRanks, maxPoints = Number.POSITIVE_INFINITY): TalentRanks {
  let ranks: TalentRanks = {};
  for (const talents of tabs) {
    const ordered = [...talents].sort((left, right) => left.tierID - right.tierID || left.columnIndex - right.columnIndex || left.id - right.id);
    for (const talent of ordered) {
      const requested = Math.min(rawRanks[talent.id] ?? 0, talent.maxRank);
      for (let rank = 1; rank <= requested; rank += 1) {
        ranks = updateTalentRank(talent, rank, talents, ranks, { maxPoints });
      }
    }
  }
  return cleanRanks(ranks);
}

export function searchParamsWithTalentBuild(params: URLSearchParams, ranks: TalentRanks) {
  const next = new URLSearchParams(params);
  const build = encodeTalentBuild(ranks);
  if (build) next.set(TALENT_BUILD_PARAM, build);
  else next.delete(TALENT_BUILD_PARAM);
  return next;
}

function talentCenter(talent: Pick<TalentEntry, "tierID" | "columnIndex">) {
  return {
    x: talent.columnIndex * (TALENT_CELL_WIDTH + TALENT_GRID_GAP) + TALENT_BUTTON_SIZE / 2,
    y: talent.tierID * TALENT_ROW_STRIDE + TALENT_BUTTON_SIZE / 2,
  };
}

function TalentPrereqArrows({ arrows, ranks, height }: { arrows: TalentPrereqArrow[]; ranks: TalentRanks; height: number }) {
  if (arrows.length === 0) return null;

  const buttonEdge = TALENT_BUTTON_SIZE / 2;
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-visible"
      viewBox={`0 0 ${TALENT_GRID_WIDTH} ${height}`}
      width={TALENT_GRID_WIDTH}
      height={height}
      preserveAspectRatio="none"
    >
      <defs>
        <marker id="talent-prereq-arrow-active" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L8 4 L0 8 Z" className="fill-amber-300" />
        </marker>
        <marker id="talent-prereq-arrow-inactive" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L8 4 L0 8 Z" className="fill-zinc-600" />
        </marker>
      </defs>
      {arrows.map(({ from, to, requiredRank }) => {
        const fromPoint = talentCenter(from);
        const toPoint = talentCenter(to);
        const active = (ranks[from.id] ?? 0) >= requiredRank;
        const strokeClass = active ? "stroke-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.55)]" : "stroke-zinc-600";
        const marker = active ? "url(#talent-prereq-arrow-active)" : "url(#talent-prereq-arrow-inactive)";
        const startY = fromPoint.y + buttonEdge;
        const endY = toPoint.y - buttonEdge;
        const midY = startY + Math.max(12, (endY - startY) / 2);
        const points = fromPoint.x === toPoint.x
          ? `${fromPoint.x},${startY} ${toPoint.x},${endY}`
          : `${fromPoint.x},${startY} ${fromPoint.x},${midY} ${toPoint.x},${midY} ${toPoint.x},${endY}`;

        return (
          <polyline
            key={`${from.id}-${to.id}`}
            points={points}
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            markerEnd={marker}
            className={cn("transition", strokeClass)}
          />
        );
      })}
    </svg>
  );
}

function TalentButton({ talent, rank, locked, context, onChange }: { talent: TalentEntry; rank: number; locked: boolean; context: ResolvedServerContext; onChange: (rank: number) => void }) {
  const maxed = rank >= talent.maxRank;
  const title = locked
    ? `${talent.name} locked: spend ${rowPointRequirement(talent)} points in this tree and complete prerequisite arrows first`
    : `${talent.name} (${rank}/${talent.maxRank})`;
  return (
    <button
      type="button"
      title={title}
      aria-disabled={locked}
      onClick={(event) => {
        if (event.shiftKey || event.metaKey) onChange(Math.max(0, rank - 1));
        else onChange(Math.min(talent.maxRank, rank + 1));
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        onChange(Math.max(0, rank - 1));
      }}
      className={cn(
        "group relative h-10 w-10 rounded-sm border bg-zinc-950 shadow-lg transition",
        locked ? "cursor-not-allowed border-zinc-800 opacity-45" : "border-zinc-600 hover:scale-105 hover:border-primary",
      )}
    >
      <img src={iconUrl(talent.iconTexture, context)} alt="" className={cn("h-full w-full rounded object-cover", (rank === 0 || locked) && "grayscale opacity-45")} />
      {locked && <span className="absolute inset-0 rounded bg-black/35" />}
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
  const arrows = useMemo(() => prerequisiteArrows(tab.talents), [tab.talents]);
  const rows = useMemo(() => talentGridRows(tab.talents), [tab.talents]);
  const height = talentGridHeight(rows);
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
      <div
        className="relative mx-auto overflow-visible rounded-lg border border-white/5 bg-black/25 p-3"
        style={{ width: `${TALENT_GRID_WIDTH + TALENT_GRID_GAP * 2}px` }}
      >
        <div className="relative" style={{ width: `${TALENT_GRID_WIDTH}px`, height: `${height}px` }}>
          <TalentPrereqArrows arrows={arrows} ranks={ranks} height={height} />
          <div
            className="relative z-10 grid justify-items-center"
            style={{
              width: `${TALENT_GRID_WIDTH}px`,
              gridTemplateColumns: `repeat(${TALENT_GRID_COLUMNS}, ${TALENT_CELL_WIDTH}px)`,
              gridAutoRows: `${TALENT_CELL_HEIGHT}px`,
              gap: `${TALENT_GRID_GAP}px`,
            }}
          >
            {Array.from({ length: rows }).map((_, tier) =>
              Array.from({ length: TALENT_GRID_COLUMNS }).map((__, col) => {
                const talent = tab.talents.find((candidate) => candidate.tierID === tier && candidate.columnIndex === col);
                return (
                  <div key={`${tier}-${col}`} className="flex h-12 w-10 items-start justify-center">
                    {talent && (
                      <TalentButton
                        talent={talent}
                        rank={ranks[talent.id] ?? 0}
                        locked={(ranks[talent.id] ?? 0) === 0 && !canUseTalent(talent, tab.talents, ranks)}
                        context={context}
                        onChange={(rank) => onRankChange(talent, rank)}
                      />
                    )}
                  </div>
                );
              }),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function TalentTreeViewer({ data, context }: { data: ClassTalentData; context: ResolvedServerContext }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabTalentLists = useMemo(() => data.tabs.map((tab) => tab.talents), [data.tabs]);
  const maxPoints = context.flavor.maxTalentPoints;
  const [ranks, setRanks] = useState<TalentRanks>(() => normalizeTalentRanks(tabTalentLists, decodeTalentBuild(searchParams.get(TALENT_BUILD_PARAM)), maxPoints));
  const total = useMemo(() => totalTalentPoints(ranks), [ranks]);

  useEffect(() => {
    setRanks(normalizeTalentRanks(tabTalentLists, decodeTalentBuild(searchParams.get(TALENT_BUILD_PARAM)), maxPoints));
  }, [data.id, maxPoints, searchParams, tabTalentLists]);

  function commitRanks(nextRanks: TalentRanks) {
    setRanks(nextRanks);
    setSearchParams(searchParamsWithTalentBuild(searchParams, nextRanks), { replace: true });
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-3xl font-bold text-white">{data.name} talents</h2>
          <p className="text-sm text-muted-foreground">Click to add a point. Right-click, shift-click, or command-click to remove one. Shareable builds are stored in the URL.</p>
        </div>
        <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-muted-foreground hover:text-white" onClick={() => commitRanks({})}>Reset {total}/{maxPoints} points</button>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {data.tabs.map((tab) => (
          <TalentTab
            key={tab.id}
            tab={tab}
            ranks={ranks}
            context={context}
            onRankChange={(talent, rank) => commitRanks(updateTalentRank(talent, rank, tab.talents, ranks, { maxPoints }))}
          />
        ))}
      </div>
    </div>
  );
}
