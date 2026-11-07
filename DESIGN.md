# Design System

A monochrome, dot-matrix look: ink on paper in light mode, the same in reverse in dark mode, with one orange accent. Everything is defined once in `src/styles/global.css`; components use those tokens and classes, never raw colours.

## Themes

| Mode | daisyUI theme | Set by |
| --- | --- | --- |
| Light | `lofi` | Default, or `localStorage.theme = "light"` |
| Dark | `black` | System preference, or `localStorage.theme = "dark"` |

`<html data-theme>` is set before first paint by the inline script in `BaseHead.astro`. `src/lib/theme.ts` switches it at runtime and fires a `themechange` event. The switch is `ThemeToggle.astro` (round button, top-right).

## Colour tokens

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--ds-page` | `#ffffff` | `#000000` | Page background behind the dot grid |
| `--ds-surface` | `#ffffff` | `#0e0e10` | Boxes, pills, buttons, cards |
| `--ds-surface-sunken` | `#f4f4f5` | `#18181b` | Code blocks, inset areas |
| `--ds-ink` | `#0b0b0c` | `#f4f4f5` | Text, icons, primary button fill |
| `--ds-ink-muted` | `#5b5b63` | `#a1a1aa` | Secondary text, captions, chips |
| `--ds-ink-faint` | `#8e8e96` | `#71717a` | Bullets, dotted lines, hints |
| `--ds-on-ink` | `#ffffff` | `#0b0b0c` | Text on an ink-filled surface |
| `--ds-line` | ink 12% | white 12% | Hairlines, quiet borders |
| `--ds-line-strong` | ink 26% | white 26% | Box, chip and button borders |
| `--ds-dot` | ink 17% | white 16% | The background dot grid |
| `--ds-accent` | `#ff6a3d` | `#ff7a50` | Orange: active states, highlights, markers. Sparingly. |
| `--ds-accent-soft` | accent 14% | accent 16% | Tinted chip background |

daisyUI's `--color-base-100/200/300/content` are mapped onto these, so Tailwind utilities like `bg-base-100` and `text-base-content` follow the system too. Prefer the `--ds-*` tokens in new code.

There is no grey fill for buttons or chips: a control is either ink-filled (`--ds-ink` with `--ds-on-ink` text) or outlined (`--ds-surface` with a `--ds-line-strong` border).

## Shape, depth, motion

| Token | Value | Use |
| --- | --- | --- |
| `--ds-radius-sm` / `-md` / `-lg` | 12 / 16 / 20px | Small cards / mobile boxes / boxes |
| `--ds-radius-pill` | 999px | Buttons, chips, round controls |
| `--ds-shadow-sm` / `-md` / `-lg` | | Resting controls / hover / floating panels |
| `--ds-ease-spring` | `cubic-bezier(0.34, 1.36, 0.64, 1)` | Anything that moves into place |
| `--ds-dur-fast` / `--ds-dur` / `--ds-dur-slow` | 160 / 240 / 420ms | Colour changes / hovers / entrances |
| `--ds-font-mono` | system mono stack | Labels, numbers, dot-matrix UI text |

Respect `prefers-reduced-motion`: drop transforms, keep short opacity fades.

## Components

| Component | How to use |
| --- | --- |
| Box | `<Panel>` (`src/components/Panel.astro`). All page text sits in one; never on the dot grid. `title` adds a plain heading; `tone="ink"` inverts it for a call-to-action. Section pages start with `<PageIntro>`. |
| Button | `class="ds-btn ds-btn--primary"` for the one main action, `ds-btn--secondary` for the rest, `ds-btn--sm` for compact. On an ink box use `ds-btn--inverse` / `ds-btn--inverse-outline`. |
| Chip | `class="ds-chip"` for tags (works on `<a>` too), `ds-chip--solid` for a category label, `ds-chip--accent` for a status note. |
| Round control | `class="ds-icon-btn"`: 56px circle for floating controls (menu top-left, theme top-right, visitor globe bottom-right). Icons inside are dot-matrix SVGs. |
| Link | `class="ds-link"` for inline text links. |
| Muted text | `class="ds-muted"` (`--ds-ink-muted`). Never fade text with `opacity`: it also fades any buttons or links inside. |
| Focus | Every interactive element shows a 2px `--ds-accent` outline on `:focus-visible`. |

## Dot-matrix motifs

- Page background: fixed dot grid (`--dot-pitch` 24px) plus `DotField.astro`, which lights dots near the cursor in the accent colour.
- Icons and mascots are drawn as grids of circles (`PITCH` 6, radius ≈2.1–2.3 in SVG units): the cat (`globe-widget/cat.ts`), the menu's 3×3 icon, the sun/moon theme icon.
- The globe (`cobe`, WebGL) can't read CSS; it keeps a palette per theme in `globe-widget.ts`.

## Don't

- Hardcode `white`, `black`, greys, or hex colours in components (images and the resume's white paper are the exception).
- Use daisyUI's `btn`, `badge`, `link`, or `divider` classes; they bring daisyUI's own greys.
- Add a second accent colour.
