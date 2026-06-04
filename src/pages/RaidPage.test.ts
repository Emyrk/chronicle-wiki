import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RecentRaidCards, RecentRaidState } from "./RaidPage";

const raids = [
  {
    id: "raid-1",
    slug: "XhQ7Rx-X4vldZNAM",
    name: "Molten Core",
    realmName: "Nordanaar",
    uploaderName: "George",
    uploadedAt: "2026-05-14T03:08:31.956742Z",
    firstEncounterTime: "2026-05-13T18:11:51.062Z",
    playerCount: 25,
    bossCount: 12,
    bossKills: 12,
    durationMs: 4282360,
  },
  {
    id: "raid-2",
    slug: "wipe-log",
    name: "Molten Core",
    realmName: "Nordanaar",
    uploaderName: "Raider",
    uploadedAt: "2026-05-15T03:08:31.956742Z",
    firstEncounterTime: "2026-05-14T18:11:51.062Z",
    playerCount: 39,
    bossCount: 10,
    bossKills: 7,
    durationMs: 3720000,
  },
];

describe("RecentRaidCards", () => {
  it("renders recent Chronicle raid logs as wiki raid cards", () => {
    const html = renderToStaticMarkup(createElement(RecentRaidCards, {
      raids,
      chronicleBaseUrl: "https://turtle.chronicleclassic.com",
    }));

    expect(html.match(/data-raid-card="recent"/g)).toHaveLength(2);
    expect(html).toContain("Molten Core");
    expect(html).toContain("Nordanaar");
    expect(html).toContain("25 players");
    expect(html).toContain("12/12 bosses");
    expect(html).toContain("1h 11m");
    expect(html).toContain("https://turtle.chronicleclassic.com/raids/XhQ7Rx-X4vldZNAM");
  });

  it("renders player-facing loading, empty, and error states", () => {
    const states = [
      renderToStaticMarkup(createElement(RecentRaidState, { status: "loading", raids: [], chronicleBaseUrl: "https://turtle.chronicleclassic.com" })),
      renderToStaticMarkup(createElement(RecentRaidState, { status: "empty", raids: [], chronicleBaseUrl: "https://turtle.chronicleclassic.com" })),
      renderToStaticMarkup(createElement(RecentRaidState, { status: "error", raids: [], chronicleBaseUrl: "https://turtle.chronicleclassic.com" })),
    ];

    expect(states[0]).toContain("Loading recent raid cards");
    expect(states[1]).toContain("No recent raid cards found");
    expect(states[2]).toContain("Recent raid cards are unavailable right now");
    for (const html of states) {
      expect(html).not.toMatch(/api|debug|implementation|fallback|fixture/i);
    }
  });
});
