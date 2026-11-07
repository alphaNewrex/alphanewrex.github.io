import type { COBEOptions, Globe, Marker } from 'cobe';
import { currentMode, onModeChange, type Mode } from '../../lib/theme';

// cobe draws in WebGL, so its colours can't come from CSS; one palette per site theme.
const GLOBE_PALETTE: Record<Mode, Pick<COBEOptions, 'dark' | 'diffuse' | 'mapBrightness' | 'baseColor' | 'glowColor'>> = {
	light: { dark: 0, diffuse: 0.9, mapBrightness: 9, baseColor: [1, 1, 1], glowColor: [0.94, 0.94, 0.94] },
	dark: { dark: 1, diffuse: 1.6, mapBrightness: 7, baseColor: [0.4, 0.4, 0.4], glowColor: [0.16, 0.16, 0.16] },
};

// --- Spin physics (radians per second) -------------------------------------
const IDLE_SPEED = 0.25; // one lazy turn every ~25 s
const MAX_SPEED = 28;
const IMPULSE = 1.6; // speed added by a single boop
const COMBO_WINDOW_MS = 450; // boops closer than this build a combo
const COMBO_STEP = 0.5;
const COMBO_MAX = 4;
const DECAY_SECONDS = 1.3; // time constant for easing back to idle
const DIZZY_ON = 14;
const DIZZY_OFF = 6;
const REDUCED_MOTION_STEP = Math.PI / 6;

const VISIT_KEY = 'gw-last-visit';
// Raw clicks only; the combo multiplier affects spin speed, never this count.
const BPS_BEST_KEY = 'gw-best-bps';
const BPS_WINDOW_MS = 3000;
const BPS_MIN_BOOPS = 4;
const BPS_MAX = 20; // ignore impossible bursts (e.g. synthetic double events)

function readBest() {
	try {
		return Number(localStorage.getItem(BPS_BEST_KEY)) || 0;
	} catch {
		return 0;
	}
}

function saveBest(value: number) {
	try {
		localStorage.setItem(BPS_BEST_KEY, String(value));
	} catch {
		// Storage blocked: the best score just lasts for this visit.
	}
}

type VisitorPlace = { lat: number; lon: number; visits: number };
type VisitorData = { places: VisitorPlace[]; countries: number; cities: number; visits: number };

const SAMPLE_DATA: VisitorData = {
	places: [
		{ lat: 19.1, lon: 72.9, visits: 40 },
		{ lat: 37.8, lon: -122.4, visits: 18 },
		{ lat: 51.5, lon: -0.1, visits: 9 },
		{ lat: 52.5, lon: 13.4, visits: 5 },
		{ lat: 35.7, lon: 139.7, visits: 7 },
		{ lat: -33.9, lon: 151.2, visits: 3 },
		{ lat: 1.3, lon: 103.8, visits: 4 },
		{ lat: 40.7, lon: -74.0, visits: 12 },
	],
	countries: 7,
	cities: 8,
	visits: 98,
};

