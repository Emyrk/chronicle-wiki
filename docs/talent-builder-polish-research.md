# Talent builder polish research

This note compares established World of Warcraft talent calculators and turns the recurring patterns into Chronicle Wiki requirements. It is intentionally scoped to a talent-builder polish slice, not a new platform.

## Sources reviewed

| Source | URL | Useful patterns | Gaps / cautions |
| --- | --- | --- | --- |
| TurtleCraft / Turtle WoW talent calculator | https://talents.turtlecraft.gg/warrior | Custom private-server talents, compact class strip, full three-tree view, class/tree point summary, points-left summary, share button, per-tree clear controls, grayscale locked talents, green active rank badges, visible prerequisite arrows. | Strong visual reference for custom talents, but do not copy art assets. Mobile still needs independent Chronicle verification. |
| Wowhead Classic / SoD talent calculator | https://www.wowhead.com/classic/talent-calc/warrior and https://www.wowhead.com/help=talent-calculator | Link, embed, import controls; auto-updating build URL; right-click or Shift-click removal; max-level selector; points-left summary; per-tree resets; rune/loadout sections; documented search, import/export, annotations, and embeds. | Heavy ad and site chrome are irrelevant to Chronicle. Modern Wowhead features exceed the MVP. |
| Warcraft Tavern Classic talent calculator | https://www.warcrafttavern.com/wow-classic/tools/talent-calculator/warrior/ | Direct URL textbox with Copy button, class grid, points-left summary, compact game-like tree cards with background art, per-spec reset icons, visible prerequisite arrows, talent order section. | Layout wraps the third tree below two columns at the tested width; Chronicle should prefer deliberate responsive behavior over incidental wrapping. |
| Vanilla Plus talent calculator | https://vanillaplus.org/talents/ and https://hawaiisa.github.io/vanillaplus-talent-calculator/#/warrior | Private-server custom talent support, URL-encoded state, CSS-grid trees, viewport-aware tooltip, authentic game-style panel treatment, colored available icons, grayscale unavailable icons, per-tree background art, required-level/points-left display. | Its README still calls out dependency-removal validation as a todo. Chronicle already has a stricter regression contract and should preserve it. |
| maladr0it/classic-talent-calculator | https://github.com/maladr0it/classic-talent-calculator | Open-source TypeScript/CSS-grid implementation. README highlights URL-encoded app state, per-class code splitting, viewport-aware tooltips, and raster-style UI assets. Forked by private-server projects. | Original live domain appears parked/unavailable. Treat repo patterns as implementation reference, not a live UX baseline. |
| oppahansi/nltc | https://github.com/oppahansi/nltc | Cross-platform app with Vanilla/TBC/WotLK support, compact share codes, Wowhead URL import/export, local saved builds, build order tracking, row/dependency validation, dark theme, tutorial, localization, phone/tablet responsiveness. | Broad native-app scope is P2 for Chronicle. Good reference for persistence and mobile expectations, not an MVP target. |

## Recurring polish patterns

### Visual treatment

Polished calculators make the talent grid feel like a game system, not a generic form.

- Icons use strong square borders and inset shadows. Unavailable talents are grayscale or dimmed. Available talents are colored. Selected talents keep full color and often gain brighter borders.
- Rank badges sit on the lower edge or corner of each icon. The current rank and max rank are visible without opening a tooltip.
- Tree panels carry specialization identity: tree icon, tree name, points spent, and usually background art behind the grid.
- Prerequisite arrows are persistent, behind icons, and visually separate from the talent icon itself. Inactive arrows read as steel/gray; active arrows should read as enabled but not neon.
- The top summary repeats the important state: class, per-tree point split, total points left, and sometimes required level.
- Reset controls exist both globally and per tree. They are visually secondary but easy to find.

Chronicle implication: keep ChronicleClassic's charcoal/teal/bronze brand, but make the talent grid use stronger game-like affordances: clear locked/available/selected icon states, fixed rank badge placement, and readable tree cards.

### Tooltip content and behavior

Expected tooltip content:

- Talent name.
- Current rank and max rank.
- Current rank description when points are spent.
- Next rank description until max rank.
- Requirement copy for locked talents: row point requirement and prerequisite talent requirement.
- Max-rank state that stops promising a next rank.
- Spell/resource numbers from the actual rank descriptions when available.

Expected behavior:

- Tooltips must stay above tree chrome and arrows.
- Tooltips must remain inside the viewport horizontally and vertically.
- Hover works on pointer devices. Touch needs click/tap disclosure, not hover-only content.
- Tooltip fallback copy must be player-facing. No `undefined`, debug labels, API-source notes, fixture names, or implementation explanations.

### Builder interactions

Common interactions:

- Left click adds one rank.
- Right click removes one rank.
- Shift-click removal is documented by Wowhead and useful on devices/browsers where context menus interfere.
- Per-tree reset and reset-all controls are standard.
- Point summary updates immediately after every change.
- Invalid adds are prevented before state changes.
- Invalid removals are either prevented or rolled back when they would strand lower-row or prerequisite-dependent talents.

Nice but not required for MVP:

- Shift/Ctrl/max-rank add shortcuts.
- Talent order visualization.
- Search within talents.
- Import/export against Wowhead or in-game formats.
- Saved builds.

Chronicle-specific rule: an arrow target can only be achieved when every source talent feeding it is full. `prereqRank` may be preserved as metadata, but full-source prerequisite behavior is the user-facing rule.

### Sharing and persistence

Expected baseline:

- Server, class, and tree context live in the route.
- Build state lives in the URL so copy/paste preserves the build.
- A visible Copy/Share button avoids making users know that the address bar is enough.
- Invalid or stale URL builds normalize safely and do not create impossible state.

P2 parity:

- Import/export compact codes.
- Import/export Wowhead URLs.
- Local saved builds.
- Build order export.

### Responsive and mobile behavior

Talent trees are wide and information-dense. Good mobile support should be explicit.

- Small screens should either horizontally scroll a stable tree grid or use a deliberate single-tree focus mode. Accidental three-column squeeze is bad.
- Point summary and tree navigation should stay close to the grid, preferably sticky or repeated near the active tree.
- Talent targets need touch-friendly hit areas even when icons remain visually compact.
- Tooltips need tap-to-open, tap-outside/Escape close, viewport-capped positioning, and no hover-only requirement.
- Share/reset controls need reachable placement without burying the tree.

### Data requirements

Chronicle Wiki must satisfy these data requirements before polish feels trustworthy:

- Talent names and rank descriptions for every displayed talent, including remote Chronicle API trees.
- Rank count and max rank for every talent.
- Spell/resource values embedded in descriptions when available from the source data.
- `tierID` and `columnIndex` for grid placement.
- `prereqTalent` metadata for arrows, with same-tab unresolved sources ignored safely.
- Server/flavor-specific custom talent differences. Turtle, Vanilla Plus, Wrath, and future custom servers must not share a hardcoded Classic assumption.
- Missing-data fallback policy that displays neutral player-facing copy or hides unavailable detail. It must not mention API shape, fallback fixtures, parser state, or debug metadata in the player UI.

## Prioritized Chronicle Wiki checklist

### P0, player trust and core usability

1. Preserve strict talent-state validation.
   - Adding a rank must fail when the row requirement or full-source prerequisite requirement is not met.
   - Removing a rank must fail when later-row or arrow-dependent selected talents would become invalid.
   - URL-loaded builds must normalize into the same valid state that clicking would produce.

2. Make locked, available, selected, and maxed talent states unmistakable.
   - Locked talents are dimmed/grayscale and not visually confused with available unspent talents.
   - Available talents are colored enough to invite interaction.
   - Selected talents show rank progress and a selected border/accent.
   - Maxed talents have a distinct completed treatment.

3. Finish tooltip trust requirements.
   - Every tooltip shows name, rank, current/next rank description, and requirements when locked.
   - Max-rank talents stop showing next-rank promises.
   - Tooltip overlays stay above arrows/panels and remain viewport-capped.
   - No implementation/meta/debug/fallback text appears in player-facing copy.

4. Keep prerequisite arrows semantically honest.
   - Arrows render from source to target using active-tab grid positions.
   - Arrow active state follows the full-source prerequisite rule.
   - Arrow inactive and active styles are visually distinct but subordinate to icons.

5. Provide obvious sharing.
   - The build URL encodes server, class, and selected ranks.
   - A visible Copy/Share button copies the canonical URL.
   - Stale or invalid build strings normalize safely without breaking the page.

### P1, visible polish improvements

1. Add game-like tree framing without copying external assets.
   - Each tree has a header with tree icon, name, points spent, and reset control.
   - Each tree can use Chronicle-owned or neutral gradient/background treatment.
   - The framing matches ChronicleClassic brand tokens rather than generic black boxes.

2. Improve mobile builder ergonomics.
   - Use a deliberate mobile mode: horizontal stable-grid scroll or single-tree focus tabs.
   - Keep point summary/tree switcher near the active grid.
   - Use tap-to-open tooltip behavior and touch-safe target sizing.

3. Add reset affordance polish.
   - Reset all is visible near the point summary.
   - Reset tree is visible in each tree header.
   - Reset actions cannot strand invalid state.

4. Add keyboard and context-menu parity.
   - Enter/Space adds a rank to focused available talents.
   - Right click and Shift-click remove a rank.
   - Disabled/locked talents expose disabled semantics for keyboard and screen-reader users.

5. Add build summary clarity.
   - Show class split as `Arms / Fury / Protection` counts or equivalent per class.
   - Show points left and required level near the tree on desktop and mobile.

### P2, parity and convenience

1. Talent order display for leveling builds.
2. Search within the current class talents.
3. Compact import/export code beyond the route URL.
4. Wowhead URL import/export where source formats are stable enough.
5. Local saved builds with user-defined names.
6. Optional annotations or build notes.
7. Embeddable calculator mode for guide pages.
8. Localization once server content needs it.

## Acceptance requirements for implementation cards

Use these as card-ready acceptance requirements.

- State validation tests cover row locks, full-source prerequisite locks, invalid add rejection, invalid removal rejection, and URL normalization.
- Visual-state tests or DOM assertions prove locked, available, selected, and maxed states have distinct class/data-state hooks.
- Tooltip tests cover current rank, next rank, max rank, locked row requirement, locked prerequisite requirement, remote spell descriptions, and no debug/fallback copy.
- Arrow tests cover source/target mapping, inactive style before source is full, active style after source is full, and unresolved same-tab safety.
- Sharing tests prove the Copy/Share control emits the canonical URL and that route state round-trips through encode/decode helpers.
- Mobile tests or Playwright coverage prove the builder remains usable at phone width: no clipped summary controls, reachable tree navigation, tap-open tooltip, and stable grid scrolling or focused-tree behavior.
- Any tree-frame polish uses Chronicle-owned assets, neutral gradients, or generated CSS. Do not copy another calculator's panel art, icons, or background art.
