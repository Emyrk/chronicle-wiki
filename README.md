# Chronicle Wiki

Server-scoped knowledgebase for Chronicle-supported Classic WoW private servers.

Routes use the server/community slug, then resolve to a shared flavor/dataset under the hood:

```text
/turtle/*      -> Nightmares of Ursol flavor, Turtle Chronicle API
/octo/*        -> Nightmares of Ursol flavor, Octo Chronicle API
/vanillaplus/* -> Vanilla+ flavor, Vanilla+ Chronicle API
/legacy/*      -> baseline Vanilla 1.12.1 content
```

## MVP scope

- Talent calculator powered by the selected server's Chronicle talent-tree API, with local fixtures as a fallback. See `docs/talent-builder-regression.md` for the parsing and unlock regression contract.
- Molten Core guide shell for legacy Vanilla, Vanilla+, and Turtle WoW.
- Unit explorer showing Molten Core creatures and spells cast, structured so log-derived spell lists can be dropped in later.
- Static content and static overrides first. No database yet.

## Development

```bash
pnpm install
pnpm test
pnpm build
pnpm dev
```

Visual screenshot smoke tests are documented in `docs/visual-regression.md` and run with `pnpm test:visual` after installing Google Chrome for Playwright.

## Content inheritance

Guide resolution order:

```text
content/servers/{server}/...
content/flavors/{flavor}/...
content/flavors/{fallbackFlavor}/...
```

For the MVP this is represented in TypeScript data modules rather than MDX/YAML. The shape is intentionally patch-friendly so it can move to static content files later.
