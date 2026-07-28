# harshgujarathi.com

Personal site of Harsh Gujarathi — blog, CV, and resume. Built with [Astro](https://astro.build), [Tailwind CSS](https://tailwindcss.com/), and [DaisyUI](https://daisyui.com/), deployed to GitHub Pages.

## Develop

Requires Node.js 22.12+ and pnpm.

```bash
pnpm install
pnpm dev      # dev server
pnpm build    # production build to dist/
pnpm preview  # serve dist/ locally
```

## Layout

| Path | Purpose |
| --- | --- |
| `src/pages/` | Routes. Files prefixed with `_` are excluded from the build. |
| `src/content/blog/` | Blog posts, one Markdown file per post |
| `src/content.config.ts` | Content collection loaders and frontmatter schemas |
| `src/config.ts` | Site title and description |
| `src/layouts/`, `src/components/` | Page shell and shared UI |
| `public/` | Static assets copied verbatim to `dist/` |

## Writing a post

Add a Markdown file to `src/content/blog/`. The filename becomes the URL (`/blog/<filename>`). Frontmatter must satisfy the blog schema in `src/content.config.ts`:

```yaml
---
title: "Post title"
description: "Short summary"
pubDate: "Jan 20 2025"
heroImage: "/blog/image.webp"   # optional
badge: "Personal"               # optional
tags: ["one", "two"]            # optional, must be unique
---
```

Each tag also generates a `/blog/tag/<tag>` listing.

## Deploy

Pushing to `main` triggers `.github/workflows/astro.yml`, which builds with pnpm and publishes `dist/` to GitHub Pages at https://harshgujarathi.com.

The canonical host appears in `astro.config.mjs`, `public/robots.txt`, and `CNAME`. Change all three together.

## License

MIT — see [LICENSE](LICENSE). Originally based on the [Astrofy](https://github.com/manuelernestog/astrofy) template by Manuel Ernesto Garcia.
