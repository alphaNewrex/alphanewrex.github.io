# Repository Guide

## Commands

- Use Node.js 22.12 or newer and `pnpm`; `pnpm-lock.yaml` is the current lockfile. Do not regenerate `package-lock.json`.
- Start development with `pnpm dev`; build production output with `pnpm build`; inspect that output with `pnpm preview`.
- There are no configured lint, test, or typecheck scripts. Run `pnpm build` after changes; it validates content schemas and static route generation but does not typecheck Astro files.

## Sources Of Truth

- `README.md` is inherited Astrofy documentation and is stale about npm, Tailwind, and content configuration. Prefer `package.json`, `astro.config.mjs`, and `src/content.config.ts`.
- This is one statically generated Astro site. Routes live in `src/pages`; shared page chrome is in `src/layouts/BaseLayout.astro`; global CSS enters every page through `src/components/BaseHead.astro`.
- Tailwind 4 is wired through `@tailwindcss/vite` in `astro.config.mjs`. Tailwind, Typography, and DaisyUI are configured in `src/styles/global.css`; do not restore `tailwind.config.cjs` or `@astrojs/tailwind`.
- Blog and store collections use glob loaders in `src/content.config.ts`. Their Markdown lives under `src/content/{blog,store}`; frontmatter must satisfy that file's schemas. Entry IDs become `/blog/<id>` and `/store/<id>` routes, and blog tags generate `/blog/tag/<tag>` routes.
- Site title and description live in `src/config.ts`. The canonical host also appears in `astro.config.mjs`, `public/robots.txt`, and `CNAME`; these currently disagree, so establish the intended host before changing them and then keep them aligned.

## Deployment

- `.github/workflows/astro.yml` is the only workflow: one job that builds with pnpm on Node 22 and publishes `dist/` to GitHub Pages on pushes to `main`.
- `pnpm/action-setup` reads the pnpm version from the `packageManager` field in `package.json`; keep that field in sync with the pnpm you use locally.
- CI runs `pnpm install --frozen-lockfile`, so commit `pnpm-lock.yaml` alongside any dependency change or the deploy fails.
