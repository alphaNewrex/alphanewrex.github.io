// Site-wide facts. Used for page titles and meta tags (BaseHead.astro), structured
// data (JSON-LD), RSS, and /llms.txt, so keep them accurate and in one place.

export const SITE_TITLE = 'Harsh Gujarathi';
export const SITE_DESCRIPTION =
	'Harsh Gujarathi is a software engineer and ML systems researcher at Georgia Tech (NEXS Lab), previously at Microsoft on Azure Migrate. He builds backend and distributed systems for reliable AI products and efficient LLM inference.';

/** Default social preview image (1200x630) in public/. */
export const SITE_IMAGE = '/og.png';
export const SITE_IMAGE_ALT = 'Harsh Gujarathi — Software Engineer and ML Systems Researcher';

export const PERSON = {
	name: 'Harsh Gujarathi',
	jobTitle: 'Software Engineer and ML Systems Researcher',
	description:
		'Graduate Student Researcher at the NEXS Lab at Georgia Tech, pursuing an MS in Computer Science. Previously a Software Engineer at Microsoft on Azure Migrate.',
	email: 'hgujarathi3@gatech.edu',
	image: '/profile_pic.jpeg',
	location: 'Atlanta, Georgia, USA',
	affiliation: { name: 'Georgia Institute of Technology', url: 'https://www.gatech.edu' },
	alumniOf: [
		{ name: 'Georgia Institute of Technology', url: 'https://www.gatech.edu' },
		{ name: 'Birla Institute of Technology and Science, Pilani', url: 'https://www.bits-pilani.ac.in' },
	],
	knowsAbout: [
		'Distributed systems',
		'Backend engineering',
		'LLM inference',
		'Speculative decoding',
		'Mixture-of-Experts models',
		'Retrieval-augmented generation (RAG)',
		'LLM agents',
		'Go',
		'Python',
		'C#',
	],
	twitter: '@HarshGujarathi3',
	sameAs: [
		'https://github.com/alphaNewrex',
		'https://www.linkedin.com/in/hgujarathi',
		'https://twitter.com/HarshGujarathi3',
		'https://www.instagram.com/harsh_gujarathi/',
	],
};

// Visitor-globe API: a Cloudflare Worker (worker/index.ts, deployed with `pnpm api:deploy`).
// The site is static on GitHub Pages, so it calls the Worker cross-origin.
// Override locally with PUBLIC_VISITOR_API (e.g. http://localhost:8787 for `pnpm api:dev`).
export const VISITOR_API: string =
	import.meta.env.PUBLIC_VISITOR_API ?? 'https://harshgujarathi-api.harsh-portfolio.workers.dev';
