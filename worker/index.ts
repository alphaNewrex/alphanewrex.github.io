// Cloudflare Worker: serves /api/* and leaves everything else to static assets.
// Configured in wrangler.jsonc with run_worker_first: ["/api/*"].

interface D1Statement {
	bind(...values: unknown[]): D1Statement;
	run(): Promise<unknown>;
	all<T>(): Promise<{ results: T[] }>;
	first<T>(): Promise<T | null>;
}
interface Env {
	DB: { prepare(sql: string): D1Statement };
	ASSETS: { fetch(request: Request): Promise<Response> };
}
interface Ctx {
	waitUntil(promise: Promise<unknown>): void;
}
type CfProps = { country?: string; city?: string; latitude?: string; longitude?: string };

const VISITORS_CACHE_SECONDS = 300;
// Cloudflare's codes for Tor and unknown locations; nothing to plot.
const SKIP_COUNTRIES = new Set(['T1', 'XX']);

export default {
	async fetch(request: Request, env: Env, ctx: Ctx): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === '/api/visit') {
			if (request.method !== 'POST') return text('Method not allowed', 405);
			if (!isSameOrigin(request, url)) return text('Forbidden', 403);
			await recordVisit(request, env);
			return new Response(null, { status: 204 });
		}

		if (url.pathname === '/api/visitors') {
			if (request.method !== 'GET') return text('Method not allowed', 405);
			return visitors(request, env, ctx);
		}

		if (url.pathname.startsWith('/api/')) return text('Not found', 404);
		return env.ASSETS.fetch(request);
	},
};

async function recordVisit(request: Request, env: Env) {
	const cf = (request as Request & { cf?: CfProps }).cf ?? {};
	const lat = Number(cf.latitude);
	const lon = Number(cf.longitude);
	if (!cf.country || SKIP_COUNTRIES.has(cf.country) || !Number.isFinite(lat) || !Number.isFinite(lon)) return;

	await env.DB.prepare(
		`INSERT INTO places (country, city, lat, lon, visits) VALUES (?1, ?2, ?3, ?4, 1)
		 ON CONFLICT (country, city) DO UPDATE SET visits = visits + 1`,
	)
		.bind(cf.country, (cf.city ?? '').slice(0, 100), round1(lat), round1(lon))
		.run();
}

async function visitors(request: Request, env: Env, ctx: Ctx): Promise<Response> {
	// Edge-cache the aggregate so D1 is read a few times per 5 minutes, not per open.
	const cache = (caches as unknown as { default: Cache }).default;
	const key = new Request(new URL('/api/visitors', request.url).toString());
	const hit = await cache.match(key);
	if (hit) return hit;

	const [{ results: places }, totals] = await Promise.all([
		env.DB.prepare('SELECT lat, lon, visits FROM places ORDER BY visits DESC LIMIT 2000').all<{
			lat: number;
			lon: number;
			visits: number;
		}>(),
		env.DB.prepare(
			`SELECT COUNT(DISTINCT country) AS countries,
			        SUM(city != '') AS cities,
			        COALESCE(SUM(visits), 0) AS visits
			 FROM places`,
		).first<{ countries: number; cities: number; visits: number }>(),
	]);

	const response = Response.json(
		{ places, countries: totals?.countries ?? 0, cities: totals?.cities ?? 0, visits: totals?.visits ?? 0 },
		{ headers: { 'Cache-Control': `public, max-age=${VISITORS_CACHE_SECONDS}` } },
	);
	ctx.waitUntil(cache.put(key, response.clone()));
	return response;
}

function isSameOrigin(request: Request, url: URL) {
	if (request.headers.get('Sec-Fetch-Site') === 'same-origin') return true;
	const origin = request.headers.get('Origin');
	return origin !== null && origin !== 'null' && new URL(origin).host === url.host;
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const text = (body: string, status: number) => new Response(body, { status });
