---
title: Responsive Design
order: 4
summary: Mobile-first CSS, media vs container queries, fluid type with clamp, responsive images and choosing the right units.
---

Responsive design questions range from "how do you make this work on mobile?" to detailed follow-ups on container queries, `srcset`/`sizes` and units. Show that you design for content and containers, not a list of device widths.

## Mobile-first

Write base styles for the smallest screen, then add complexity with `min-width` queries.

```css
.grid {
  display: grid;
  gap: 1rem;
}

@media (width >= 48rem) {
  .grid { grid-template-columns: 1fr 1fr; }
}

@media (width >= 75rem) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}
```

Why mobile-first:

- Small screens get the simplest CSS with fewer overrides.
- Forces prioritising content.
- Progressive enhancement: larger screens add layout rather than undo it.

Choose breakpoints where the **content** breaks, not at specific device widths. The range syntax (`width >= 48rem`) is supported in all modern browsers and is clearer than `min-width`.

The viewport meta tag is required for mobile browsers to use device width instead of a ~980px virtual viewport:

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

## Media queries vs container queries

| | Media queries | Container queries |
|---|---|---|
| Responds to | Viewport (and device features) | Size of a containing element |
| Good for | Page-level layout, user preferences | Reusable components placed in different-width slots |
| Setup | None | `container-type` on an ancestor |
| Units | `vw`, `vh` | `cqi`, `cqb`, `cqw`, `cqh` (container-relative) |

```css
.card-slot {
  container-type: inline-size;
  container-name: card;
}

.card {
  display: grid;
  gap: 0.75rem;
}

@container card (inline-size >= 30rem) {
  .card {
    grid-template-columns: 8rem 1fr; /* image beside text when the slot is wide */
  }
}

.card h2 {
  font-size: clamp(1rem, 4cqi, 1.5rem); /* scales with the container */
}
```

- `container-type: inline-size` applies size containment on the inline axis; the container can't size itself from its children's width, so it must get its width from its own context (usually fine for block-level elements).
- A container query styles the container's descendants, never the container itself.
- Style queries (`@container style(--variant: compact)`) let components react to custom property values; check support before relying on them.

### Media features beyond width

```css
@media (prefers-color-scheme: dark) { :root { --bg: #111; --fg: #eee; } }
@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; transition: none !important; } }
@media (hover: hover) and (pointer: fine) { .row:hover { background: var(--hover); } }
@media (pointer: coarse) { .button { min-height: 44px; } }
@media (orientation: landscape) { /* ... */ }
```

`hover` and `pointer` target input capabilities rather than guessing from screen size.

## Fluid typography and spacing

```css
:root {
  --step-0: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);
  --step-3: clamp(1.75rem, 1.2rem + 2.5vw, 3rem);
  --space-m: clamp(1rem, 0.8rem + 1vw, 1.5rem);
}

body { font-size: var(--step-0); }
h1 { font-size: var(--step-3); }
```

- `clamp(min, preferred, max)` scales smoothly between bounds without breakpoints.
- Always mix a `rem` term into the preferred value (`1.2rem + 2.5vw`). Pure `vw` font sizes don't respond to user zoom and font-size settings, which fails WCAG resize-text requirements.
- `min()` and `max()` help with widths: `width: min(100% - 2rem, 70ch)` gives a centred readable column with gutters.

## Responsive images

### Resolution switching: same image, different sizes

```html
<img
  src="photo-800.jpg"
  srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1600.jpg 1600w"
  sizes="(width >= 64rem) 50vw, 100vw"
  width="1600"
  height="1067"
  alt="Team at the offsite"
  loading="lazy"
  decoding="async" />
```

- `srcset` with `w` descriptors lists available files and their intrinsic widths.
- `sizes` tells the browser how wide the image will **render** at each viewport size, so it can choose before layout. Without `sizes`, the browser assumes `100vw`.
- The browser picks a candidate based on rendered width × device pixel ratio, and may also consider network conditions.
- For fixed-size images (avatars), use `x` descriptors: `srcset="a.png 1x, a@2x.png 2x"`.
- `width` and `height` attributes let the browser reserve space via an aspect ratio, preventing layout shift.
- Don't lazy-load the LCP image; give it `fetchpriority="high"` instead.

### Art direction and formats: `<picture>`

```html
<picture>
  <source media="(width < 40rem)" srcset="hero-portrait.avif" type="image/avif" />
  <source srcset="hero-wide.avif" type="image/avif" />
  <source srcset="hero-wide.webp" type="image/webp" />
  <img src="hero-wide.jpg" alt="Product on a desk" width="1600" height="900" />
</picture>
```

The first matching `<source>` wins; `<img>` is required and carries `alt`, sizing and loading attributes.

### CSS images

```css
.hero {
  background-image: image-set(url('hero.avif') type('image/avif'), url('hero.jpg') type('image/jpeg'));
  aspect-ratio: 16 / 9;
  background-size: cover; /* object-fit: cover is the <img>/<video> equivalent */
}
```

## Units

| Unit | Relative to | Use for |
|---|---|---|
| `px` | CSS pixel | Borders, hairlines, small fixed details |
| `rem` | Root font size | Type, spacing, breakpoints — respects user settings |
| `em` | Element's font size | Padding that scales with a component's text, icon sizes |
| `%` | Containing block (property-dependent) | Fluid widths |
| `vw` / `vh` | Viewport | Full-bleed sections, fluid type terms |
| `dvh` / `svh` / `lvh` | Dynamic / small / large viewport | Mobile full-height layouts that respect toolbars |
| `ch` | Width of "0" in the font | Readable line length (`max-width: 65ch`) |
| `cqi` / `cqb` | Container inline / block size | Sizing inside container queries |
| `fr` | Free space in a grid | Grid tracks |

