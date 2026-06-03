import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
const TALENT_CELL_WIDTH = 52;
const TALENT_CELL_HEIGHT = 58;
const TALENT_GRID_GAP = 16;
const TALENT_ROW_STRIDE = TALENT_CELL_HEIGHT + TALENT_GRID_GAP;
const TALENT_BUILD_PARAM = "build";
const TALENT_ARROW_SOURCE_CLEARANCE = 4;
const TALENT_ARROW_TARGET_CLEARANCE = 6;
const TALENT_ARROW_ELBOW_CLEARANCE = 14;

const TALENT_GRID_WIDTH = TALENT_GRID_COLUMNS * (TALENT_CELL_WIDTH + TALENT_GRID_GAP);
const TALENT_TOOLTIP_WIDTH = 288;
const TALENT_TOOLTIP_MARGIN = 16;
const TALENT_TOOLTIP_GAP = 8;
const TALENT_TOOLTIP_ESTIMATED_HEIGHT = 224;
const TALENT_TOOLTIP_CLASS_NAME = "pointer-events-none fixed z-[100] w-[min(18rem,calc(100vw-2rem))] max-h-[min(24rem,calc(100vh-2rem))] overflow-y-auto rounded-lg border border-amber-400/25 bg-zinc-950 p-3 text-left text-xs text-zinc-200 shadow-2xl shadow-black/60";
const TALENT_TOOLTIP_SSR_CLASS_NAME = `${TALENT_TOOLTIP_CLASS_NAME} hidden group-hover:block group-focus-visible:block`;

type TalentTooltipPosition = {
  left: number;
  top: number;
};

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

