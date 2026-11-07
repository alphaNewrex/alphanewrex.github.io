// Projects shown on /projects.
//
// Each entry leads with `need` — the problem that actually prompted the build.
//
// Screenshots are optional and attach by convention: drop an image at
// `src/images/projects/<slug>.{png,jpg,jpeg,webp}` and it appears on the card.
// No edit here required.
//
// `github` is optional: a repo or org URL. Omit it only for code that is not on GitHub.

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
		built: 'An agent that detects each company\u2019s ATS platform and generates its scraper configuration, supporting 8 ATS providers across 1,288 companies. Event-driven ingestion pipelines built on Celery, Redis Streams, and pgvector handle enrichment, change detection, and semantic job deduplication.',
		tech: [
			'Go',
			'chi',
			'PostgreSQL',
			'pgvector',
			'Python',
			'Celery',
			'Redis Streams',
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
		built: 'An autonomous assessment-generation agent that produces GRE-style questions, quizzes, and full-length exams across 3 question types: text completion, sentence equivalence, and reading comprehension. A Python and LangChain pipeline with schema-based quality validation and stateful async workers sits behind a Go/Gin REST API, MongoDB, and a Next.js frontend.',
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
			'LangChain',
			'LLM',
		],
		github: 'https://github.com/VerbalForge',
	},
	{
		slug: 'werecooked',
		title: 'We\u2019re Cooked!',
		need: 'Moving to the US meant cooking for myself every day, and every recipe worth repeating was buried in some saved reel I would never find again. Remembering all of them was never going to happen.',
		built: 'A smart kitchen inventory that knows what is already in my pantry, suggests ranked recipes from it, and shows each recipe with what I have, what I still need, live Kroger prices for the missing items, and the cooking steps. Alongside it, a reel-to-recipe CLI takes a reel URL, pulls the video with yt-dlp, samples frames with FFmpeg, reads them with a vision model, and returns a structured recipe. It refuses to guess: any quantity, time, or temperature it cannot evidence from the video comes back empty rather than invented.',
		tech: ['Expo', 'React Native', 'TypeScript', 'NativeWind', 'AI SDK', 'Zod', 'Kroger API', 'Python', 'yt-dlp', 'FFmpeg', 'Pydantic'],
		github: 'https://github.com/alphaNewrex/werecooked',
	},
]
