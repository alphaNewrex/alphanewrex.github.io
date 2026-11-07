// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'Harsh Gujarathi';
export const SITE_DESCRIPTION = 'Hey! Welcome to my personal website';

// Visitor-globe API: a Cloudflare Worker (worker/index.ts, deployed with `pnpm api:deploy`).
// The site is static on GitHub Pages, so it calls the Worker cross-origin.
// Override locally with PUBLIC_VISITOR_API (e.g. http://localhost:8787 for `pnpm api:dev`).
export const VISITOR_API: string =
	import.meta.env.PUBLIC_VISITOR_API ?? 'https://harshgujarathi-api.harsh-portfolio.workers.dev';