export function initGlobeWidget() {
	const root = document.querySelector<HTMLElement>('[data-gw]');
	if (!root || root.dataset.ready) return;
	root.dataset.ready = '1';

	recordVisit();

	const launcher = root.querySelector<HTMLButtonElement>('.gw-launcher')!;
	const panel = root.querySelector<HTMLElement>('.gw-panel')!;
	const closeButton = root.querySelector<HTMLButtonElement>('.gw-close')!;
	const comboLabel = root.querySelector<HTMLElement>('.gw-combo')!;
	const meterDots = [...root.querySelectorAll<HTMLElement>('.gw-meter-dots i')];
	const canvas = root.querySelector<HTMLCanvasElement>('.gw-globe')!;
	const cat = root.querySelector<HTMLButtonElement>('.gw-cat')!;
	const tail = root.querySelector<SVGGElement>('.gw-tail')!;
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

	let globe: Globe | null = null;
	let loading: Promise<void> | null = null;
	let open = false;
	let frame = 0;
	let lastTime = 0;

	let phi = 0;
	let targetPhi = 0; // reduced-motion mode eases toward this instead of spinning
	let speed = IDLE_SPEED;
	let combo = 1;
	let lastBoop = 0;
	let tailPhase = 0;
	let dizzy = false;
	let swipeTimer = 0;
	let blinkTimer = 0;
	let comboTimer = 0;
	let litDots = -1;

	// Hidden boops-per-second counter under the spin meter.
	const bpsBox = root.querySelector<HTMLElement>('.gw-bps')!;
	const bpsValue = root.querySelector<HTMLElement>('[data-bps]')!;
	const bpsBestValue = root.querySelector<HTMLElement>('[data-bps-best]')!;
	let boopTimes: number[] = [];
	let bpsShown = 0; // eased toward the live rate so the number rolls instead of jumping
	let bpsDrawn = '';
	let bpsBest = readBest();
	let recordTimer = 0;
	bpsBestValue.textContent = bpsBest.toFixed(1);

	function setOpen(next: boolean) {
		open = next;
		root!.classList.toggle('is-open', open);
		launcher.setAttribute('aria-expanded', String(open));
		panel.setAttribute('aria-hidden', String(!open));
		panel.inert = !open;
		if (open) {
			ensureGlobe().then(() => cat.focus({ preventScroll: true }));
			start();
			scheduleBlink();
		} else {
			window.clearTimeout(blinkTimer);
			// Let the close transition finish before the loop stops.
			window.setTimeout(() => !open && stop(), 320);
		}
	}

	function ensureGlobe() {
		if (!loading) {
			loading = Promise.all([import('cobe'), loadVisitors()]).then(([{ default: createGlobe }, data]) => {
				// Size the drawing buffer from the CSS layout size (offsetWidth ignores
				// the open animation's scale transform).
				const size = Math.round(canvas.offsetWidth * Math.min(window.devicePixelRatio || 1, 2));
				canvas.width = canvas.height = size;
				globe = createGlobe(canvas, {
					devicePixelRatio: 1, // size above already includes the pixel ratio
					width: size,
					height: size,
					phi,
					theta: 0.25,
					...GLOBE_PALETTE[currentMode()],
					mapSamples: 8000,
					mapBaseBrightness: 0,
					markerColor: [1, 0.42, 0.24],
					markers: toMarkers(data?.places ?? []),
					markerElevation: 0.02,
				});
				requestAnimationFrame(() => canvas.classList.add('is-ready'));
				showStats(data);
			});
		}
		return loading;
	}

	function boop() {
		const now = performance.now();
		combo = now - lastBoop < COMBO_WINDOW_MS ? Math.min(combo + COMBO_STEP, COMBO_MAX) : 1;
		lastBoop = now;
		boopTimes.push(now);
		bpsBox.classList.add('is-found');

		if (reducedMotion.matches) {
			targetPhi += REDUCED_MOTION_STEP;
		} else {
			speed = Math.min(speed + IMPULSE * combo, MAX_SPEED);
		}

		// Restart the paw swipe even if one is mid-flight.
		cat.classList.remove('is-swiping');
		void cat.getBoundingClientRect();
		cat.classList.add('is-swiping');
		window.clearTimeout(swipeTimer);
		swipeTimer = window.setTimeout(() => cat.classList.remove('is-swiping'), 240);

		comboLabel.textContent = `×${combo % 1 ? combo.toFixed(1) : combo}`;
		comboLabel.classList.remove('is-bumped');
		void comboLabel.getBoundingClientRect();
		comboLabel.classList.add('is-bumped');
		window.clearTimeout(comboTimer);
		comboTimer = window.setTimeout(() => comboLabel.classList.remove('is-bumped'), 160);
	}

	function tick(time: number) {
		// Cap dt so returning to a background tab doesn't jump the globe.
		const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
		lastTime = time;

		if (reducedMotion.matches) {
			speed = 0;
			phi += (targetPhi - phi) * (1 - Math.exp(-dt / 0.12));
		} else {
			// Exponential ease back to idle; frame-rate independent.
			speed = IDLE_SPEED + (speed - IDLE_SPEED) * Math.exp(-dt / DECAY_SECONDS);
			phi += speed * dt;
			targetPhi = phi;
		}
		globe?.update({ phi });

		// Tail wags faster as the globe speeds up. Phase accumulates so the
		// frequency can change without the tail jumping.
		const wagHz = 0.6 + Math.min(speed, MAX_SPEED) * 0.18;
		tailPhase += dt * wagHz * Math.PI * 2;
		const wagDeg = (reducedMotion.matches ? 0 : 10 + Math.min(speed, 12)) * Math.sin(tailPhase);
		tail.style.transform = `rotate(${wagDeg.toFixed(2)}deg)`;

		const nextDizzy = dizzy ? speed > DIZZY_OFF : speed > DIZZY_ON;
		if (nextDizzy !== dizzy) {
			dizzy = nextDizzy;
			cat.classList.toggle('is-dizzy', dizzy);
		}

		// Spin meter: only touch the DOM when the lit count changes.
		const level = reducedMotion.matches
			? 0
			: Math.round(((speed - IDLE_SPEED) / (MAX_SPEED - IDLE_SPEED)) * meterDots.length);
		if (level !== litDots) {
			litDots = level;
			const hotFrom = Math.ceil(meterDots.length * 0.66);
			meterDots.forEach((dot, i) => {
				dot.classList.toggle('is-on', i < level && i < hotFrom);
				dot.classList.toggle('is-hot', i < level && i >= hotFrom);
			});
			if (level === 0) comboLabel.textContent = '×1';
		}

		updateBps(time, dt);
		frame = requestAnimationFrame(tick);
	}

	function updateBps(now: number, dt: number) {
		// Clicks per second over the last few seconds; it falls back to 0 once you stop.
		boopTimes = boopTimes.filter((t) => now - t < BPS_WINDOW_MS);
		const span = boopTimes.length > 1 ? now - boopTimes[0] : 0;
		const live = span > 0 ? Math.min(((boopTimes.length - 1) / span) * 1000, BPS_MAX) : 0;
		bpsShown += (live - bpsShown) * (1 - Math.exp(-dt / 0.2));
		const text = bpsShown < 0.05 ? '0.0' : bpsShown.toFixed(1);
		if (text !== bpsDrawn) {
			bpsDrawn = text;
			bpsValue.textContent = text;
		}
		// Only count a best once a few boops make the rate meaningful.
		const liveRounded = Math.round(live * 10) / 10;
		if (boopTimes.length >= BPS_MIN_BOOPS && liveRounded > bpsBest) {
			bpsBest = liveRounded;
			bpsBestValue.textContent = bpsBest.toFixed(1);
			saveBest(bpsBest);
			bpsBox.classList.add('is-record');
			window.clearTimeout(recordTimer);
			recordTimer = window.setTimeout(() => bpsBox.classList.remove('is-record'), 1200);
		}
	}

	function showStats(data: VisitorData | null) {
		const format = new Intl.NumberFormat();
		for (const key of ['visits', 'countries', 'cities'] as const) {
			const el = root!.querySelector<HTMLElement>(`[data-stat="${key}"]`);
			if (el) countUp(el, data ? data[key] : null, format);
		}
	}

	function start() {
		if (frame || document.hidden) return;
		lastTime = 0;
		frame = requestAnimationFrame(tick);
	}

	function stop() {
		cancelAnimationFrame(frame);
		frame = 0;
	}

	function scheduleBlink() {
		window.clearTimeout(blinkTimer);
		blinkTimer = window.setTimeout(() => {
			if (!open) return;
			cat.classList.add('is-blinking');
			window.setTimeout(() => cat.classList.remove('is-blinking'), 130);
			scheduleBlink();
		}, 2500 + Math.random() * 3500);
	}

	onModeChange((mode) => globe?.update({ ...GLOBE_PALETTE[mode], phi }));

	launcher.addEventListener('click', () => setOpen(!open));
	closeButton.addEventListener('click', () => {
		setOpen(false);
		launcher.focus();
	});
	cat.addEventListener('click', boop);
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && open) {
			setOpen(false);
			launcher.focus();
		}
	});
	document.addEventListener('pointerdown', (e) => {
		if (open && !root.contains(e.target as Node)) setOpen(false);
	});
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) stop();
		else if (open) start();
	});
}

