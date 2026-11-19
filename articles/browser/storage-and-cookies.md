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

## A cookie's life, step by step

1. The user logs in. The server responds with:

```http
Set-Cookie: session=abc123; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=86400
```

2. The browser stores the cookie against the server's host, with its attributes.
3. On every later request to that site, the browser checks each stored cookie: does the domain match? Is the path a prefix of the URL? Is the connection HTTPS (`Secure`)? Does the request context satisfy `SameSite`? Has it expired?
4. Matching cookies go in a `Cookie: session=abc123` request header, automatically. JavaScript can't read `session`, because it is `HttpOnly`.
5. On logout the server sends the same cookie with `Max-Age=0`, and the browser deletes it.

The automatic sending in step 4 is both the convenience and the danger of cookies: it is what makes CSRF possible, and `SameSite` is what limits it (see [Web Security](/read/web-security)).

### SameSite in practice

| Request | `Strict` | `Lax` (default) | `None; Secure` |
| --- | --- | --- | --- |
| Same-site fetch or navigation | sent | sent | sent |
| Top-level link from another site (GET) | not sent | sent | sent |
| Form POST from another site | not sent | not sent | sent |
| `fetch` or `<img>` from another site | not sent | not sent | sent |

`Strict` breaks "click a link from an email and arrive logged in", which is why `Lax` is the usual choice for session cookies.

## Third-party cookies and partitioning

Cookies set by a site embedded in an iframe or loaded as a subresource on another site are **third-party** cookies. They powered cross-site tracking, so browsers now block or restrict them (Safari and Firefox by default; Chrome with user choice). Two consequences for engineers:

- Embedded widgets (chat, payments, comments) that relied on their own cookies need the **Storage Access API** or **partitioned cookies** (`Set-Cookie: …; Partitioned`, known as CHIPS), which are keyed by the top-level site, so the same widget on two sites gets two separate cookie jars.
- Other storage (localStorage, IndexedDB, Cache API) in third-party iframes is also **partitioned** by top-level site.

## Working with IndexedDB

The raw API is event-based and verbose. A small promise wrapper covers most needs:

```js
function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('notes-app', 1)
    request.onupgradeneeded = () => {
      const db = request.result
      const store = db.createObjectStore('notes', { keyPath: 'id' })
      store.createIndex('byUpdated', 'updatedAt')
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function saveNote(note) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('notes', 'readwrite')
    tx.objectStore('notes').put(note)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
```

Key ideas: databases are versioned (schema changes happen in `onupgradeneeded`), all reads and writes happen in transactions, and values are stored with the structured clone algorithm, so dates, maps, blobs and files survive. In practice, use a thin library such as `idb` or Dexie.

## Syncing between tabs

Each tab has its own memory, but storage is shared per origin:

- Writing to `localStorage` fires a `storage` event in **other** tabs of the same origin (not the one that wrote it).
- `BroadcastChannel` sends arbitrary messages between same-origin tabs, workers and iframes:

```js
const channel = new BroadcastChannel('auth')
channel.postMessage({ type: 'logout' })
channel.onmessage = (event) => {
  if (event.data.type === 'logout') location.assign('/login')
}
```

This is the standard way to log a user out of every open tab at once.

## Origin Private File System

`navigator.storage.getDirectory()` gives a private, sandboxed file system per origin, invisible to the user. From a worker, `createSyncAccessHandle()` provides fast synchronous reads and writes, which is how SQLite compiled to WebAssembly runs in the browser with persistent storage.

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

## Key takeaways

- Cookies are sent automatically with matching requests; secure session cookies with `Secure`, `HttpOnly` and `SameSite=Lax`.
- `localStorage` is small, synchronous and readable by any script on the origin; never put secrets in it.
- IndexedDB is the real client database: asynchronous, transactional, large and structured.
- The Cache API stores request/response pairs, mainly for service workers.
- Third-party storage is blocked or partitioned; plan embedded features accordingly.
- Use `BroadcastChannel` or the `storage` event to keep tabs in sync.
