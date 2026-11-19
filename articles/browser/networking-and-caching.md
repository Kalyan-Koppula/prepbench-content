---
title: Networking and Caching
order: 5
summary: HTTP/1.1 vs 2 vs 3, Cache-Control and validation, CDNs, service worker strategies and resource hints.
---

Network performance is usually the biggest lever on page load. Interviewers want you to explain how HTTP versions differ, design a caching strategy for HTML versus hashed assets, describe service worker caching patterns, and pick the right resource hint.

## HTTP versions

| | HTTP/1.1 | HTTP/2 | HTTP/3 |
|---|---|---|---|
| Transport | TCP | TCP | QUIC over UDP |
| Requests per connection | One at a time (pipelining unused) | Many, multiplexed streams | Many, multiplexed streams |
| Head-of-line blocking | At HTTP level | At TCP level (one lost packet stalls all streams) | Per stream only |
| Header compression | None | HPACK | QPACK |
| Handshake | TCP + TLS | TCP + TLS | Combined; 1-RTT, 0-RTT resumption |
| Connection migration | No | No | Yes (survives network changes) |

Implications for frontend:

- HTTP/1.1 tricks — domain sharding, sprite sheets, concatenating everything — are unnecessary or harmful on HTTP/2+.
- Bundling still helps compression and reduces request overhead, but fine-grained chunks are fine.
- HTTP/2 server push is deprecated and removed from Chrome; use `preload` or `103 Early Hints` instead.

## HTTP caching

### Cache-Control directives

| Directive | Meaning |
|---|---|
| `max-age=N` | Fresh for N seconds |
| `s-maxage=N` | Like `max-age` for shared caches (CDNs) only |
| `no-cache` | May store, but must revalidate before every use |
| `no-store` | Don't store at all (sensitive data) |
| `private` | Only the browser may cache, not CDNs |
| `public` | Shared caches may store, even for authenticated responses |
| `immutable` | Won't change during its freshness; skip revalidation on reload |
| `must-revalidate` | Once stale, don't serve without revalidating |
| `stale-while-revalidate=N` | Serve stale for up to N seconds while refreshing in the background |
| `stale-if-error=N` | Serve stale if the origin errors |

`no-cache` does **not** mean "don't cache"; `no-store` does.

### Validation

When a cached response is stale, the browser revalidates with a conditional request. If unchanged, the server replies `304 Not Modified` with no body.

```text
200 OK
ETag: "v42-abc"
Last-Modified: Tue, 10 Nov 2026 09:00:00 GMT

GET /data.json
If-None-Match: "v42-abc"
If-Modified-Since: Tue, 10 Nov 2026 09:00:00 GMT

304 Not Modified
```

`ETag` is preferred: it's exact, whereas `Last-Modified` has one-second granularity.

### A standard strategy

```text
# Hashed static assets: app.3f9a1c.js, logo.8b2e.svg
Cache-Control: public, max-age=31536000, immutable

# HTML documents
Cache-Control: no-cache                (always revalidate; 304 is cheap)

# API responses that tolerate slight staleness
Cache-Control: private, max-age=0, stale-while-revalidate=60

# Personal or sensitive data
Cache-Control: no-store
```

Content hashing in filenames makes long caching safe: a new deploy changes the HTML, which references new file names.

`Vary` tells caches which request headers change the response (`Vary: Accept-Encoding`, `Vary: Origin`). Overly broad `Vary` (like `User-Agent`) destroys CDN hit rates.

## Browser caches in order

1. **Memory cache** — resources already loaded in this page.
2. **Service worker** — if one controls the page, its `fetch` handler runs first.
3. **HTTP cache** (disk) — governed by the headers above.
4. **Network** — possibly hitting a CDN edge cache before the origin.

Also: the **back/forward cache** stores whole pages for instant history navigation; avoid `unload` listeners and `Cache-Control: no-store` on documents if you want pages to be eligible.

## CDNs

