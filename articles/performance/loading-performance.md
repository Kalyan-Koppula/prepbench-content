---
title: Loading Performance
order: 2
summary: Shipping less and shipping it sooner — bundle splitting, tree shaking, resource hints, images, fonts, rendering strategies and caching.
---

"How would you make this page load faster?" is open-ended on purpose. Structure your answer: **send less**, **send it sooner**, **send it in the right order**, **don't send it twice** (cache). Then pick the rendering strategy that suits the content.

## The critical rendering path

```text
HTML -> parse -> DOM ----------\
         |                      render tree -> layout -> paint -> composite
         +-> CSS -> CSSOM -----/
         +-> sync <script> blocks parsing until downloaded and executed
```

- CSS is **render-blocking**: no paint until stylesheets in `<head>` arrive.
- Classic `<script>` without `defer`/`async` is **parser-blocking**.
- The **preload scanner** discovers resources in HTML ahead of the parser; anything only referenced from JS or CSS is discovered late.

| Script attribute | Downloads | Executes | Order kept |
|---|---|---|---|
| none | Blocks parser | Immediately | Yes |
| `defer` | In parallel | After parsing, before `DOMContentLoaded` | Yes |
| `async` | In parallel | As soon as downloaded | No |
| `type="module"` | In parallel (deferred by default) | After parsing | Yes |

## Bundle splitting

Goal: the first route downloads only the code it needs.

- **Route-level splitting**: one chunk per route (`lazy(() => import('./routes/Settings'))`, framework file-based routing does this automatically).
- **Component-level splitting**: heavy, conditional UI (rich-text editor, charts, maps, modals).
- **Vendor chunking**: put rarely changing dependencies in their own chunk for better cache hit rates. Don't over-split; dozens of tiny requests add overhead even on HTTP/2/3.
- **Prefetch on intent**: trigger `import()` on hover/focus or when a link enters the viewport.

```ts
const loadEditor = () => import('./RichEditor')
button.addEventListener('pointerenter', loadEditor, { once: true })
button.addEventListener('click', async () => {
  const { RichEditor } = await loadEditor() // already in flight or cached
  RichEditor.mount(container)
})
```

## Tree shaking

Bundlers remove unused exports from **ES modules** by static analysis.

What breaks it:

- CommonJS (`require`, `module.exports`) — not statically analysable.
- Side effects at module top level; mark packages side-effect-free with `"sideEffects": false` in `package.json` (or list files that do have side effects, such as CSS).
- Barrel files re-exporting everything can pull in large graphs, especially with side effects or in dev tooling.
- Importing the whole namespace from libraries that aren't ESM (`import _ from 'lodash'` vs `lodash-es` or per-function imports).

Measure with a bundle analyser (`rollup-plugin-visualizer`, `source-map-explorer`) and set size budgets in CI.

## Resource hints

| Hint | Meaning | Use for |
|---|---|---|
| `<link rel="preconnect" href>` | Do DNS + TCP + TLS now | Critical third-party origins (CDN, font host, API). Limit to 2–4 |
| `<link rel="dns-prefetch" href>` | Resolve DNS only | Cheaper fallback for less critical origins |
| `<link rel="preload" as>` | Fetch this now at high priority, for this page | Late-discovered critical resources: LCP background image, fonts, critical script |
| `<link rel="modulepreload">` | Preload and parse an ES module | Deep import chains |
| `<link rel="prefetch">` | Fetch at low priority for a future navigation | Next route's chunk |
| Speculation Rules (`<script type="speculationrules">`) | Prefetch or prerender whole next pages | Likely next navigations in MPAs (Chromium) |
| `fetchpriority="high" / "low"` | Adjust priority of a specific fetch | LCP image high; below-fold carousel images low |

```html
<link rel="preconnect" href="https://cdn.example.com" crossorigin>
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/hero.avif" as="image" fetchpriority="high">
```

Preload is a promise to use the resource soon; unused preloads waste bandwidth and Chrome warns about them. Fonts need `crossorigin` even on the same origin.

## Images

Images are usually the largest bytes on a page.

- **Format**: AVIF (best compression) or WebP, with JPEG/PNG fallback via `<picture>`. SVG for icons and logos.
- **Responsive sizes**: `srcset` + `sizes` so phones don't download desktop images.
- **Dimensions**: `width`/`height` or `aspect-ratio` to prevent CLS.
- **Lazy loading**: `loading="lazy"` for below-the-fold images; never for the LCP image.
- **Decoding**: `decoding="async"` for non-critical images.
- **CDN transforms**: resize and format negotiation at the edge (`Accept: image/avif`).

