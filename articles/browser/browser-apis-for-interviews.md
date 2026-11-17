---
title: Browser APIs for Interviews
order: 7
summary: The observer, scheduling, worker, messaging, clipboard, history, beacon and visibility APIs — what each solves and the code interviewers expect.
---

Interviewers use these APIs to separate "knows React" from "knows the platform". The typical prompt is a feature ("lazy-load images", "sync logout across tabs", "send analytics on exit") where the right API turns fifty lines of event handling into ten. Know what each one is for, its callback timing, and how to clean it up.

## At a glance

| API | Solves | Replaces |
|---|---|---|
| `IntersectionObserver` | Visibility of an element relative to a viewport or container | Scroll listeners plus `getBoundingClientRect` |
| `ResizeObserver` | An element's size changing | `window.resize` plus measuring |
| `MutationObserver` | DOM subtree changes | Polling, deprecated mutation events |
| `requestAnimationFrame` | Work aligned with the next paint | `setTimeout(fn, 16)` |
| `requestIdleCallback` | Low-priority work when the main thread is free | `setTimeout` guesses |
| Web Workers | CPU-heavy work off the main thread | Chunking on the main thread |
| `BroadcastChannel` | Messages between same-origin tabs | `storage` event hacks |
| Clipboard API | Async copy and paste | `document.execCommand('copy')` |
| History API | Client-side routing without reloads | Hash routing |
| `navigator.sendBeacon` | Reliable small POST while the page unloads | Synchronous XHR in `unload` |
| Page Visibility | Knowing when the tab is hidden | `blur`/`focus` heuristics |

## IntersectionObserver

### Lazy loading

```js
const io = new IntersectionObserver((entries, observer) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue
    const img = entry.target
    img.src = img.dataset.src
    observer.unobserve(img) // load once
  }
}, { rootMargin: '200px 0px' }) // start loading 200px before it scrolls in

document.querySelectorAll('img[data-src]').forEach((img) => io.observe(img))
```

For plain images, native `loading="lazy"` is simpler; mention it first. Use the observer for background images, components, or analytics impressions.

### Infinite scroll

```js
const sentinel = document.querySelector('#sentinel') // empty element after the list
let loading = false
const io = new IntersectionObserver(async ([entry]) => {
  if (!entry.isIntersecting || loading) return
  loading = true
  const more = await loadNextPage()
  appendItems(more)
  loading = false
  if (!more.length) io.disconnect()
}, { root: null, rootMargin: '400px' })
io.observe(sentinel)
```

Options: `root` (`null` for the viewport, or a scrolling ancestor), `rootMargin` (grows or shrinks the root box), `threshold` (a ratio or array of ratios at which to fire). The callback fires once shortly after `observe` with the initial state, then asynchronously after layout, not on every scroll event. One gotcha: if the sentinel is still visible after a short page is appended, the observer won't fire again because nothing changed; `unobserve` then `observe` the sentinel to re-check. Pair long feeds with virtualization so the DOM doesn't grow unbounded.

## ResizeObserver

```js
const ro = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const { inlineSize } = entry.contentBoxSize[0]
    entry.target.classList.toggle('compact', inlineSize < 400)
  }
})
ro.observe(card)
// later: ro.unobserve(card) or ro.disconnect()
```

Use it for components that adapt to their container (charts, truncation, virtualized lists). For pure styling, CSS container queries do the same without JS. Changing the observed element's size inside the callback can cause a loop; the browser stops and reports "ResizeObserver loop completed with undelivered notifications".

## MutationObserver

```js
const mo = new MutationObserver((records) => {
  for (const r of records) {
    if (r.type === 'childList') r.addedNodes.forEach(enhance)
    if (r.type === 'attributes') console.log(r.attributeName, 'changed')
  }
})
mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-expanded'] })
// mo.takeRecords() flushes pending records synchronously; mo.disconnect() stops
```

Callbacks are microtasks and receive batched records. Use cases: reacting to third-party widgets, auto-enhancing inserted content, test utilities waiting for DOM changes. Observing `subtree` with `characterData` on a large app is expensive.

## requestAnimationFrame and requestIdleCallback

```js
function animate(el, duration) {
  const start = performance.now()
  function frame(now) {
    const t = Math.min(1, (now - start) / duration)
    el.style.transform = `translateX(${t * 300}px)`
    if (t < 1) requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

// Coalesce a high-frequency event into one write per frame
let scheduled = false
window.addEventListener('pointermove', (e) => {
  lastPoint = e
  if (scheduled) return
  scheduled = true
  requestAnimationFrame(() => { scheduled = false; draw(lastPoint) })
})
```

`rAF` runs before the next paint, is paused in background tabs, and receives a high-resolution timestamp. Use elapsed time, not frame count, so speed is independent of refresh rate.

