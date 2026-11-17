---
title: Performance, Security and Networking
order: 28
module: performance
summary: Core Web Vitals and their fixes, the critical rendering path, bundles, images and fonts, caching and CDNs, HTTP/2 and HTTP/3, rendering strategies, XSS/CSRF/CSP, cookies and token storage, CORS, and real-time transports.
---

## What does LCP measure, and how do you usually fix a poor score?

The render time of the largest image or text block in the viewport; good is 2.5 s or less at the 75th percentile. Typical fixes: cut TTFB with caching or a CDN, make the LCP image discoverable in the initial HTML (not a CSS background or JS-injected), give it `fetchpriority="high"` and never lazy-load it, serve it compressed and correctly sized, and remove render-blocking CSS and scripts.

## Why did INP replace FID as a Core Web Vital?

FID only measured the input delay of the first interaction, ignoring the time to run handlers and paint and every later interaction. INP observes all interactions in the visit and reports roughly the worst full latency: input delay plus processing plus presentation delay until the next frame. Good is 200 ms or less.

## How would you improve a poor INP?

Find the slow interactions in field data, then shorten the work between input and paint: break long tasks and yield to the main thread (`scheduler.yield()` or `setTimeout`), do only the visual update in the handler and defer the rest, shrink re-render scope and DOM size, avoid forced synchronous layouts, and move heavy computation to a worker.

## What causes layout shifts, and how do you prevent them?

Images and embeds without dimensions, ads and banners injected above existing content, and web fonts swapping in with different metrics. Reserve space with `width`/`height` or `aspect-ratio`, give dynamic slots a `min-height`, match fallback font metrics with `size-adjust`, and animate with `transform`. Shifts within 500 ms of a user input don't count toward CLS.

## Why can a page score well in Lighthouse and still fail Core Web Vitals?

Lighthouse is a lab test: one simulated device and network, a cold load and no real interactions, so it can't measure INP (TBT is only a proxy). Core Web Vitals are assessed on field data, the 75th percentile of real users on real devices, networks and cache states. Collect your own RUM with the `web-vitals` library to see what users actually experience.

## Walk me through the critical rendering path.

The browser parses HTML into the DOM and CSS into the CSSOM, combines them into a render tree of visible nodes, computes layout (geometry), paints pixels into layers and composites them. CSS blocks rendering, and synchronous scripts block parsing and must also wait for preceding CSS, which is why both delay first paint.

## What's the difference between `async` and `defer` on a script?

Both download without blocking the parser. `async` runs as soon as it arrives, in no guaranteed order, possibly mid-parse, which suits independent third-party scripts like analytics. `defer` runs after parsing completes, in document order, before `DOMContentLoaded`, which suits app code. Module scripts are deferred by default.

## Why is CSS render-blocking, and how do you limit the cost?

The browser won't paint until it has the CSSOM, to avoid a flash of unstyled content. Keep the critical CSS small (inline it for above-the-fold content if needed), split the rest by route, use `media` attributes so non-matching stylesheets such as print don't block, and avoid `@import` chains that create sequential downloads.

## Why does tree shaking sometimes fail to remove unused code?

It relies on static ES module `import`/`export` analysis, so CommonJS modules, dynamic property access and code with side effects at import time can't be safely dropped. Mark packages with `"sideEffects": false`, avoid barrel files that re-export modules with side effects, and use ESM builds of libraries.

## How do you decide where to split a JavaScript bundle?

Split by route first, so each page only loads its own code, then lazily load heavy and rarely used features like editors, charts or maps with dynamic `import()`. Keep stable vendor code in a separate long-cached chunk. Don't over-split: many tiny chunks add request overhead and can create load waterfalls.

## What's the difference between `preload`, `prefetch` and `preconnect`?

`preload` fetches a resource the current page definitely needs, at high priority, before the parser finds it (fonts, the LCP image). `prefetch` fetches something for a likely next navigation at idle priority. `preconnect` opens DNS, TCP and TLS to an origin early without fetching anything; `dns-prefetch` does only the DNS lookup. `modulepreload` is the preload variant for ES modules.

## When does `preload` make performance worse?

When it steals bandwidth from more critical resources: preloading many assets, or ones that aren't needed early, delays CSS and the LCP image. Unused preloads waste a download and log a console warning, and a font preload without `crossorigin` gets fetched twice. Preload only the few late-discovered resources that gate first render.

## Why does preloading a font need the `crossorigin` attribute?

Fonts are always fetched in CORS mode, even from your own origin. A preload without `crossorigin` is a non-CORS request, so the browser can't reuse it for the real font request and downloads the file a second time.

## How should images be loaded on a modern site?