```html
<picture>
  <source type="image/avif" srcset="/p-400.avif 400w, /p-800.avif 800w">
  <source type="image/webp" srcset="/p-400.webp 400w, /p-800.webp 800w">
  <img src="/p-800.jpg" srcset="/p-400.jpg 400w, /p-800.jpg 800w"
       sizes="(min-width: 768px) 50vw, 100vw"
       width="800" height="600" loading="lazy" decoding="async" alt="Blue running shoe">
</picture>
```

Video: use `preload="none"` or `metadata`, a poster image, and replace autoplay GIFs with muted looping `<video>`.

## Fonts

| `font-display` | Block period | Swap period | Effect |
|---|---|---|---|
| `block` | ~3 s invisible text | Infinite | FOIT; bad for LCP |
| `swap` | ~0 | Infinite | Fallback shown immediately, swaps when loaded (FOUT, can cause CLS) |
| `fallback` | ~100 ms | ~3 s | Compromise |
| `optional` | ~100 ms | None | Uses the font only if it's ready almost immediately; no late shift |

Font checklist:

- WOFF2 only; subset to needed scripts (`unicode-range`); variable fonts to replace several weights.
- Self-host or `preconnect` to the font origin; preload the one or two most critical files.
- Reduce swap shift with metric-adjusted fallbacks (`size-adjust`, `ascent-override`, `descent-override`).
- Consider system font stacks for UI text.

## Rendering strategies

| Strategy | HTML produced | Pros | Cons | Good for |
|---|---|---|---|---|
| **CSR** (client-side) | Empty shell, JS renders | Simple hosting, rich interactivity | Slow LCP, poor SEO without extra work, big JS | Authenticated dashboards, internal tools |
| **SSR** (per request) | Full HTML on each request | Fresh, personalised, good LCP/SEO | Server cost, TTFB depends on data, hydration cost | Personalised or frequently changing pages |
| **SSG** (build time) | Static HTML at build | Fastest TTFB from CDN, cheap | Stale until rebuild; long builds for many pages | Docs, marketing, blogs |
| **ISR** / revalidation | Static, regenerated in the background after a TTL or on demand | CDN speed with freshness | Some users see stale content; framework-specific | Product catalogues, news |
| **Streaming SSR + RSC** | Shell first, sections streamed | Fast first paint, less client JS | Framework complexity | Mixed static/dynamic pages |
| **Islands / partial hydration** | Static HTML, hydrate only interactive parts | Minimal JS | Cross-island state is harder | Content sites with some widgets |

Hydration is the hidden cost of SSR: the page looks ready but isn't interactive until JS loads and runs, which hurts INP. Reduce it with less client JS, Server Components, islands, or selective hydration.

## Caching strategy

| Resource | Cache-Control | Why |
|---|---|---|
| Hashed static assets (`app.3f9a1c.js`) | `public, max-age=31536000, immutable` | Filename changes when content changes |
| HTML documents | `no-cache` (revalidate each time) or short `s-maxage` + `stale-while-revalidate` on the CDN | Must point at the latest asset hashes |
| API responses | `private, no-store` for user data; `max-age` + `stale-while-revalidate` for public data | Freshness vs speed |
| Images via CDN | Long `max-age` with versioned URLs | Bandwidth |

- **Validation**: `ETag` / `Last-Modified` let the browser get a `304 Not Modified` cheaply.
- **CDN**: cache at the edge close to users; `s-maxage` targets shared caches.
- **Service worker**: offline support and custom strategies (cache-first for assets, network-first for HTML, stale-while-revalidate for API).
- **bfcache**: back/forward navigations restore instantly if the page is eligible; avoid `unload` handlers and `Cache-Control: no-store` on documents where possible.
- **Compression**: Brotli for text assets; pre-compress static files at build time.
- **Protocol**: HTTP/2 or HTTP/3 multiplexing; `103 Early Hints` to start preloads before the HTML is ready.

## Third-party scripts

Often the largest single cost. Audit each one; load with `async`/`defer` or after interaction; self-host where licensing allows; use facades (a static thumbnail instead of a YouTube iframe until clicked); move to a Web Worker (Partytown-style) where feasible.

## Setting a performance budget

A budget turns "make it fast" into a rule that a build can check:

| Budget | Example limit | Enforced by |
| --- | --- | --- |
| JavaScript per route (compressed) | 170 KB | Bundler size checks (size-limit, bundlesize) in CI |
| LCP on a mid-range phone, 4G | 2.5 s | Lighthouse CI against preview deploys |
| Number of third-party origins | 5 | Code review, a CSP allowlist |
| Image weight above the fold | 200 KB | Image CDN settings, linting |

Budgets matter because performance usually regresses one small dependency at a time. A failing CI check at the moment someone adds a 90 KB date library is far cheaper than a later audit.

## Worked example: auditing a slow route

A dashboard's first load takes 6 seconds on a mid-range phone. The steps:

1. **Lighthouse and the Performance panel** (with CPU and network throttling) show 1.4 MB of JavaScript and a 2.3 s long task during hydration.
2. **Bundle analysis** (`vite-bundle-visualizer`, `webpack-bundle-analyzer`, or source-map-explorer) shows a charting library (400 KB), a full icon set (250 KB) and moment.js with all locales (230 KB).
3. **Fixes**:
   - Load the chart with dynamic `import()` when the chart section scrolls into view.
   - Import icons individually so tree shaking can drop the rest.
   - Replace moment with `Intl.DateTimeFormat` or a small library.
   - Split the route so the settings panel's code isn't in the dashboard bundle.
4. **Result**: 380 KB of JavaScript on first load, the hydration long task under 300 ms, and the page interactive in about 2 seconds.

The lesson: the biggest wins usually come from **not shipping** code, before any micro-optimisation.

## Priorities and the network

Browsers assign each request a priority. HTML, CSS in the head and synchronous scripts are highest; images start low and are raised when they turn out to be in the viewport; `async` and `defer` scripts are lower. You can influence this:

```html
<img src="/hero.avif" fetchpriority="high" alt="…" />          <!-- the LCP image -->
<img src="/carousel-2.avif" fetchpriority="low" alt="…" />     <!-- not visible yet -->
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />
<script src="/analytics.js" defer fetchpriority="low"></script>
```

Use priority hints sparingly: if everything is high priority, nothing is. `preload` everything that the HTML can't reveal early (fonts in CSS, the LCP image in JavaScript-rendered markup), and nothing else.

## The 103 Early Hints response

While the server is still generating the HTML (querying the database, rendering), it can send an informational `103 Early Hints` response with `Link: </app.css>; rel=preload; as=style` headers. The browser starts downloading critical resources during the server's think time, which directly reduces LCP on dynamically rendered pages. CDNs can generate these hints automatically from previous responses.

## Common interview questions

**`defer` vs `async`?**
Both download in parallel. `defer` executes in order after parsing finishes; `async` executes as soon as it arrives, in any order. Use `defer` for app code, `async` for independent scripts like analytics.

**`preload` vs `prefetch`?**
Preload is for the current page, high priority. Prefetch is for a likely future navigation, low priority and idle.

**Why doesn't tree shaking remove this library?**
It's CommonJS, has top-level side effects without a `sideEffects` declaration, or is imported in a way that pulls the whole module graph.

**SSR vs SSG vs ISR?**
SSR renders per request (fresh, costlier, slower TTFB); SSG at build (fastest, possibly stale); ISR serves static pages and regenerates them in the background on a schedule or trigger.

**How do you cache a SPA correctly?**
Content-hashed assets cached forever and immutable; the HTML revalidated every time so it can reference new hashes.

**How would you load a font without hurting LCP or CLS?**
WOFF2, subset, preload the critical file, `font-display: swap` or `optional`, and metric-matched fallbacks to minimise shift.

## Pitfalls

- Long `max-age` on HTML (users stuck on old asset references).
- Preloading everything, so nothing is prioritised.
- Lazy loading above-the-fold images.
- One giant vendor chunk invalidated by any dependency bump.
- SSR with a huge hydration bundle: fast paint, slow interactivity.

## Key takeaways

- Shorten the critical path: small HTML, critical CSS early, deferred scripts.
- Ship less JavaScript: split by route and interaction, tree-shake, replace heavy dependencies.
- Images and fonts are usually the heaviest bytes: modern formats, correct sizes, `fetchpriority` for the LCP image, `font-display`.
- Choose rendering strategies (SSR, SSG, streaming) by how dynamic the content is.
- Cache fingerprinted assets forever; set budgets and enforce them in CI.