export function calculateRequiredPlayerLevel(spentPoints: number, flavor: Pick<ResolvedServerContext["flavor"], "maxLevel" | "maxTalentPoints">) {
  const cappedPoints = Math.max(0, Math.min(flavor.maxTalentPoints, spentPoints));
  if (cappedPoints === 0) return 1;

  // Current metadata exposes max level and max talent points, not a first-talent-level field.
  // Vanilla/TBC/WotLK rules imply first talent point at maxLevel - maxTalentPoints + 1.
  const firstTalentLevel = flavor.maxLevel - flavor.maxTalentPoints + 1;
  return Math.min(flavor.maxLevel, firstTalentLevel + cappedPoints - 1);
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

export function resetTalentTabRanks(tabs: TalentEntry[][], ranks: TalentRanks, resetTalents: TalentEntry[], maxPoints = Number.POSITIVE_INFINITY): TalentRanks {
  const resetIds = new Set(resetTalents.map((talent) => talent.id));
  const nextRanks = Object.fromEntries(Object.entries(ranks).filter(([id]) => !resetIds.has(Number(id))));
  return normalizeTalentRanks(tabs, nextRanks, maxPoints);
}

export function searchParamsWithTalentBuild(params: URLSearchParams, ranks: TalentRanks) {
  const next = new URLSearchParams(params);
  const build = encodeTalentBuild(ranks);
  if (build) next.set(TALENT_BUILD_PARAM, build);
  else next.delete(TALENT_BUILD_PARAM);
  return next;
}

export function canonicalTalentBuildUrl(href: string, ranks: TalentRanks) {
  const url = new URL(href);
  url.search = searchParamsWithTalentBuild(url.searchParams, ranks).toString();
  return url.toString();
}

type BuildUrlClipboard = Pick<Clipboard, "writeText">;

export async function copyTalentBuildUrl(clipboard: BuildUrlClipboard | undefined, href: string, ranks: TalentRanks) {
  if (!clipboard) return;
  await clipboard.writeText(canonicalTalentBuildUrl(href, ranks));
}

function talentCenter(talent: Pick<TalentEntry, "tierID" | "columnIndex">) {
  return {
    x: talent.columnIndex * (TALENT_CELL_WIDTH + TALENT_GRID_GAP) + TALENT_BUTTON_SIZE / 2,
    y: talent.tierID * TALENT_ROW_STRIDE + TALENT_BUTTON_SIZE / 2,
  };
}

export function prerequisiteArrowPolylinePoints(from: Pick<TalentEntry, "tierID" | "columnIndex">, to: Pick<TalentEntry, "tierID" | "columnIndex">) {
  const fromPoint = talentCenter(from);
  const toPoint = talentCenter(to);
  const buttonEdge = TALENT_BUTTON_SIZE / 2;

  if (from.tierID === to.tierID) {
    const direction = toPoint.x >= fromPoint.x ? 1 : -1;
    return `${fromPoint.x + direction * (buttonEdge + TALENT_ARROW_SOURCE_CLEARANCE)},${fromPoint.y} ${toPoint.x - direction * (buttonEdge + TALENT_ARROW_TARGET_CLEARANCE)},${toPoint.y}`;
  }

  const startY = fromPoint.y + buttonEdge + TALENT_ARROW_SOURCE_CLEARANCE;
  const endY = toPoint.y - buttonEdge - TALENT_ARROW_TARGET_CLEARANCE;
  if (fromPoint.x === toPoint.x) return `${fromPoint.x},${startY} ${toPoint.x},${endY}`;

  const elbowY = endY > startY ? endY - TALENT_ARROW_ELBOW_CLEARANCE : startY + TALENT_ARROW_ELBOW_CLEARANCE;
  return `${fromPoint.x},${startY} ${fromPoint.x},${elbowY} ${toPoint.x},${elbowY} ${toPoint.x},${endY}`;
}

function parseArrowPoint(point: string) {
  const [x = "0", y = "0"] = point.split(",");
  return { x: Number(x), y: Number(y) };
}

function formatArrowPoint(point: { x: number; y: number }) {
  return `${point.x} ${point.y}`;
}

export function prerequisiteArrowPathData(points: string) {
  const parsed = points.split(" ").map(parseArrowPoint);
  if (parsed.length <= 1) return "";
  if (parsed.length === 2) return `M ${formatArrowPoint(parsed[0])} L ${formatArrowPoint(parsed[1])}`;

  const commands = [`M ${formatArrowPoint(parsed[0])}`];
  for (let index = 1; index < parsed.length - 1; index += 1) {
    const previous = parsed[index - 1];
    const corner = parsed[index];
    const next = parsed[index + 1];
    const incomingLength = Math.hypot(corner.x - previous.x, corner.y - previous.y);
    const outgoingLength = Math.hypot(next.x - corner.x, next.y - corner.y);
    const radius = Math.min(6, incomingLength / 2, outgoingLength / 2);
    const incoming = {
      x: corner.x - ((corner.x - previous.x) / incomingLength) * radius,
      y: corner.y - ((corner.y - previous.y) / incomingLength) * radius,
    };
    const outgoing = {
      x: corner.x + ((next.x - corner.x) / outgoingLength) * radius,
      y: corner.y + ((next.y - corner.y) / outgoingLength) * radius,
    };
    commands.push(`L ${formatArrowPoint(incoming)}`);
    commands.push(`Q ${formatArrowPoint(corner)} ${formatArrowPoint(outgoing)}`);
  }
  commands.push(`L ${formatArrowPoint(parsed[parsed.length - 1])}`);
  return commands.join(" ");
}

function TalentPrereqArrows({ arrows, ranks, height }: { arrows: TalentPrereqArrow[]; ranks: TalentRanks; height: number }) {
  if (arrows.length === 0) return null;

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
        <marker id="talent-prereq-arrow-active" viewBox="0 0 6 6" refX="4.8" refY="3" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse">
          <path d="M0.5 0.75 L5.5 3 L0.5 5.25 Z" className="fill-[#d8b35f] drop-shadow-[0_0_3px_rgba(216,179,95,0.45)]" />
        </marker>
        <marker id="talent-prereq-arrow-inactive" viewBox="0 0 6 6" refX="4.8" refY="3" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse">
          <path d="M0.5 0.75 L5.5 3 L0.5 5.25 Z" className="fill-[#8b744f]/70" />
        </marker>
      </defs>
      {arrows.map(({ from, to, requiredRank }) => {
        const active = (ranks[from.id] ?? 0) >= requiredRank;
        const strokeClass = active ? "stroke-[#d8b35f]/85 drop-shadow-[0_0_4px_rgba(216,179,95,0.35)]" : "stroke-[#6d5a3f]/45";
        const marker = active ? "url(#talent-prereq-arrow-active)" : "url(#talent-prereq-arrow-inactive)";
        const points = prerequisiteArrowPolylinePoints(from, to);
        const pathData = prerequisiteArrowPathData(points);

        return (
          <g key={`${from.id}-${to.id}`} className="transition">
            <path
              d={pathData}
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-[#2b241a]/80"
            />
            <path
              d={pathData}
              fill="none"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              markerEnd={marker}
              className={strokeClass}
            />
          </g>
        );
      })}
    </svg>
  );
}

function talentDescription(talent: TalentEntry) {
  if (talent.description) return talent.description;
  if (talent.effect) return talent.effect;
  if (typeof talent.effects === "string") return talent.effects;
  return "Talent details unavailable.";
}

export function talentTooltipPosition(rect: Pick<DOMRect, "left" | "top" | "right" | "bottom" | "width" | "height">, viewport: Pick<Window, "innerWidth" | "innerHeight"> = window): TalentTooltipPosition {
  const viewportWidth = viewport.innerWidth;
  const viewportHeight = viewport.innerHeight;
  const tooltipHeight = Math.min(TALENT_TOOLTIP_ESTIMATED_HEIGHT, Math.max(0, viewportHeight - TALENT_TOOLTIP_MARGIN * 2));
  const maxTop = Math.max(TALENT_TOOLTIP_MARGIN, viewportHeight - tooltipHeight - TALENT_TOOLTIP_MARGIN);
  const left = Math.min(
    Math.max(rect.left + rect.width / 2 - TALENT_TOOLTIP_WIDTH / 2, TALENT_TOOLTIP_MARGIN),
    Math.max(TALENT_TOOLTIP_MARGIN, viewportWidth - TALENT_TOOLTIP_WIDTH - TALENT_TOOLTIP_MARGIN),
  );
  const belowTop = rect.bottom + TALENT_TOOLTIP_GAP;
  const aboveTop = rect.top - TALENT_TOOLTIP_GAP - TALENT_TOOLTIP_ESTIMATED_HEIGHT;
  const preferredTop = belowTop + TALENT_TOOLTIP_ESTIMATED_HEIGHT > viewportHeight - TALENT_TOOLTIP_MARGIN && aboveTop > TALENT_TOOLTIP_MARGIN
    ? aboveTop
    : belowTop;
  const top = Math.min(Math.max(preferredTop, TALENT_TOOLTIP_MARGIN), maxTop);
  return { left, top };
}

function talentRankTexts(talent: TalentEntry) {
  if (talent.rankDescriptions) return talent.rankDescriptions;
  if (talent.rankDescription) return talent.rankDescription;
  if (Array.isArray(talent.effects)) return talent.effects;
  return [];
}

function lockedTalentReasons(talent: TalentEntry, talents: TalentEntry[], ranks: TalentRanks) {
  const reasons: string[] = [];
  const requiredPoints = rowPointRequirement(talent);
  if (pointsSpentBeforeRow(talents, ranks, talent.tierID) < requiredPoints) {
    reasons.push(`Spend ${requiredPoints} points in this tree to unlock this row.`);
  }

  const byId = new Map(talents.map((candidate) => [candidate.id, candidate]));
  for (const prereqId of talent.prereqTalent ?? []) {
    const prereq = byId.get(prereqId);
    if (!prereq) continue;
    if ((ranks[prereq.id] ?? 0) < prereq.maxRank) {
      reasons.push(`Requires ${prereq.name} at rank ${prereq.maxRank}/${prereq.maxRank}.`);
    }
  }

  return reasons.length > 0 ? reasons : ["Complete prerequisite requirements to unlock this talent."];
}

function TalentTooltipCard({
  talent,
  rank,
  locked,
  currentRankText,
  nextRankText,
  lockReasons,
  id,
  className,
  position,
}: {
  talent: TalentEntry;
  rank: number;
  locked: boolean;
  currentRankText?: string;
  nextRankText?: string;
  lockReasons: string[];
  id: string;
  className: string;
  position?: TalentTooltipPosition;
}) {
  return (
    <span
      id={id}
      role="tooltip"
      className={className}
      style={position ? { left: `${position.left}px`, top: `${position.top}px` } : undefined}
    >
      <strong className="block text-sm text-white">{talent.name}</strong>
      <span className="mt-1 block font-semibold text-amber-200">Rank {rank}/{talent.maxRank}{locked ? " · Locked" : ""}</span>
      <span className="mt-2 block text-zinc-300">{talentDescription(talent)}</span>
      {currentRankText && <span className="mt-2 block text-emerald-200">Current rank: {currentRankText}</span>}
      {nextRankText && <span className="mt-1 block text-sky-200">Next rank: {nextRankText}</span>}
      {locked && (
        <span className="mt-2 block space-y-1 text-red-200">
          <span className="block font-semibold">Locked</span>
          {lockReasons.map((reason) => <span key={reason} className="block">{reason}</span>)}
        </span>
      )}
      <span className="mt-2 block text-muted-foreground">Spell ranks: {talent.spellRanks.join(", ")}</span>
    </span>
  );
}

type TalentVisualState = "locked" | "available" | "selected" | "maxed";

function talentVisualState(rank: number, maxRank: number, locked: boolean): TalentVisualState {
  if (locked) return "locked";
  if (rank >= maxRank) return "maxed";
  if (rank > 0) return "selected";
  return "available";
}

function TalentButton({ talent, rank, locked, talents, ranks, context, onChange }: { talent: TalentEntry; rank: number; locked: boolean; talents: TalentEntry[]; ranks: TalentRanks; context: ResolvedServerContext; onChange: (rank: number) => void }) {
  const maxed = rank >= talent.maxRank;
  const visualState = talentVisualState(rank, talent.maxRank, locked);
  const tooltipId = `talent-tooltip-${talent.id}`;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TalentTooltipPosition | undefined>();
  const rankTexts = talentRankTexts(talent);
  const currentRankText = rank > 0 ? rankTexts[rank - 1] : undefined;
  const nextRankText = rank < talent.maxRank ? rankTexts[rank] ?? rankTexts[rank === 0 ? 0 : rank] : undefined;
  const lockReasons = locked ? lockedTalentReasons(talent, talents, ranks) : [];
  const title = locked ? `${talent.name} locked. ${lockReasons.join(" ")}` : `${talent.name} (${rank}/${talent.maxRank})`;
  const showTooltip = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) setTooltipPosition(talentTooltipPosition(rect));
  };
  const hideTooltip = () => setTooltipPosition(undefined);

  useEffect(() => {
    if (!tooltipPosition || typeof document === "undefined") return undefined;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (buttonRef.current?.contains(target)) return;
      hideTooltip();
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") hideTooltip();
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [tooltipPosition]);

  const tooltip = (
    <TalentTooltipCard
      id={tooltipId}
      talent={talent}
      rank={rank}
      locked={locked}
      currentRankText={currentRankText}
      nextRankText={nextRankText}
      lockReasons={lockReasons}
      className={TALENT_TOOLTIP_CLASS_NAME}
      position={tooltipPosition}
    />
  );
  return (
    <button
      ref={buttonRef}
      type="button"
      title={title}
      aria-disabled={locked}
      aria-describedby={tooltipId}
      data-talent-tooltip-trigger="true"
      data-state={visualState}
      data-talent-id={talent.id}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      onClick={(event) => {
        showTooltip();
        if (event.shiftKey || event.metaKey) onChange(Math.max(0, rank - 1));
        else onChange(Math.min(talent.maxRank, rank + 1));
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        onChange(Math.max(0, rank - 1));
      }}
      className={cn(
        "group relative h-10 w-10 rounded-sm border bg-zinc-950 shadow-lg transition before:absolute before:-inset-0.5 before:rounded-sm before:content-['']",
        visualState === "locked" && "talent-state-locked cursor-not-allowed border-zinc-800 opacity-50 before:bg-black/20",
        visualState === "available" && "talent-state-available border-primary/70 shadow-primary/20 before:border before:border-primary/35 hover:scale-105 hover:border-primary hover:shadow-primary/30",
        visualState === "selected" && "talent-state-selected border-emerald-300/80 shadow-emerald-500/20 ring-1 ring-emerald-300/45 before:border before:border-emerald-300/35 hover:scale-105 hover:border-emerald-200",
        visualState === "maxed" && "talent-state-maxed border-amber-300 shadow-amber-400/25 ring-2 ring-amber-300/55 before:border before:border-amber-200/50 before:shadow-[0_0_14px_rgba(251,191,36,0.28)] hover:scale-105 hover:border-amber-200",
      )}
    >
      <img src={iconUrl(talent.iconTexture, context)} alt="" className={cn("h-full w-full rounded object-cover", locked && "grayscale opacity-35")} />
      {locked && <span className="absolute inset-0 rounded bg-black/45" />}
      {maxed && <span className="pointer-events-none absolute inset-0 rounded bg-amber-300/10 shadow-[inset_0_0_12px_rgba(251,191,36,0.38)]" />}
      {visualState === "available" && <span className="pointer-events-none absolute inset-0 rounded bg-primary/10 shadow-[inset_0_0_10px_rgba(20,184,166,0.22)]" />}
      {visualState === "selected" && <span className="pointer-events-none absolute inset-0 rounded bg-emerald-300/10 shadow-[inset_0_0_10px_rgba(16,185,129,0.28)]" />}
      <span className={cn(
        "absolute -bottom-1 -right-1 rounded border px-1 text-[10px] font-bold shadow-sm",
        visualState === "maxed" ? "border-amber-100/70 bg-amber-300 text-black" : visualState === "selected" ? "border-emerald-100/50 bg-emerald-500 text-black" : visualState === "available" ? "border-primary/60 bg-primary/85 text-black" : "border-zinc-500/60 bg-zinc-800 text-zinc-300",
      )}>
        {rank}/{talent.maxRank}
      </span>
      {typeof document === "undefined" ? (
        <TalentTooltipCard
          id={tooltipId}
          talent={talent}
          rank={rank}
          locked={locked}
          currentRankText={currentRankText}
          nextRankText={nextRankText}
          lockReasons={lockReasons}
          className={TALENT_TOOLTIP_SSR_CLASS_NAME}
        />
      ) : tooltipPosition ? createPortal(tooltip, document.body) : null}
    </button>
  );
}