- Serve content from edge locations near the user: lower latency, offload the origin.
- Cache static assets aggressively; cache HTML or API responses with short TTLs, `s-maxage`, or `stale-while-revalidate`.
- Purge by URL or cache tag on deploy; hashed asset names usually make purges unnecessary.
- Edge compute (functions, middleware) can personalise, run A/B tests or rewrite routes without a round trip to the origin.
- Compression: Brotli for text, with gzip fallback.

## Service workers

A script that sits between the page and the network, intercepting `fetch` events for its scope. Requires HTTPS. Lifecycle: `install` (precache), `activate` (clean old caches), then `fetch`.

```js
// sw.js
const STATIC = 'static-v3'

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC).then((c) => c.addAll(['/', '/app.js', '/styles.css'])))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== STATIC).map((k) => caches.delete(k)))),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  event.respondWith(caches.match(event.request).then((hit) => hit ?? fetch(event.request)))
})
```

| Strategy | Behaviour | Use for |
|---|---|---|
| Cache first | Cache, fall back to network | Hashed static assets, fonts |
| Network first | Network, fall back to cache | HTML, fresh API data with offline fallback |
| Stale-while-revalidate | Serve cache immediately, update it in the background | Avatars, non-critical API data |
| Network only | Never cache | Analytics, payments |
| Cache only | Never hit network | Precached app shell |

Gotchas: a new service worker waits until all tabs using the old one close (unless `skipWaiting()` + `clients.claim()`); a buggy worker can serve stale apps indefinitely, so ship a kill switch. Libraries like Workbox handle routing and versioning.

## Resource hints

```html
<link rel="preconnect" href="https://cdn.example.com" crossorigin />
<link rel="dns-prefetch" href="https://analytics.example.com" />
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />
<link rel="modulepreload" href="/chunks/editor.js" />
<link rel="prefetch" href="/next-page.js" />
<img src="/hero.avif" fetchpriority="high" alt="" />
```

| Hint | What it does | When |
|---|---|---|
| `dns-prefetch` | Resolve DNS early | Many third-party origins, cheap fallback |
| `preconnect` | DNS + TCP + TLS early | 1–3 critical origins used soon |
| `preload` | Fetch a resource for the **current** page at high priority | Late-discovered critical resources: fonts, LCP image, CSS background |
| `modulepreload` | Preload and parse an ES module | Critical JS modules |
| `prefetch` | Fetch at low priority for a **future** navigation | Next likely page's assets |
| `fetchpriority` | Raise or lower a resource's priority | LCP image high, below-fold images low |
| Speculation Rules | Prefetch or prerender whole pages | Likely next navigations (Chromium) |

Unused preloads waste bandwidth and trigger console warnings. Fonts must be preloaded with `crossorigin` even when same-origin.

## A request's timeline

DevTools' Network panel breaks every request into phases:

| Phase | What happens | How to shrink it |
| --- | --- | --- |
| Queueing / stalled | Waiting for a connection slot or for higher-priority requests | HTTP/2 or 3, fewer competing requests, priority hints |
| DNS lookup | Resolve the host name | `dns-prefetch`, fewer distinct hosts |
| Initial connection + SSL | TCP and TLS handshakes (one QUIC handshake on HTTP/3) | `preconnect`, connection reuse, HTTP/3 |
| Request sent | Upload the request | Small requests, small cookies |
| Waiting (TTFB) | Server think time plus one round trip | Caching, CDNs, faster backends, streaming |
| Content download | Transfer the body | Compression (Brotli), smaller payloads, CDNs |

## Caching an SPA correctly

A production SPA usually has two kinds of files, and they need opposite caching rules:

| File | Example | Header | Why |
| --- | --- | --- | --- |
| Fingerprinted assets | `/assets/app.3f9a1c.js`, `/assets/logo.8b2e.svg` | `Cache-Control: public, max-age=31536000, immutable` | The name changes when the content does, so cache forever |
| HTML entry points | `/index.html` | `Cache-Control: no-cache` (with an `ETag`) | Must be revalidated so users get the newest asset references |
| API responses | `/api/products` | `private, no-cache` or a short `max-age`, often with `stale-while-revalidate` | Depends on how fresh the data must be |

Deploying then works atomically: new HTML points at new hashed files; old tabs keep working with old files, which are still cached and should stay on the server for a while.