`vw` includes the vertical scrollbar width on desktop, so `width: 100vw` can cause horizontal overflow; use `100%` instead.

## Logical properties

Use `margin-inline`, `padding-block`, `inset-inline-start`, `border-inline-end` instead of left/right/top/bottom so layouts adapt to RTL and vertical writing modes automatically.

## Worked example: a product card that adapts to its container

The same card appears in a narrow sidebar and a wide main column. Media queries can't tell those apart (the viewport is the same); container queries can:

```css
.card-slot {
  container-type: inline-size; /* this element's width can be queried */
  container-name: card;
}

.card {
  display: grid;
  gap: 0.75rem;
  grid-template-areas:
    'image'
    'body';
}

@container card (min-width: 420px) {
  .card {
    grid-template-columns: 160px 1fr;
    grid-template-areas: 'image body';
  }
}

@container card (min-width: 700px) {
  .card {
    grid-template-columns: 240px 1fr auto;
    grid-template-areas: 'image body actions';
  }
  .card__title { font-size: clamp(1.25rem, 4cqi, 1.75rem); } /* cqi: 1% of the container's inline size */
}
```

| Container width | Layout |
| --- | --- |
| < 420px (sidebar, phone) | Image stacked above text |
| 420–699px | Image beside text |
| ≥ 700px | Image, text and an actions column |

The component carries its own responsive rules and works wherever it's placed. Media queries remain the right tool for page-level decisions: the overall grid, navigation style, and preferences like `prefers-reduced-motion` and `prefers-color-scheme`.

## Viewport units on mobile

On phones, the browser's address bar slides in and out, so "the viewport height" has three meanings:

| Unit | Height used | Good for |
| --- | --- | --- |
| `svh` | Small viewport: bars shown | Content that must be fully visible, like a hero's call to action |
| `lvh` | Large viewport: bars hidden | Backgrounds that may extend under the bars |
| `dvh` | Dynamic: changes as the bars move | Full-height app shells (can cause relayout while scrolling) |
| `vh` | Historically equal to `lvh` on mobile | The source of the "100vh is taller than the screen" bug |

`min-height: 100svh` is the safe default for a full-screen section. The same small/large/dynamic prefixes exist for widths (`svw`), and `vi`/`vb` follow the writing direction.

## User preferences

Responsive design also means responding to the user's settings, not only the screen:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

:root { color-scheme: light dark; }
.surface { background: light-dark(#ffffff, #111827); }

@media (prefers-contrast: more) {
  .button { border: 2px solid currentColor; }
}

@media (hover: hover) and (pointer: fine) {
  .row-actions { opacity: 0; }
  .row:hover .row-actions, .row:focus-within .row-actions { opacity: 1; }
}
```

The last rule hides secondary actions until hover **only** on devices that can hover; on touch screens they stay visible, because there is no hover to reveal them.

## Testing responsive layouts

- Use DevTools device mode, but also drag the viewport through every width: bugs live between breakpoints.
- Zoom to 200% and 400% (WCAG reflow): content should reflow into one column without horizontal scrolling.
- Increase the browser's default font size; layouts sized in `rem` should scale, fixed `px` heights will clip.
- Test real devices for touch targets (at least 24×24 CSS pixels, ideally 44×44), safe areas on notched phones (`env(safe-area-inset-*)`), and the on-screen keyboard covering inputs.

## Common interview questions

**Media query or container query?**
Media queries for page-level layout and user preferences; container queries for components that appear in containers of varying width, like a card in a sidebar versus a main column.

**What does `sizes` do and why is it needed?**
It tells the browser the image's rendered width at each breakpoint before CSS layout runs, so it can pick the right file from `srcset`. Without it, the browser assumes full viewport width and may download an oversized image.

**`rem` vs `em`?**
`rem` is relative to the root font size and is predictable everywhere. `em` is relative to the current element's font size, so it compounds when nested; useful when spacing should scale with a component's text.

**Why avoid `100vh` on mobile?**
Mobile browser toolbars change the visible height. `100vh` equals the largest viewport, so content gets hidden under toolbars. Use `100dvh` or `100svh`.

**How do you make typography fluid but accessible?**
Use `clamp()` with a `rem`-based minimum and maximum and a preferred value that mixes `rem` and `vw`, so it scales with the viewport and still respects user zoom.

**How do you test responsive layouts?**
DevTools device mode at many widths (not just presets), real devices for touch and toolbars, zoom to 200% and 400% for reflow, and container resizing for components.

## Pitfalls

- Missing viewport meta tag.
- Device-specific breakpoints instead of content-based ones.
- `max-width` desktop-first queries layered with many overrides.
- Fixed `px` font sizes that ignore user preferences.
- Images without `width`/`height`, causing layout shift.
- Hiding content on mobile with `display: none` instead of rethinking the layout.

## Key takeaways

- Write mobile-first: base styles for small screens, `min-width` queries to enhance.
- Media queries respond to the viewport and user preferences; container queries respond to the space a component actually has.
- `clamp()` with viewport or container units gives fluid type and spacing without breakpoints.
- Serve responsive images with `srcset`/`sizes` or `<picture>`, always with dimensions or `aspect-ratio`.
- Use `rem` for type, `svh`/`dvh` instead of `vh` on mobile, and logical properties for direction-agnostic layouts.
- Respect `prefers-reduced-motion`, colour scheme and pointer capabilities.
