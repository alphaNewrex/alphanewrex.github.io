# Repository Guide

## Commands

- Use Node.js 22.12 or newer and `pnpm`; `pnpm-lock.yaml` is the current lockfile. Do not regenerate `package-lock.json`.
- Start development with `pnpm dev`; build production output with `pnpm build`; inspect that output with `pnpm preview`.
- There are no configured lint, test, or typecheck scripts. Run `pnpm build` after changes; it validates content schemas and static route generation but does not typecheck Astro files.

## Sources Of Truth

- `README.md` describes this site specifically; the inherited Astrofy template docs it replaced are in git history only.
- This is one statically generated Astro site. Routes live in `src/pages`; shared page chrome is in `src/layouts/BaseLayout.astro`; global CSS enters every page through `src/components/BaseHead.astro`.
- Files and directories in `src/pages` prefixed with `_` are deliberately excluded from routing. `_services.astro` and `_store/` are unfinished template pages kept for reference; do not rename them back without real content, and expect the unused `store` collection, `StoreItemLayout.astro`, `HorizontalShopItem.astro`, and `Card.astro` to have no routes referencing them.
- `/projects` and `/photos` are data-driven. Project copy lives in `src/data/projects.ts`; captions in `src/data/photo-captions.ts`. Both pages discover images with `import.meta.glob` over `src/images/`, so adding a photo or a project screenshot is a file drop with no code edit: photos are any file in `src/images/photos/`, and a project screenshot must be named `src/images/projects/<slug>.<ext>` to match its entry's `slug`.
- Put photos and screenshots in `src/images/`, never `public/`. `public/` ships files byte-for-byte, while `src/` images go through sharp for WebP conversion, responsive `srcset`, and lazy loading. A gallery of unoptimized phone photos in `public/` would be tens of megabytes.
- `HorizontalCard.astro` builds tag links by slicing its `url` prop and assumes a blog URL; it is only safe for blog listings. `ProjectCard.astro` exists because of this.
- Tailwind 4 is wired through `@tailwindcss/vite` in `astro.config.mjs`. Tailwind, Typography, and DaisyUI are configured in `src/styles/global.css`; do not restore `tailwind.config.cjs` or `@astrojs/tailwind`.
- Blog and store collections use glob loaders in `src/content.config.ts`. Their Markdown lives under `src/content/{blog,store}`; frontmatter must satisfy that file's schemas. Blog entry IDs become `/blog/<id>` routes, and blog tags generate `/blog/tag/<tag>` routes.
- Site title and description live in `src/config.ts`. The canonical host is `harshgujarathi.com` and appears in `astro.config.mjs`, `public/robots.txt`, and `CNAME`; change all three together. `astro.config.mjs` `site` feeds the sitemap, RSS, and every `og:`/`twitter:` URL, so a wrong value ships sitewide.

## Design System

- `DESIGN.md` is the source of truth for colours, components, and theming; read it before touching UI. Tokens and shared classes (`ds-btn`, `ds-chip`, `ds-icon-btn`, `ds-link`) live in `src/styles/global.css`; boxes are `Panel.astro`.
- Two daisyUI themes: `lofi` (light) and `black` (dark), mapped onto the `--ds-*` tokens. An inline script in `BaseHead.astro` sets `data-theme` before first paint; `src/lib/theme.ts` switches it and fires `themechange`; the switch is `ThemeToggle.astro` (top-right). The globe keeps its own per-theme palette in `globe-widget.ts`.

## Dot-Matrix Background

- The page dot grid is a fixed CSS background on `:root` in `src/styles/global.css`; `src/components/DotField.astro` is a canvas behind the page (`z-index: -1`) that lights up grid dots near the cursor and on click. Both read `--dot-pitch`/`--dot-size`, so change them only in `global.css`.
- `BaseLayout.astro` has no full-page wrapper background on purpose so the grid shows through; giving `main` or a wrapper a background hides it. Cards keep their own backgrounds.

## Navigation And Profile Photo

- Put page text inside `src/components/Panel.astro` boxes (solid background, border; optional plain `title` heading; `tone='ink'` for an inverted call-to-action) so it never sits directly on the dot grid. Section pages open with `PageIntro.astro` (page title plus intro text). No monospace label/index header rows; the owner removed them.

- There is no sidebar or drawer. `src/components/NavMenu.astro` is a fixed round button (top-left) that drops links and social icons down as separate pills; its `links` and `socials` arrays are the only place nav items and the contact email live. Pages pass `sideBarActiveItemID` to `BaseLayout`, which forwards it as the active link id; `includeSidebar={false}` hides the menu.
- The homepage photo is `src/images/profile/harsh.jpeg`, rendered by `ProfilePhoto.astro`. `public/profile_pic.jpeg` is a separate copy kept only as the default `og:image` in `BaseHead.astro`.

## Visitor Globe

- `src/components/globe-widget/` is the bottom-right visitor globe mounted in `BaseLayout.astro`. The dot-matrix cat is defined as ASCII maps in `cat.ts`; spin physics and data loading live in `globe-widget.ts`. cobe and visitor data load only when the panel first opens.
- `worker/index.ts` is a Cloudflare Worker serving only `/api/visit` (POST, same-origin) and `/api/visitors` (GET, edge-cached 5 min); `wrangler.jsonc` routes `/api/*` to it and serves `dist/` as static assets. Data lives in D1 (`migrations/`), aggregated per country+city with coordinates rounded to 1 decimal. Never store IPs or per-visitor rows.
- cobe has no dot-size option, so `patches/cobe@2.0.1.patch` (applied by pnpm via `pnpm.patchedDependencies`) raises the land-dot radius in its shader from `8e-3` to `1.1e-2`. Upgrading cobe needs a new patch: `pnpm patch cobe@<version>`, edit that `smoothstep(...)` value, `pnpm patch-commit`. Dot density is `mapSamples` in `globe-widget.ts`.
- Under `pnpm dev` the API is absent and the widget shows sample points. Test the real API with `pnpm cf:dev` (needs `pnpm wrangler d1 migrations apply visitors --local` once).

## Deployment

- `.github/workflows/astro.yml` is the only workflow: one job that builds with pnpm on Node 22 and publishes `dist/` to GitHub Pages on pushes to `main`.
- `pnpm/action-setup` reads the pnpm version from the `packageManager` field in `package.json`; keep that field in sync with the pnpm you use locally.
- CI runs `pnpm install --frozen-lockfile`, so commit `pnpm-lock.yaml` alongside any dependency change or the deploy fails.