Use `srcset` and `sizes` for resolution switching, AVIF or WebP via `<picture>` or content negotiation, and always set `width` and `height` to reserve space. Add `loading="lazy"` only to below-the-fold images, and `fetchpriority="high"` to the LCP image. An image CDN can resize and convert formats on the fly.

## How do you load web fonts without hurting LCP and CLS?

Self-host WOFF2, subset to the characters you need, and preload only the one or two fonts used above the fold. Set `font-display: swap` (or `optional` if you'd rather skip a late font than shift), and tune the fallback with `size-adjust` and `ascent-override` so the swap doesn't move text.

## What caching headers would you set for hashed assets versus HTML?

Fingerprinted assets like `app.3f9c.js` never change at that URL, so serve `Cache-Control: public, max-age=31536000, immutable`. HTML must pick up new asset URLs, so use `no-cache` with an `ETag` (always revalidate) or a short `max-age` with `stale-while-revalidate`. Deploys then invalidate everything by changing the HTML.

## What's the difference between `no-cache` and `no-store`?

`no-cache` allows storing the response but requires revalidation with the server before every reuse, which is cheap with a 304. `no-store` forbids storing it anywhere, which is what you want for sensitive responses like account pages or banking data.

## How does HTTP revalidation with `ETag` work?

The server sends an `ETag` (a version identifier) with the response. When the cached copy is stale, the browser sends `If-None-Match` with that value; if the resource hasn't changed the server replies `304 Not Modified` with no body, saving the download. `Last-Modified` with `If-Modified-Since` is the date-based equivalent.

## What does `stale-while-revalidate` do?

`Cache-Control: max-age=60, stale-while-revalidate=600` serves a cached response instantly for up to ten minutes after it goes stale while refreshing it in the background, so users never wait on the revalidation round trip. It suits content where being briefly out of date is acceptable.

## Why put a CDN in front of a site, and what's hard to cache there?

Edge servers close to users cut latency, absorb traffic spikes and DDoS, terminate TLS, compress responses, and often optimise images. Personalised or authenticated responses are the hard part: they need `Cache-Control: private`, careful cache keys and `Vary` headers, or edge logic, otherwise one user's page can be served to another.

## What did HTTP/2 change compared with HTTP/1.1?

It multiplexes many concurrent requests over a single TCP connection using binary framing and compresses headers with HPACK. That makes HTTP/1.1 workarounds like domain sharding, sprites and aggressive concatenation unnecessary or harmful. Packet loss still stalls every stream, because TCP delivers bytes in order. Server push has been dropped by browsers.

## Why is HTTP/3 built on QUIC over UDP?

QUIC implements streams in user space, so a lost packet only stalls its own stream instead of the whole connection, removing TCP's head-of-line blocking. It also merges the transport and TLS 1.3 handshakes (with 0-RTT resumption) and lets a connection survive a network change, like Wi-Fi to cellular, which helps most on lossy mobile networks.

## How do you choose between CSR, SSR and SSG?

CSR ships a shell and renders in the browser: cheap hosting and rich interactivity, but slower first content and weaker SEO. SSR renders HTML per request: fresh and personalised, at the cost of server work and TTFB. SSG renders at build time and serves from a CDN: fastest, but stale until rebuilt, with incremental regeneration as a middle ground. Most real apps mix them per route.

## Why can a server-rendered page look ready but not respond to clicks?

The HTML paints before the JavaScript has downloaded and hydrated, so buttons are visible but have no handlers yet, and hydration itself is a long main-thread task that hurts INP. Reduce the JavaScript shipped, split hydration with Suspense boundaries so it happens selectively, or use islands or Server Components so static parts never hydrate.

## What is islands architecture, and when does it fit?

The page is static HTML with a few independently hydrated interactive components ("islands"), as in Astro, so you ship JavaScript only for the widgets that need it. It fits content-heavy sites like blogs, docs and marketing pages; highly interactive apps with lots of shared client state gain less.

## How can XSS still happen in a React app that escapes output?

Through the escape hatches: `dangerouslySetInnerHTML` with unsanitised HTML, a user-controlled `href` using the `javascript:` scheme, direct DOM writes via refs (`innerHTML`), server state serialised into an inline `<script>` without escaping `</script>`, and compromised third-party scripts. Sanitise HTML with a library like DOMPurify, allow-list URL schemes, and add a CSP.

## What are the three kinds of XSS, and what's the general defence?

Stored (the payload is saved server-side and served to other users), reflected (it bounces off the server from a request parameter) and DOM-based (client-side code moves untrusted input into a dangerous sink like `innerHTML`). Defend with context-aware output encoding, sanitising any HTML you must render, a strict CSP and Trusted Types, and `HttpOnly` cookies to limit what a successful attack can steal.

## How does a Content Security Policy mitigate XSS?

It tells the browser which sources may run scripts and load resources, so injected markup can't execute. A strict policy uses per-response nonces or hashes, such as `script-src 'nonce-r4nd0m' 'strict-dynamic'; object-src 'none'; base-uri 'none'`, which blocks inline handlers and injected scripts. Roll it out with `Content-Security-Policy-Report-Only` first to find breakage.

## How does a CSRF attack work, and how do you defend against it?

A malicious site makes the victim's browser send a request to your site, and the browser attaches the victim's cookies automatically, so the request is authenticated. Defend with `SameSite=Lax` or `Strict` cookies, anti-CSRF tokens for cookie-authenticated state changes, checking the `Origin` header, and never changing state on GET. Requiring a custom header or JSON content type also forces a CORS preflight that cross-site forms can't pass.

## What is clickjacking, and how do you prevent it?

An attacker loads your page in a transparent iframe over their own UI so the user unknowingly clicks your buttons, like "delete account" or "allow". Prevent framing with `Content-Security-Policy: frame-ancestors 'none'` (or `'self'`); `X-Frame-Options: DENY` is the legacy equivalent, still worth sending for older clients.

## What do the `HttpOnly`, `Secure` and `SameSite` cookie attributes do?

`HttpOnly` hides the cookie from JavaScript, so XSS can't read it. `Secure` only sends it over HTTPS. `SameSite` controls cross-site sending: `Strict` never, `Lax` only on top-level GET navigations, `None` always (and requires `Secure`). The `__Host-` name prefix additionally forces `Secure`, `Path=/` and no `Domain`, locking the cookie to one host.

## Why might you choose `SameSite=Lax` over `Strict` for a session cookie?

With `Strict`, the cookie isn't sent even when a user follows a link to your site from an email or another site, so they arrive looking logged out until they navigate again. `Lax` sends it on top-level GET navigations while still blocking cross-site POSTs, iframes and fetches. Chrome treats cookies without a `SameSite` attribute as `Lax`.

## Where should a single-page app store authentication tokens?

`localStorage` is simple but readable by any XSS, and persists. In-memory storage can't be read after an XSS is gone, but is lost on reload and still usable while the attack runs. An `HttpOnly`, `Secure`, `SameSite` cookie can't be read by script but needs CSRF protection. A common compromise is a short-lived access token in memory with the refresh token in an `HttpOnly` cookie, or a backend-for-frontend that keeps tokens server-side.

## When does the browser send a CORS preflight?

When a cross-origin request isn't "simple": a method other than GET, HEAD or POST; custom headers such as `Authorization`; or a `Content-Type` other than form-urlencoded, multipart or `text/plain`, so most JSON APIs trigger it. The browser sends `OPTIONS` with `Access-Control-Request-Method` and `-Headers`, and only proceeds if the response allows them; `Access-Control-Max-Age` caches that approval.

## Why doesn't CORS protect your server?

CORS is the browser relaxing the same-origin policy, which restricts reading cross-origin responses, not sending requests. A simple request still reaches your server and has its effects even if the browser then hides the response, and non-browser clients like curl ignore CORS entirely. Authentication, authorisation and CSRF defences are what protect the server.

## Why can't you combine `Access-Control-Allow-Origin: *` with cookies?

For credentialed requests (`credentials: 'include'`), the browser requires the response to name the exact requesting origin and send `Access-Control-Allow-Credentials: true`; a wildcard is rejected. Servers that echo back an allow-listed origin should also send `Vary: Origin` so caches don't serve one origin's response to another.

## How do you choose between WebSockets, server-sent events and polling?

WebSockets give full-duplex, low-latency messaging for chat, multiplayer or collaborative editing, but are stateful connections that complicate scaling and need your own reconnect logic. SSE is one-way server-to-client over plain HTTP with built-in reconnection and `Last-Event-ID`, ideal for notifications, feeds or streaming LLM output. Polling is simplest and fine when updates are infrequent.

## What does Subresource Integrity protect against?

A script or stylesheet loaded from a third-party CDN being tampered with. `<script src="..." integrity="sha384-..." crossorigin="anonymous">` makes the browser refuse the file if its hash doesn't match, so a compromised CDN can't run arbitrary code on your page. It only works for files that don't change at that URL.

## Why might a page not be restored from the back/forward cache?

The bfcache keeps a paused snapshot of the page for instant back/forward navigation, but pages are excluded for things like `unload` handlers, open WebSocket or other in-flight connections, or (historically) `Cache-Control: no-store`. Use `pagehide` instead of `unload` and close connections on `pagehide`, reopening them on `pageshow`; Chrome DevTools has a panel that lists the blocking reasons.

## What is a long task, and why does it matter?

Any main-thread task over 50 ms. While it runs, the browser can't respond to input or paint, so long tasks are the main cause of poor INP and of TBT in lab tests. Find them in the Performance panel and split them so the browser gets a chance to handle input between chunks.
