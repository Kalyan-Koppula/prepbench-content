---
title: Storage and Cookies
order: 3
summary: Cookies and their security attributes, Web Storage, IndexedDB, the Cache API and quotas — and when to use each.
---

Interviewers ask "where would you store X?" for auth tokens, user preferences, offline data or cached API responses. A good answer weighs capacity, sync vs async access, whether the server needs to see it, lifetime, and security.

## Comparison

| | Cookies | `localStorage` | `sessionStorage` | IndexedDB | Cache API |
|---|---|---|---|---|---|
| Capacity | ~4 KB per cookie | ~5 MB per origin | ~5 MB per origin | Large (share of disk) | Large (share of disk) |
| Sent to server | Every matching request | No | No | No | No |
| API | String header / `document.cookie` / Cookie Store API | Sync, strings | Sync, strings | Async, structured data | Async, `Request` → `Response` |
| Lifetime | Session or `Expires`/`Max-Age` | Until cleared | Per tab, until it closes | Until cleared or evicted | Until cleared or evicted |
| Scope | Domain + path | Origin | Origin + tab | Origin | Origin |
| Workers | Cookie Store API in service workers | Not available | Not available | Yes | Yes |
| JS access | Unless `HttpOnly` | Yes | Yes | Yes | Yes |

All origin-scoped storage is also partitioned by top-level site in modern browsers when used inside third-party iframes.

## Cookies

Set by the server with `Set-Cookie`, or by JavaScript for non-`HttpOnly` cookies.

```text
Set-Cookie: session=abc123; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=86400
```

| Attribute | Effect |
|---|---|
| `HttpOnly` | Not readable from JavaScript; mitigates token theft via XSS |
| `Secure` | Sent only over HTTPS |
| `SameSite=Strict` | Never sent on cross-site requests, including top-level navigations from other sites |
| `SameSite=Lax` | Sent on top-level `GET` navigations from other sites, not on cross-site subresource or `POST` requests. Default in Chromium when unspecified |
| `SameSite=None` | Sent cross-site; requires `Secure`. Subject to third-party cookie restrictions |
| `Domain` | Include subdomains (`Domain=example.com`). Omitted = host-only, which is stricter |
| `Path` | Limit to a path prefix; not a security boundary |
| `Expires` / `Max-Age` | Persistent cookie; without them it's a session cookie |
| `Partitioned` | CHIPS: third-party cookie keyed by the top-level site, for embeds |
| `__Host-` prefix | Must be `Secure`, `Path=/`, no `Domain` — locked to one host |

```js
// Reading and writing from JS (non-HttpOnly only)
document.cookie = 'theme=dark; Path=/; Max-Age=31536000; SameSite=Lax; Secure'
const theme = document.cookie.split('; ').find((c) => c.startsWith('theme='))?.split('=')[1]

// Async Cookie Store API (feature-detect)
await cookieStore.set({ name: 'theme', value: 'dark', sameSite: 'lax' })
const cookie = await cookieStore.get('theme')
```

"Same-site" means same registrable domain (`app.example.com` and `api.example.com` are same-site); "same-origin" also requires same scheme, host and port.

## Web Storage

```js
localStorage.setItem('prefs', JSON.stringify({ theme: 'dark' }))
const prefs = JSON.parse(localStorage.getItem('prefs') ?? '{}')

window.addEventListener('storage', (e) => {
  // Fires in OTHER tabs of the same origin when localStorage changes
  if (e.key === 'prefs') applyPrefs(JSON.parse(e.newValue ?? '{}'))
})
```

- Synchronous and blocks the main thread; fine for small values, bad for large blobs.
- Strings only; numbers and objects must be serialised.
- `setItem` throws `QuotaExceededError` when full, and can throw in some private modes or when storage is disabled; wrap in `try/catch`.
- `sessionStorage` is per tab: duplicated when a tab is duplicated, not shared between tabs, survives reloads.
- Readable by any script on the origin, so never store secrets there.

## IndexedDB

An async, transactional key-value database for structured data (objects, blobs, files), with indexes. Use it for offline data, large caches and drafts.

```js
const request = indexedDB.open('app', 1)
request.onupgradeneeded = () => {
  request.result.createObjectStore('notes', { keyPath: 'id' })
}
request.onsuccess = () => {
  const db = request.result
  const tx = db.transaction('notes', 'readwrite')
  tx.objectStore('notes').put({ id: 1, text: 'hello', updatedAt: Date.now() })
  tx.oncomplete = () => console.log('saved')
}
```

The raw API is event-based and verbose; small wrappers like `idb` add promises. Values are stored with the structured clone algorithm.

## Cache API

Stores `Request`/`Response` pairs, designed for service workers but available on `window` too.

```js
const cache = await caches.open('static-v2')
await cache.addAll(['/', '/app.js', '/styles.css'])
const response = await cache.match('/app.js')
```

Version cache names and delete old ones in the service worker's `activate` event. It doesn't honour HTTP caching headers; you decide when entries expire.

## Quotas and eviction

```js
const { usage, quota } = await navigator.storage.estimate()
const persisted = await navigator.storage.persist() // request protection from eviction
```

- IndexedDB, Cache API and other origin storage share one quota per origin, typically a large fraction of free disk (browser-specific).
- Under storage pressure, "best-effort" data can be evicted for least recently used origins. Persistent storage is exempt unless the user clears it.
- Safari may delete script-writable storage for sites the user hasn't interacted with for a while (7 days of browser use without interaction under ITP).

## When to use which

| Need | Choose |
|---|---|
| Session/auth token the server reads | `HttpOnly; Secure; SameSite` cookie |
| Theme, small UI preferences | `localStorage` (or a cookie if SSR must read it) |
| Form draft for this tab only | `sessionStorage` |
| Offline data, large lists, files | IndexedDB |
| Offline app shell, cached responses | Cache API in a service worker |
| Cross-tab messaging | `BroadcastChannel` (or the `storage` event) |
| Temporary per-page state | In-memory variables |

## Common interview questions

**Where should you store an auth token?**
Ideally in an `HttpOnly`, `Secure`, `SameSite` cookie so JavaScript (and therefore XSS) can't read it, with CSRF protection for state-changing requests. Storing it in `localStorage` exposes it to any injected script.

**`localStorage` vs `sessionStorage`?**
Same API and origin scoping, but `sessionStorage` is per tab and cleared when the tab closes, while `localStorage` persists and is shared across tabs.

**Why not put everything in `localStorage`?**
It's synchronous (blocks the main thread), string-only, small, unavailable in workers, and readable by any script on the page.

**What does `SameSite=Lax` protect against?**
Most CSRF: cookies aren't attached to cross-site `POST` requests, iframes or `fetch` calls, only to top-level `GET` navigations.

**How do tabs stay in sync?**
The `storage` event fires in other tabs when `localStorage` changes; `BroadcastChannel` sends arbitrary messages between same-origin contexts.

**What's the difference between `Expires` and `Max-Age`?**
`Expires` is an absolute date; `Max-Age` is seconds from now and takes precedence when both are present.

## Pitfalls

- Storing tokens or PII in `localStorage`.
- Large JSON in `localStorage` parsed on every page load.
- Forgetting `try/catch` around storage writes.
- Assuming storage persists forever; browsers can evict it.
- Relying on `Path` to isolate cookies between apps on the same host.
