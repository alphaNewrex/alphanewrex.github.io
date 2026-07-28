// Projects shown on /projects.
//
// Each entry leads with `need` — the problem that actually prompted the build.
//
// Screenshots are optional and attach by convention: drop an image at
// `src/images/projects/<slug>.{png,jpg,jpeg,webp}` and it appears on the card.
// No edit here required.
//
// `github` is optional. Omit it while a repo is private or unpushed.

export interface Project {
	slug: string
	title: string
	need: string
	built: string
	tech: string[]
	github?: string
	note?: string
}

export const projects: Project[] = [
	{
		slug: 'artemis',
		title: 'Artemis',
		need: 'While looking for the next step up, I kept learning about roles too late, or never at all. The openings were out there. I just was not seeing them, and no job board was going to fix that for me.',
		built: 'A job hunting platform that discovers company career pages on its own, scrapes them across different ATS platforms, enriches and de-duplicates the postings with AI, and keeps watching for changes. It tracks roughly 1,288 company configurations.',
		tech: [
			'Go',
			'chi',
			'PostgreSQL',
			'pgvector',
			'Python',
			'Celery',
			'SQLAlchemy',
			'OpenAI',
			'Next.js',
			'MinIO',
		],
		github: 'https://github.com/artemis-agent',
	},
	{
		slug: 'verbalforge',
		title: 'VerbalForge',
		need: 'I was prepping for the GRE, and the verbal drilling tools I could find did not match how I wanted to study. Rather than bend my prep around someone else\u2019s app, I built the one I needed.',
		built: 'A GRE verbal platform in three parts: a Go and Gin API backed by MongoDB and Redis, a Next.js study and admin interface, and a Python service that generates fresh verbal questions with an LLM and validates them before they ever reach a practice session.',
		tech: [
			'Go',
			'Gin',
			'MongoDB',
			'Redis',
			'Next.js',
			'React',
			'TypeScript',
			'Tailwind CSS',
			'Python',
			'LLM',
		],
		note: 'Private repository',
	},
	{
		slug: 'cookfood',
		title: 'CookFood',
		need: 'Moving to the US meant cooking for myself every day, and every recipe worth repeating was buried in some saved reel I would never find again. Remembering all of them was never going to happen.',
		built: 'A command line tool that takes a reel URL, pulls the video with yt-dlp, samples frames with FFmpeg, reads them with a vision model, and prints a structured recipe. It refuses to guess: any quantity, time, or temperature it cannot evidence from the video comes back empty rather than invented.',
		tech: ['Python', 'yt-dlp', 'FFmpeg', 'OpenAI Vision', 'Pydantic'],
		note: 'Work in progress',
	},
]