```js
function processQueue(deadline) {
  while (deadline.timeRemaining() > 0 && queue.length) process(queue.shift())
  if (queue.length) requestIdleCallback(processQueue, { timeout: 2000 })
}
requestIdleCallback(processQueue, { timeout: 2000 })
```

`requestIdleCallback` gives deadlines of at most 50 ms and may never run on a busy page unless you pass `timeout`. Safari support has lagged behind other engines, so feature-detect and fall back to `setTimeout`.

## Web Workers and postMessage

```js
// main.js
const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' })
worker.postMessage({ type: 'parse', text: hugeCsv })
worker.onmessage = (e) => render(e.data.rows)
worker.onerror = (e) => console.error(e.message)

// worker.js
self.onmessage = (e) => {
  if (e.data.type === 'parse') self.postMessage({ rows: parseCsv(e.data.text) })
}
```

- Workers have no DOM access; they get `fetch`, timers, IndexedDB and `postMessage`.
- Messages are copied with the structured clone algorithm: `Map`, `Set`, `Date`, typed arrays and cycles survive; functions, DOM nodes and class prototypes don't.
- Transfer large buffers instead of copying: `worker.postMessage(buf, [buf])` moves ownership and leaves `buf` detached in the sender.
- Use for parsing, image processing, diffing, search indexing. Not worth it for tasks under a few milliseconds because of messaging overhead.
- Call `worker.terminate()` when done. Shared workers and service workers are different tools: shared state across tabs, and a network proxy, respectively.

## BroadcastChannel

```js
const channel = new BroadcastChannel('auth')
channel.postMessage({ type: 'logout' })
channel.onmessage = (e) => { if (e.data.type === 'logout') redirectToLogin() }
// channel.close() on teardown
```

Same-origin only, and the sending context doesn't receive its own message. The older trick is listening for the `storage` event, which fires in other tabs when `localStorage` changes.

## Clipboard

```js
async function copy(text) {
  try {
    await navigator.clipboard.writeText(text)
    announce('Copied')
  } catch {
    announce('Copy failed') // permission denied or insecure context
  }
}
```

Requires a secure context, and writes generally must happen during a user gesture. Reading (`readText`) prompts for permission in most browsers. `navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])` copies rich content.

## History API

```js
function navigate(path) {
  history.pushState({ path }, '', path) // no reload, no popstate fired
  render(path)
}
window.addEventListener('popstate', () => render(location.pathname)) // back/forward
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="/"]')
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
  e.preventDefault()
  navigate(a.getAttribute('href'))
})
```

`replaceState` updates the current entry (filters, scroll restoration state). The server must return the app for every deep link. The newer Navigation API (`navigation.addEventListener('navigate', …)`) centralizes this in Chromium; feature-detect it.

## navigator.sendBeacon

```js
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    navigator.sendBeacon('/analytics', JSON.stringify(collectMetrics()))
  }
})
```

Queues a small POST that survives page unload and doesn't delay navigation. Returns `false` if the payload couldn't be queued (size limits around 64 KB). `fetch(url, { method: 'POST', body, keepalive: true })` is the alternative when you need headers. Send on `visibilitychange` to hidden, not `unload`, which is unreliable on mobile and breaks the back/forward cache.

## Page Visibility

```js
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { pausePolling(); video.pause() }
  else { resumePolling(); refreshIfStale() }
})
```

Use it to stop polling, pause media and animations, and flush analytics. Browsers already throttle timers in hidden tabs, but your own network requests continue unless you stop them.

## Common interview questions

**Why is IntersectionObserver better than a scroll listener for lazy loading?**
Scroll listeners fire constantly on the main thread and force layout when you measure. IntersectionObserver computes intersections asynchronously during the rendering steps and calls you only when a threshold is crossed.

**When would you reach for a Web Worker?**
When a computation takes long enough to drop frames or delay input, such as parsing large files or running search over thousands of records. The cost is serialization of messages, so keep messages coarse and transfer buffers.

**How do you sync state across tabs?**
`BroadcastChannel` for messages between same-origin tabs, or the `storage` event when the state already lives in `localStorage`. For shared live state or a single connection, a `SharedWorker` can own it.

**How do you send analytics reliably when the user leaves?**
Use `navigator.sendBeacon` or `fetch` with `keepalive: true`, triggered on `visibilitychange` to hidden. Avoid `unload` and `beforeunload`, which are unreliable and hurt bfcache eligibility.

**What's the timing of MutationObserver callbacks compared to ResizeObserver?**
MutationObserver callbacks are microtasks after the DOM change. ResizeObserver and IntersectionObserver callbacks run in the rendering steps, after layout and before paint.

**Why use `requestAnimationFrame` instead of `setInterval` for animation?**
`rAF` is synchronized with the display refresh, skips work in hidden tabs, and gives a precise timestamp. Intervals drift, can fire twice per frame or miss frames, and keep running in the background.

**What does `pushState` not do?**
It doesn't fire `popstate`, doesn't fetch anything, and doesn't render. Your router must call its render step itself after pushing.