### Revalidation, step by step

1. First visit: `GET /index.html` → `200 OK`, `ETag: "v42"`, `Cache-Control: no-cache`.
2. Second visit: the browser has a copy but must check. It sends `If-None-Match: "v42"`.
3. If nothing changed, the server replies `304 Not Modified` with no body. The browser uses its copy: one round trip, almost no bytes.
4. After a deploy, the server replies `200 OK` with the new HTML and `ETag: "v43"`.

`no-cache` means "store it, but revalidate before use"; `no-store` means "never store it" (for sensitive responses).

### `stale-while-revalidate`

`Cache-Control: max-age=60, stale-while-revalidate=600` serves from cache for 60 seconds, then for the next 10 minutes serves the stale copy **immediately** while refreshing it in the background. Users get instant responses, and data is at most one request behind. The same idea powers data libraries like SWR on the client.

## The service worker lifecycle

1. **Register**: `navigator.serviceWorker.register('/sw.js')` from the page.
2. **Install**: the new worker's `install` event fires; it typically pre-caches the app shell. If any file fails, installation fails.
3. **Waiting**: if an older worker controls open tabs, the new one waits until they all close, so a page never runs with mismatched versions. (`skipWaiting()` overrides this; use with care.)
4. **Activate**: the `activate` event fires; delete old caches here.
5. **Fetch**: the active worker intercepts requests from the pages it controls and responds using its strategy.

Updating the app means shipping a byte-different `sw.js`; the browser checks for updates on navigation. A common UX: detect a waiting worker and show "A new version is available — reload".

## HTTP/2 multiplexing and head-of-line blocking

HTTP/1.1 sends one request at a time per connection, so browsers opened about six connections per host, and tricks like sprite sheets and domain sharding existed to work around it. HTTP/2 multiplexes many requests as interleaved streams over **one** TCP connection, with header compression. But TCP delivers bytes in order: one lost packet stalls **every** stream until it is retransmitted (TCP head-of-line blocking). HTTP/3 runs over QUIC on UDP, where streams are independent, so a lost packet only delays its own stream. QUIC also combines the transport and TLS handshakes and survives network changes (Wi-Fi to mobile) without reconnecting.

## Common interview questions

**What's the difference between `no-cache` and `no-store`?**
`no-cache` allows storing but requires revalidation before each use, so you can still get cheap `304`s. `no-store` forbids storing at all.

**How do you cache a SPA so deploys show up immediately?**
`no-cache` (revalidate) on `index.html`, and long-lived `immutable` caching on content-hashed JS/CSS. New HTML points to new hashes.

**Why is HTTP/3 faster on mobile?**
QUIC avoids TCP head-of-line blocking, sets up connection and encryption in fewer round trips, and keeps connections alive across network changes like Wi-Fi to cellular.

**`preload` vs `prefetch`?**
`preload` is a high-priority fetch for something this page definitely needs; `prefetch` is a low-priority fetch for something a future page might need.

**What does `stale-while-revalidate` give you?**
Instant responses from cache while the browser or CDN refreshes the entry in the background, trading a little staleness for latency.

**When should you not use a service worker?**
When you don't need offline or fine-grained caching; it adds complexity and risk of serving stale code. HTTP caching alone often suffices.

## Pitfalls

- Long `max-age` on un-hashed URLs, leaving users stuck on old files.
- Caching personalised responses as `public` on a CDN.
- Preloading too many resources and starving the critical ones.
- Forgetting `crossorigin` on font preloads, causing a double download.
- No versioning or cleanup in service worker caches.

## Key takeaways

- Every request pays for DNS, connection, TLS, waiting and download; caching and CDNs skip most of them.
- Fingerprinted assets get `immutable` and a one-year `max-age`; HTML gets `no-cache` with an `ETag`.
- `304 Not Modified` makes revalidation cheap; `stale-while-revalidate` makes it invisible.
- Service workers install, wait and activate; they enable offline support and custom caching strategies.
- HTTP/2 multiplexes over one connection; HTTP/3 removes TCP head-of-line blocking.
