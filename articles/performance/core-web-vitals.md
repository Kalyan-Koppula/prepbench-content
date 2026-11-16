---
title: Core Web Vitals
order: 1
summary: LCP, INP and CLS — what each measures, the thresholds, the usual causes and fixes, and why field data beats lab data.
---

Core Web Vitals are Google's user-centric metrics for loading, responsiveness and visual stability. They feed into search ranking and are the shared vocabulary for performance discussions, so interviewers expect you to define each precisely and diagnose a bad score.

## The three metrics

| Metric | Measures | Good | Needs improvement | Poor |
|---|---|---|---|---|
| **LCP** — Largest Contentful Paint | Loading: when the largest image or text block in the viewport renders | ≤ 2.5 s | ≤ 4.0 s | > 4.0 s |
| **INP** — Interaction to Next Paint | Responsiveness: latency from user input to the next frame, across the visit | ≤ 200 ms | ≤ 500 ms | > 500 ms |
| **CLS** — Cumulative Layout Shift | Visual stability: unexpected movement of visible content | ≤ 0.1 | ≤ 0.25 | > 0.25 |

A page "passes" when the **75th percentile** of real page loads is in the good range, measured separately for mobile and desktop.

INP replaced **FID** (First Input Delay) as a Core Web Vital in March 2024. FID only measured the input delay of the first interaction; INP covers every interaction and the full latency to paint.

Supporting (non-core) metrics: **TTFB** (server response), **FCP** (first content painted), **TBT** (lab proxy for responsiveness).

## LCP

LCP candidates: `<img>`, `<image>` in SVG, `<video>` poster or first frame, elements with a CSS `background-image` loaded via `url()`, and block-level text. The candidate can change during load; the last one before user input wins.

Break LCP into four sub-parts and fix the biggest:

| Sub-part | What it is | Typical fix |
|---|---|---|
| TTFB | Time to first byte of HTML | CDN, edge caching, faster backend, avoid redirects |
| Resource load delay | TTFB until the LCP resource *starts* downloading | Make it discoverable in HTML, `fetchpriority="high"`, preload |
| Resource load duration | Download time | Smaller, modern formats (AVIF/WebP), responsive `srcset`, CDN |
| Element render delay | Downloaded until painted | Remove render-blocking CSS/JS, avoid client-side rendering of the hero |

Common causes:

- Hero image lazy-loaded (`loading="lazy"` on above-the-fold images delays LCP).
- Hero image referenced only from CSS or injected by JavaScript, so the preload scanner can't find it.
- Client-side rendered page: nothing meaningful paints until JS downloads, parses and fetches data.
- Render-blocking stylesheets and synchronous scripts in `<head>`.
- Web fonts hiding text (`font-display: block`) when the LCP element is text.

```html
<!-- LCP hero image: discoverable, prioritised, sized -->
<img src="/hero-1200.avif"
     srcset="/hero-800.avif 800w, /hero-1200.avif 1200w, /hero-2000.avif 2000w"
     sizes="100vw" width="1200" height="600"
     fetchpriority="high" alt="Product on a desk">
```

## INP

An interaction's latency has three phases:

```text
input delay          processing time            presentation delay
|---- main thread ---|---- your event handlers ---|--- style, layout, paint ---|
 busy with other work                              until the next frame shows
```

INP is (roughly) the worst interaction latency on the page; with many interactions, a high percentile is used so one outlier doesn't dominate.

Common causes and fixes:

| Cause | Fix |
|---|---|
| Long tasks on the main thread when the user clicks (hydration, third-party scripts, analytics) | Break up work, defer non-critical scripts, reduce hydration cost |
| Heavy event handler | Do the minimum to update UI, then yield; move the rest to later or a Worker |
| Large re-render after input | Narrow state updates, memoise, virtualise, React transitions |
| Expensive layout after DOM change | Smaller DOM, `content-visibility`, avoid forced synchronous layout |
| Layout thrashing (read-write-read loops) | Batch reads before writes |

Yield to the main thread so the browser can paint feedback first:

```ts
function yieldToMain(): Promise<void> {
  if ('scheduler' in globalThis && 'yield' in scheduler) return scheduler.yield()
  return new Promise((resolve) => setTimeout(resolve, 0))
}

async function onSubmit() {
  showSpinner()               // cheap visual feedback
  await yieldToMain()         // let the browser paint
  runExpensiveValidation()
  sendAnalytics()
}
```

`scheduler.yield()` continues ahead of other queued tasks; `setTimeout(0)` is the fallback. In React, `startTransition` / `useDeferredValue` mark updates as interruptible.