function TalentTab({
  tab,
  ranks,
  context,
  onRankChange,
  onReset,
}: {
  tab: TalentTabData;
  ranks: TalentRanks;
  context: ResolvedServerContext;
  onRankChange: (talent: TalentEntry, rank: number) => void;
  onReset: () => void;
}) {
  const points = useMemo(() => tab.talents.reduce((sum, talent) => sum + (ranks[talent.id] ?? 0), 0), [tab.talents, ranks]);
  const arrows = useMemo(() => prerequisiteArrows(tab.talents), [tab.talents]);
  const rows = useMemo(() => talentGridRows(tab.talents), [tab.talents]);
  const height = talentGridHeight(rows);
  return (
    <section className="talent-tree-card wiki-card relative max-w-full self-start overflow-hidden border-amber-400/20 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.14),transparent_32%),linear-gradient(180deg,rgba(120,83,38,0.16),rgba(9,9,11,0.58))] p-4 shadow-2xl shadow-black/30" aria-label={`${tab.name} talent tree`}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" aria-hidden="true" />
      <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/30 p-2 shadow-inner shadow-black/30">
        <div className="flex min-w-0 items-center gap-3">
          <span className="rounded-lg border border-amber-300/35 bg-black/45 p-1 shadow-lg shadow-black/35">
            <img src={iconUrl(tab.iconTexture, context)} alt="" className="h-10 w-10 rounded border border-primary/25 object-cover" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-xl font-bold text-white">{tab.name}</h3>
            <p className="text-sm font-semibold text-amber-100/85">{points} points spent</p>
          </div>
        </div>
        <button
          type="button"
          aria-label={`Reset ${tab.name} tree`}
          className="shrink-0 rounded-md border border-amber-300/30 bg-zinc-950/60 px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-amber-100/80 transition hover:border-amber-200/60 hover:bg-amber-300/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
          disabled={points === 0}
          onClick={onReset}
        >
          Reset tree
        </button>
      </div>
      <div className="-mx-4 overflow-x-auto overscroll-x-contain px-4 pb-3 touch-pan-x sm:mx-0 sm:px-0" aria-label="Scrollable talent tree grid">
        <div
          className="relative mx-auto min-w-max rounded-lg border border-white/5 bg-black/25 p-3"
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
                    <div key={`${tier}-${col}`} className="flex h-[58px] w-[52px] items-start justify-center">
                      {talent && (
                        <TalentButton
                          talent={talent}
                          rank={ranks[talent.id] ?? 0}
                          locked={(ranks[talent.id] ?? 0) === 0 && !canUseTalent(talent, tab.talents, ranks)}
                          talents={tab.talents}
                          ranks={ranks}
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
      </div>
    </section>
  );
}

export function TalentTreeViewer({ data, context }: { data: ClassTalentData; context: ResolvedServerContext }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabTalentLists = useMemo(() => data.tabs.map((tab) => tab.talents), [data.tabs]);
  const deepestTabRows = useMemo(() => Math.max(...data.tabs.map((tab) => talentGridRows(tab.talents)), 0), [data.tabs]);
  const tabGridClassName = deepestTabRows > 7 ? "grid min-w-0 gap-4 xl:grid-cols-2 2xl:grid-cols-3" : "grid min-w-0 gap-4 xl:grid-cols-3";
  const maxPoints = context.talents.maxTalentPoints;
  const [ranks, setRanks] = useState<TalentRanks>(() => normalizeTalentRanks(tabTalentLists, decodeTalentBuild(searchParams.get(TALENT_BUILD_PARAM)), maxPoints));
  const total = useMemo(() => totalTalentPoints(ranks), [ranks]);
  const requiredLevel = useMemo(() => calculateRequiredPlayerLevel(total, context.flavor), [context.flavor, total]);

  useEffect(() => {
    setRanks(normalizeTalentRanks(tabTalentLists, decodeTalentBuild(searchParams.get(TALENT_BUILD_PARAM)), maxPoints));
  }, [data.id, maxPoints, searchParams, tabTalentLists]);

  function commitRanks(nextRanks: TalentRanks) {
    setRanks(nextRanks);
    setSearchParams(searchParamsWithTalentBuild(searchParams, nextRanks), { replace: true });
  }

  async function copyBuildLink() {
    if (typeof window === "undefined") return;
    await copyTalentBuildUrl(navigator.clipboard, window.location.href, ranks);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-white">{data.name} talents</h2>
          <p className="text-sm text-muted-foreground">Click to add a point. Right-click, shift-click, or command-click to remove one. Shareable builds are stored in the URL.</p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm font-bold text-white">
            Requires level {requiredLevel}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <button type="button" className="rounded-lg border border-primary/50 bg-primary/15 px-3 py-2 text-sm font-bold text-white hover:bg-primary/25" onClick={() => void copyBuildLink()} title="Share your current talents">
              Copy build link
            </button>
            <button type="button" className="rounded-lg border border-border/60 bg-black/40 px-3 py-2 text-sm text-muted-foreground hover:text-white" onClick={() => commitRanks({})}>Reset {total}/{maxPoints} points</button>
          </div>
        </div>
      </div>
      <div className={tabGridClassName}>
        {data.tabs.map((tab) => (
          <TalentTab
            key={tab.id}
            tab={tab}
            ranks={ranks}
            context={context}
            onRankChange={(talent, rank) => commitRanks(updateTalentRank(talent, rank, tab.talents, ranks, { maxPoints }))}
            onReset={() => commitRanks(resetTalentTabRanks(tabTalentLists, ranks, tab.talents, maxPoints))}
          />
        ))}
      </div>
    </div>
  );
}
