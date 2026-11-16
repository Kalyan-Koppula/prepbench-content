---
title: The Rendering Pipeline
order: 1
summary: From bytes to pixels — parse, style, layout, paint, composite — plus reflow vs repaint, layout thrashing and script loading.
---

"What happens between receiving HTML and seeing pixels?" is a classic question, and it underpins every performance discussion: why some animations are smooth, why reading `offsetHeight` in a loop is slow, and why scripts block rendering.

## The pipeline

```text
HTML  ──parse──▶ DOM ─┐
                      ├─▶ Style (computed styles) ─▶ Layout ─▶ Paint ─▶ Composite ─▶ pixels
CSS   ──parse──▶ CSSOM┘
```

| Stage | What happens | Triggered by changes to |
|---|---|---|
| Parse | Bytes → tokens → DOM nodes; CSS → CSSOM | New HTML/CSS |
| Style | Match selectors, compute final values for each element | Classes, attributes, inline styles, DOM structure |
| Layout (reflow) | Compute geometry: size and position of each box | Width, height, margin, padding, font, content, viewport |
| Paint | Record draw commands (text, colours, borders, shadows) into layers | Colour, background, shadow, visibility |
| Composite | GPU combines layers, applying transforms and opacity | `transform`, `opacity`, `filter` (on composited layers) |

Each stage feeds the next, so a change early in the pipeline usually forces all later stages.

## Reflow vs repaint

- **Reflow (layout):** geometry changed. Expensive; can cascade to ancestors, siblings and descendants.
- **Repaint:** appearance changed without geometry. Cheaper, but large areas still cost.
- **Composite only:** only layer properties changed. Cheapest; can run on the compositor thread even when the main thread is busy.

| Property changed | Layout | Paint | Composite |
|---|---|---|---|
| `width`, `top`, `margin`, `font-size` | yes | yes | yes |
| `color`, `background-color`, `box-shadow` | no | yes | yes |
| `transform`, `opacity` | no | no | yes |

## Compositor-friendly animation

Animate `transform` and `opacity` instead of `top`/`left`/`width`.

```css
.panel {
  transition: transform 200ms ease;
}
.panel.open {
  transform: translateX(0);
}
.panel:not(.open) {
  transform: translateX(-100%);
}
```

- `will-change: transform` hints that an element should get its own layer ahead of time. Use sparingly: every layer costs GPU memory.
- CSS animations and transitions of `transform`/`opacity` keep running smoothly even if JavaScript blocks the main thread.

## Layout thrashing

Reading a layout property (`offsetHeight`, `getBoundingClientRect()`, `scrollTop`, `getComputedStyle`) after a write forces the browser to compute layout synchronously. Doing it in a loop forces layout on every iteration.

```js
// Thrashing: read, write, read, write...
for (const el of items) {
  el.style.height = `${el.offsetWidth / 2}px`
}

// Batched: all reads, then all writes
const widths = items.map((el) => el.offsetWidth)
items.forEach((el, i) => {
  el.style.height = `${widths[i] / 2}px`
})
```

For animation, read in one frame and write inside `requestAnimationFrame`, or use a read/write scheduling helper. `ResizeObserver` avoids polling for size changes entirely.

## Critical rendering path

The minimum work before first paint: download HTML, build DOM, download and parse **render-blocking CSS**, build CSSOM, run **parser-blocking scripts**, style, layout, paint.

- CSS is render-blocking: the browser won't paint until CSS in `<head>` is loaded, to avoid a flash of unstyled content.
- A classic `<script>` is parser-blocking: parsing stops while it downloads and executes, because the script might `document.write` or read the DOM above it. It also waits for pending CSS, since it might read styles.
- The browser's **preload scanner** looks ahead in the HTML to start fetching images, scripts and CSS early, but it can't find resources injected by JavaScript.

Ways to shorten it:

- Inline critical CSS for above-the-fold content; load the rest without blocking.
- Use `defer` or `type="module"` for scripts.
- Use `media` attributes so non-matching stylesheets (e.g. `print`) don't block.
- Preload the LCP image or a key font with `<link rel="preload">`, and set `fetchpriority="high"` on the LCP image.
- Reserve space for images and embeds (`width`/`height` or `aspect-ratio`) to avoid layout shift.

## `async` vs `defer`

```html
<script src="app.js"></script>                 <!-- blocks parsing -->
<script src="app.js" defer></script>           <!-- fetch in parallel, run after parse, in order -->
<script src="analytics.js" async></script>     <!-- fetch in parallel, run as soon as ready -->
<script type="module" src="main.js"></script>  <!-- deferred by default -->
```

| | Blocks parsing | Execution time | Order preserved |
|---|---|---|---|
| none | Yes | Immediately when reached | Yes |
| `defer` | No | After parsing, before `DOMContentLoaded` | Yes |
| `async` | No (only while executing) | As soon as downloaded | No |
| `type="module"` | No | Like `defer` (or `async` if marked) | Yes |

Use `defer` for app code that needs the DOM; `async` for independent scripts like analytics.

## Page lifecycle events

- `DOMContentLoaded`: DOM fully parsed and deferred scripts executed; images may still be loading.
- `load`: all subresources (images, iframes, stylesheets) finished.
- `pagehide` / `visibilitychange`: the reliable places to save state or send analytics; `unload` is unreliable and blocks the back/forward cache.

## Common interview questions

**What happens when you type a URL and press Enter?**
DNS lookup, TCP + TLS (or QUIC) handshake, HTTP request, response streamed to the parser, DOM and CSSOM built, subresources fetched, style, layout, paint, composite. Mention caching and the preload scanner for bonus points.

**Why are `transform` and `opacity` cheap to animate?**
They don't affect layout or require repainting; the compositor just moves or blends an existing layer on the GPU, often off the main thread.

**What causes a reflow?**
Changing geometry-affecting styles or DOM structure, changing fonts or content, resizing the viewport, and reading layout properties after pending writes (forced synchronous layout).

**Is CSS render-blocking or parser-blocking?**
Render-blocking. It doesn't stop HTML parsing, but it blocks painting and blocks execution of later classic scripts.

**How do you diagnose jank?**
Record in the DevTools Performance panel, look for long tasks and purple "Layout" or "Recalculate Style" blocks, and check for forced reflow warnings. The Rendering tab can highlight paint flashing and layer borders.

**What does `content-visibility: auto` do?**
It lets the browser skip style, layout and paint for off-screen sections until they approach the viewport. Pair with `contain-intrinsic-size` to reserve space.

## Pitfalls

- Animating `top`/`left` or `width` for movement.
- Adding `will-change` to many elements "just in case".
- Interleaving DOM reads and writes in loops.
- Large synchronous scripts in `<head>` without `defer`.
- Images without dimensions causing layout shift (CLS).
