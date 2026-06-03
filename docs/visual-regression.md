# Visual regression smoke tests

Chronicle Wiki has a small Playwright screenshot suite for catching gross UI regressions before agents ship layout changes.

## Routes covered

The suite captures desktop and mobile screenshots for:

- `/`
- `/turtle`
- `/turtle/guides`
- `/turtle/raids/molten-core`
- `/turtle/raids/molten-core/garr`
- `/turtle/talents/mage`

Each case also asserts that the expected H1 is visible and that the page has no horizontal overflow. Screenshots are viewport-sized rather than full-page so the suite catches obvious layout/style regressions without failing on tiny cross-host text-flow height changes.

## Run locally

```bash
corepack pnpm install
corepack pnpm exec playwright install chrome
corepack pnpm test:visual
```

`test:visual` builds the app with `BASE_PATH=/`, serves the production bundle through Vite preview, then compares screenshots in Google Chrome via Playwright's stable `chrome` channel.

## Update baselines

Only update screenshots when the visual change is intentional.

```bash
corepack pnpm test:visual --update-snapshots
```

Review the changed files under `tests/visual/wiki-smoke.spec.ts-snapshots/` before committing. Do not bless unrelated diffs just because Playwright produced them.

## CI notes

The suite is intentionally separate from `pnpm test` so routine unit tests stay fast. CI can opt in with:

```bash
corepack pnpm exec playwright install --with-deps chrome
corepack pnpm test:visual
```
