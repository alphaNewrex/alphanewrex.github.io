// Light/dark theme switching. The initial theme is applied by an inline script in
// BaseHead.astro (same storage key and theme names) so it is set before first paint.
export type Mode = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const THEMES: Record<Mode, string> = { light: 'lofi', dark: 'black' };
export const THEME_EVENT = 'themechange';

export function currentMode(): Mode {
	return document.documentElement.dataset.theme === THEMES.dark ? 'dark' : 'light';
}

function savedMode(): Mode | null {
	try {
		const value = localStorage.getItem(STORAGE_KEY);
		return value === 'light' || value === 'dark' ? value : null;
	} catch {
		return null;
	}
}

function apply(mode: Mode) {
	if (currentMode() === mode) return;
	document.documentElement.dataset.theme = THEMES[mode];
	document.dispatchEvent(new CustomEvent<Mode>(THEME_EVENT, { detail: mode }));
}

/** Set the theme explicitly and remember the choice. */
export function setMode(mode: Mode) {
	try {
		localStorage.setItem(STORAGE_KEY, mode);
	} catch {
		// Storage blocked: the choice lasts for this page view.
	}
	apply(mode);
}

/** Follow system changes for visitors who haven't picked a theme themselves. */
export function followSystem() {
	const query = window.matchMedia('(prefers-color-scheme: dark)');
	query.addEventListener('change', (e) => {
		if (!savedMode()) apply(e.matches ? 'dark' : 'light');
	});
}

export function onModeChange(listener: (mode: Mode) => void) {
	document.addEventListener(THEME_EVENT, (e) => listener((e as CustomEvent<Mode>).detail));
}
