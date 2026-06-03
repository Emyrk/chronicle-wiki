# Talent builder regression contract

This document is the regression contract for Chronicle Wiki talent parsing and talent-builder behavior. Future talent-builder implementation work should update tests against this contract before changing parser or renderer behavior.

## Current parsing behavior

Changing parser behavior is not required for the current Chronicle Wiki talent-builder work.

The app currently treats talent trees as static JSON data in the Chronicle API shape and performs no normalization pass, reparse step, database import, or admin-panel mutation. `fetchTalentTrees()` requests `/api/v1/wowdb/talent-trees` from the selected server's `chronicleBaseUrl`, accepts a non-empty `classes` object as canonical remote data, and otherwise falls back to the local Warrior/Mage fixture in `src/data/talents.ts`.

The renderer consumes the API/fixture shape directly:

- `classes` is a record keyed by numeric class id as a string.
- Each class has `tabs`.
- Each tab has `id`, `name`, `backgroundFile`, `orderIndex`, `iconTexture`, and `talents`.
- Each talent has `id`, `tierID`, `columnIndex`, `maxRank`, `tabIndex`, `spellRanks`, `iconTexture`, and optional `prereqTalent` / `prereqRank` arrays.

Preserve that direct static data contract. Do not introduce a DB-backed admin panel, runtime parser, or mutable content workflow unless future repo evidence shows that static/git-driven data is insufficient.

## Canonical inputs

Canonical talent inputs are, in order:

1. The selected server Chronicle API response from `/api/v1/wowdb/talent-trees`, resolved by server host/tenant context. Do not add `dataset_id` query parameters for wiki calls.
2. Static git-tracked fixtures in `src/data/talents.ts` when the API is unavailable or empty.
3. Future static git-tracked content files, if the TypeScript fixture shape moves to JSON/YAML/MDX later.

The current repo has no parser/reparser source of truth outside this API-plus-fixture flow. Treat any future converter as an adapter into the same shape, not as a new semantic authority.

## Behavior to preserve

The talent builder must preserve these behaviors:

- The selected server slug resolves to a server context before talent data is fetched.
- The API URL is server-scoped and omits `dataset_id`.
- A remote response with a non-empty `classes` object wins over fallback fixtures.
- Fallback fixtures keep the UI and tests usable when the remote API is unavailable.
- Talent positions are read from `tierID` and `columnIndex` inside the active tab.
- Remote class entries may only contain `tabs`; normalize the selected class id/name from the numeric `classes` map key and the local class registry before rendering so headings do not become `undefined talents`.
- Tabs are displayed in ascending `orderIndex` order.
- The grid geometry matches the live ChronicleClassic renderer: four columns, 40px icons, 48px row cells, 8px gaps, `max(tierID) + 1` rendered rows, and a 192px overlay coordinate width.
- Prerequisite arrows are derived from `prereqTalent` entries that resolve to talents in the same active tab.
- Missing prerequisite sources outside the current tab are ignored by the arrow renderer and must not crash the page.

## Unlock semantics

These are the canonical builder semantics for future implementation and regression tests.

### Row unlocks

Rows are zero-indexed by `tierID`.

A talent in row `N` requires `N * 5` points spent in earlier rows of the same tab before it can be used:

- Row 0 requires 0 prior-row points.
- Row 1 requires 5 prior-row points.
- Row 2 requires 10 prior-row points.
- Row 3 requires 15 prior-row points.
- Continue by adding 5 points per row.

Only points spent in rows with `tierID < N` count toward the requirement. Points in the same row or lower rows must not unlock that row.

Removing points from earlier rows must be rejected when it would invalidate already-spent points in later rows.

### Arrow prerequisites

An arrow means the talent at the end of the arrow requires the previous talent at the start of the arrow to be full.

Implementation detail:

- `prereqTalent` identifies the source talent id for each arrow.
- `prereqRank` may be present in API data and can be preserved for metadata/debugging, but the Chronicle Wiki builder contract is full-source prerequisite behavior: the target is unlockable only when the source rank is at least the source talent's `maxRank`.
- If multiple prerequisite arrows point to a target, all sources must be full.
- Arrow visual state should use the same full-source rule: inactive until the source is full, active once it is full.

This contract intentionally avoids making `prereqRank` the unlock authority. The user-facing rule is simpler and matches the desired talent-builder behavior: arrow target requires arrow source full.

## Regression test expectations

Future implementation work should keep or add tests proving:

- `fetchTalentTrees()` omits `dataset_id` and falls back only when the API response is unavailable, not OK, empty, or malformed.
- `rowPointRequirement()` returns `tierID * 5`.
- `canUseTalent()` rejects same-row points as row unlock credit.
- `canUseTalent()` requires all arrow sources to be full, regardless of lower `prereqRank` metadata.
- `updateTalentRank()` refuses to add points to locked talents.
- `updateTalentRank()` refuses to remove points when that would strand later-row or arrow-dependent spent talents.
- `prerequisiteArrows()` maps same-tab `prereqTalent` metadata into arrows and ignores unresolved sources without crashing.