## CLS

A layout shift happens when a visible element changes position between frames without a recent user input (shifts within 500 ms of a tap, click or keypress are excluded). Score per shift = impact fraction × distance fraction. CLS is the **largest session window** of shifts (bursts with gaps under 1 s, capped at 5 s), not the sum over the whole visit.

| Cause | Fix |
|---|---|
| Images/videos/iframes without dimensions | `width`/`height` attributes or CSS `aspect-ratio` |
| Ads, embeds, banners injected above content | Reserve space with `min-height`; insert below the fold |
| Web fonts swapping and reflowing text | `font-display: optional` or metric-matched fallbacks (`size-adjust`, `ascent-override`) |
| Content inserted above existing content after fetch | Skeletons with the final size; append below or on user action |
| Animating `top`/`left`/`height` | Animate `transform` and `opacity` instead |

```css
img, video { max-width: 100%; height: auto; } /* with width/height attrs, browser reserves aspect ratio */
.ad-slot { min-height: 250px; }
@font-face {
  font-family: "Brand";
  src: url(/brand.woff2) format("woff2");
  font-display: optional;
}
```

## Lab vs field data

| | Lab (synthetic) | Field (RUM) |
|---|---|---|
| Source | Lighthouse, DevTools Performance panel, WebPageTest | Real users: Chrome UX Report (CrUX), `web-vitals` library, RUM vendors |
| Conditions | Fixed device, network, cache | Real devices, networks, user behaviour |
| INP | Not measurable without interactions; use **TBT** as a proxy | Measured |
| Good for | Debugging, CI regression budgets, before shipping | Truth about user experience; what Google ranks on |
| Weakness | Doesn't reflect your users | Noisy, delayed (CrUX is a 28-day rolling window), harder to debug |

Discrepancies are normal: lab often tests a cold mobile load on one page; field includes warm caches, back/forward cache restores, fast and slow devices.

Collect field data yourself:

```ts
import { onLCP, onINP, onCLS } from 'web-vitals/attribution'

function send(metric: { name: string; value: number; attribution: unknown }) {
  navigator.sendBeacon('/rum', JSON.stringify(metric))
}
onLCP(send)
onINP(send) // attribution includes the slow interaction's target and phase breakdown
onCLS(send)
```

## Debugging workflow

1. Check CrUX / Search Console / RUM to find which metric and which page templates fail, on which device class.
2. Reproduce in DevTools with CPU and network throttling; the Performance panel shows live LCP/INP/CLS and attributes them to elements and interactions.
3. Use the sub-part breakdown (LCP phases, INP phases, shift sources) to locate the cause.
4. Fix, then verify in lab, then confirm in field data over the following weeks.
5. Add budgets (Lighthouse CI, bundle size checks) to stop regressions.

## SPAs and soft navigations

Core Web Vitals are measured per **page load**. In a single-page app, client-side route changes don't start a new LCP, while CLS and INP accumulate across the whole session on one URL. A sluggish SPA therefore shows up mostly as bad INP. Chrome has been experimenting with soft navigation measurement, but don't rely on it in interviews as standard.

## Common interview questions

**What replaced FID and why?**
INP, in March 2024. FID only measured input delay of the first interaction, so most pages passed easily; INP covers all interactions and includes processing and rendering time.

**Your LCP is 4 s on mobile. How do you investigate?**
Identify the LCP element, split time into TTFB, load delay, load duration and render delay, then fix the dominant part: server/CDN for TTFB, discoverability and `fetchpriority` for delay, image size/format for duration, render-blocking resources or CSR for render delay.

**How do you improve INP?**
Find slow interactions with attribution, then reduce long tasks around them: yield in handlers, defer non-urgent work, shrink re-renders and DOM size, and cut third-party script cost.

**What causes CLS and how do you prevent it?**
Content changing size or being inserted without reserved space: images without dimensions, ads, late-loading fonts, injected banners. Reserve space, use `aspect-ratio`, matched font fallbacks, and animate with transforms.

**Why do Lighthouse and CrUX disagree?**
Lighthouse is a single synthetic run on a simulated device; CrUX is the 75th percentile of real Chrome users over 28 days. Field data is what matters; lab data helps debug.

**Why 75th percentile?**
It reflects the experience of most users, including slower devices, while being robust to extreme outliers.

## Pitfalls

- `loading="lazy"` on the hero image.
- Preloading too many resources so the LCP image competes for bandwidth.
- Optimising Lighthouse score only, ignoring field data.
- Treating TBT as INP; it's a lab proxy, not the same metric.
- Animating layout properties and blaming the framework for CLS.
