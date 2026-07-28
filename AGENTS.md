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

## Deployment

- `.github/workflows/astro.yml` is the only workflow: one job that builds with pnpm on Node 22 and publishes `dist/` to GitHub Pages on pushes to `main`.
- `pnpm/action-setup` reads the pnpm version from the `packageManager` field in `package.json`; keep that field in sync with the pnpm you use locally.
- CI runs `pnpm install --frozen-lockfile`, so commit `pnpm-lock.yaml` alongside any dependency change or the deploy fails.