function toMarkers(places: VisitorPlace[]): Marker[] {
	const most = Math.max(1, ...places.map((p) => p.visits));
	return places.map((p) => ({
		location: [p.lat, p.lon],
		// Log scale so one busy city doesn't drown out everyone else.
		size: 0.025 + 0.045 * (Math.log1p(p.visits) / Math.log1p(Math.max(most, 50))),
	}));
}

// Numbers tick up from zero when the panel first fills in.
function countUp(el: HTMLElement, value: number | null, format: Intl.NumberFormat) {
	if (value === null) {
		el.textContent = '–';
		return;
	}
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		el.textContent = format.format(value);
		return;
	}
	const duration = 900;
	const startTime = performance.now();
	const step = (now: number) => {
		const t = Math.min((now - startTime) / duration, 1);
		const eased = 1 - Math.pow(1 - t, 3);
		el.textContent = format.format(Math.round(value * eased));
		if (t < 1) requestAnimationFrame(step);
	};
	requestAnimationFrame(step);
}

async function loadVisitors(): Promise<VisitorData | null> {
	try {
		const res = await fetch('/api/visitors');
		if (!res.ok) throw new Error(String(res.status));
		return (await res.json()) as VisitorData;
	} catch {
		// `astro dev` has no Worker behind it; show sample points so the UI is workable.
		return import.meta.env.DEV ? SAMPLE_DATA : null;
	}
}

// Count each browser at most once per day. No cookies, nothing identifying is sent.
function recordVisit() {
	if (import.meta.env.DEV) return;
	try {
		const today = new Date().toISOString().slice(0, 10);
		if (localStorage.getItem(VISIT_KEY) === today) return;
		if (navigator.sendBeacon('/api/visit')) localStorage.setItem(VISIT_KEY, today);
	} catch {
		// Storage blocked (private mode etc.): skip counting rather than double count.
	}
}
