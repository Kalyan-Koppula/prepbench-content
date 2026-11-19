---
title: Memory and Performance in JavaScript
order: 8
summary: How garbage collection decides what lives, the classic leaks in frontend apps, weak references, and how to profile.
---

Single-page apps live for hours, so small leaks add up to sluggish tabs and crashes. Interviewers ask how GC works at a high level, which patterns leak, how `WeakMap` helps, and how you would find a leak or a slow interaction in DevTools.

## Where values live: stack and heap

Two regions of memory matter for a JavaScript developer:

- The **call stack** holds one frame per active function call: its local variables and where to return to. Frames are pushed on call and popped on return, so stack memory is freed automatically and instantly.
- The **heap** holds everything that must outlive a single call or whose size isn't known in advance: objects, arrays, closures, strings of any real size. Heap memory is freed only by the garbage collector.

```js
function makeUser(name) {
  const user = { name, tags: [] } // the object and array live on the heap
  return user // the frame is popped; the object survives because the caller holds it
}
const u = makeUser('Ana') // `u` (a reference) is reachable from the global scope
```

In practice engines blur this line (small integers are stored inline, short-lived objects may be optimised away), but the model is right for reasoning about leaks: **a heap object lives as long as something reachable points at it.**

## Garbage collection basics

- Memory is reclaimed when an object is **unreachable** from the roots: globals, the current call stack, active closures, and objects held by the browser (DOM tree, pending timers, registered listeners).
- Modern engines use **mark-and-sweep**: mark everything reachable from the roots, then free the rest. Cycles are not a problem — two objects pointing at each other but unreachable from roots are collected.
- V8 and other engines are **generational**: most objects die young, so a cheap, frequent "scavenge" collects the young generation, and a slower mark-compact runs on the old generation. Much of the work is incremental and concurrent to avoid long pauses.
- You can't trigger or time GC from page code. A leak means you are unintentionally keeping a reference.

| Term | Meaning in a heap snapshot |
|---|---|
| Shallow size | Memory held by the object itself |
| Retained size | Memory that would be freed if this object were collected |
| Retainers | The chain of references keeping an object alive |
| Detached | A DOM node removed from the document but still referenced from JS |

### Reachability, step by step

```js
let session = { user: { name: 'Ana' }, cart: [1, 2, 3] }
const user = session.user
session = null
```

| After line | Reachable from roots | Collectable |
| --- | --- | --- |
| 1 | `session` → session object → user object, cart array | nothing |
| 2 | also `user` → user object | nothing |
| 3 | `user` → user object | the session object and the cart array |

The user object survives because a second path to it exists. Leaks are always this: a path from a root that you forgot about.

### How the generational collector works

Most objects die young: temporary arrays in a loop, intermediate strings, event objects. Engines exploit that.

1. New objects are allocated in a small **young generation** (in V8, a few megabytes split into two halves).
2. When it fills, a fast **scavenge** copies the few live objects to the other half and discards the rest wholesale. The cost depends on the number of survivors, not the amount of garbage.
3. Objects that survive a couple of scavenges are **promoted** to the old generation.
4. The **old generation** is collected less often with mark-sweep-compact, mostly incrementally and on background threads, so the main-thread pauses stay short.

Consequences: allocating many short-lived objects is cheap but not free (more scavenges), while objects that live a medium time and then die (caches that churn) are the most expensive, because they get promoted and then need a full collection.

## Common leaks

### Forgotten event listeners

```js
function mountWidget(el) {
  const onResize = () => el.style.width = `${window.innerWidth / 2}px`
  window.addEventListener('resize', onResize)
  // Leak: window keeps onResize alive, which keeps `el` alive after unmount
}
```

Fix with a cleanup function, or an `AbortController` to remove many listeners at once:

```js
function mountWidget(el) {
  const controller = new AbortController()
  window.addEventListener('resize', () => resize(el), { signal: controller.signal })
  document.addEventListener('keydown', onKey, { signal: controller.signal })
  return () => controller.abort()
}
```

### Timers and intervals

An active `setInterval` keeps its callback and everything it closes over alive forever. Always `clearInterval` on teardown. The same applies to `requestAnimationFrame` loops, `ResizeObserver`, `IntersectionObserver` and `MutationObserver` (call `disconnect()`), and WebSocket or `EventSource` connections.

### Detached DOM nodes

```js
const cache = []
function showModal() {
  const modal = document.createElement('div')
  document.body.append(modal)
  cache.push(modal) // removed later with modal.remove(), but `cache` still holds it
}
```

A detached node also retains its entire subtree and any listeners attached to it.

### Closures retaining large scopes

A long-lived callback keeps its outer scope alive. Closures created in the same scope share one context, so one closure referencing a big array keeps it alive for all of them. Copy only the values you need into long-lived callbacks.

### Unbounded caches and globals

Maps used as caches that only grow, accidental globals, stores that keep every past page's data, and `console.log(obj)` with DevTools open (the console keeps logged objects reachable).

### Framework-specific

- React: effects that subscribe without returning a cleanup, `setState` after unmount from a stale async call (wasted work rather than a leak since React 18 removed the warning), large objects held in module-level state.
- Long lists that never virtualise keep thousands of nodes and component instances alive.

## Weak references

| API | Holds key/value | Iterable | Use for |
|---|---|---|---|
| `Map` / `Set` | Strongly | Yes | Normal collections |
| `WeakMap` | Keys weakly (objects or non-registered symbols) | No | Metadata or caches keyed by objects you don't own |
| `WeakSet` | Values weakly | No | Tagging objects ("already processed") |
| `WeakRef` | Target weakly | — | Caches of large objects that may be recreated |
| `FinalizationRegistry` | — | — | Optional cleanup after an object is collected |

```js
const meta = new WeakMap()
function track(node) {
  meta.set(node, { seenAt: Date.now() }) // entry disappears when node is collected
}

const ref = new WeakRef(bigObject)
const maybe = ref.deref() // object or undefined if collected
```

`WeakRef` and `FinalizationRegistry` are non-deterministic: collection may happen late or never. Don't put correctness-critical logic in them.


### Bounded caches

When a cache must hold its values strongly, bound it. A least-recently-used cache evicts the entry that was used longest ago:

```js
class LruCache {
  constructor(limit) {
    this.limit = limit
    this.map = new Map() // Map iterates in insertion order: oldest first
  }

  get(key) {
    if (!this.map.has(key)) return undefined
    const value = this.map.get(key)
    this.map.delete(key) // move to the most-recent end
    this.map.set(key, value)
    return value
  }

  set(key, value) {
    this.map.delete(key)
    this.map.set(key, value)
    if (this.map.size > this.limit) {
      const oldest = this.map.keys().next().value
      this.map.delete(oldest)
    }
  }
}
```

Relying on `Map`'s insertion order is idiomatic in JavaScript; in a language-neutral interview, describe it as a hash map plus a doubly linked list.

## Profiling memory

1. **Reproduce** the suspected leak with a repeatable action (open and close a modal 10 times).
2. **Performance panel** with the Memory checkbox: a sawtooth that returns to baseline is healthy; a staircase that keeps rising after forced GC suggests a leak. Also watch the DOM node and listener counts.
3. **Heap snapshots**: take one, repeat the action, force GC (trash icon), take another, then use the **Comparison** view to see what was allocated and not freed. Filter by "Detached" to find detached DOM trees.
4. **Allocation instrumentation on timeline** shows which allocations survive over time, with stack traces.
5. Follow the **Retainers** panel up to the root you control (a listener, a cache, a closure) and remove that reference.


### A leak hunt, end to end

Suppose memory grows each time a user opens and closes a settings modal.

1. Open DevTools → Memory. Take a heap snapshot as a baseline.
2. Open and close the modal ten times. Click the bin icon to force a collection. Take a second snapshot.
3. In the second snapshot choose **Comparison** against the first. Sort by "# Delta". You see `+10` for `HTMLDivElement` and for a `SettingsForm` closure.
4. Type "Detached" in the class filter: ten detached `div` trees.
5. Select one and read the **Retainers** panel bottom-up: `div` ← `context` of `onKeyDown` ← `listeners` of `Window`.
6. The modal registered `window.addEventListener('keydown', onKeyDown)` and never removed it. The listener's closure holds the modal's root node.
7. Fix with an `AbortController` (or `removeEventListener`) on close, and repeat the test: the delta is now zero.

The pattern generalises: **repeat, compare, find the growing class, follow retainers to a root you own.**

`performance.measureUserAgentSpecificMemory()` reports memory in production but requires cross-origin isolation.

## Runtime performance

- **Long tasks** (>50 ms) block input. Break work into chunks and yield with `scheduler.yield()` where supported, falling back to `setTimeout`, or move work to a Web Worker.
- **INP** (Interaction to Next Paint) measures responsiveness; keep event handlers short and defer non-visual work.
- **Avoid layout thrashing**: batch DOM reads before writes; don't interleave `offsetHeight` reads with style writes in a loop.
- **Keep object shapes stable**: initialise all properties in the constructor in the same order. Adding properties ad hoc or using `delete` can push hot code into slower paths.
- **Avoid unnecessary allocation in hot paths**: e.g. creating closures or arrays per frame in an animation loop increases GC pressure.
- **Measure, don't guess**: `performance.mark` and `performance.measure` for custom timings; the Performance panel flame chart for where time goes.


### Hidden classes and inline caches

Engines give each object a hidden **shape** (V8 calls it a map or hidden class) describing which properties it has and in what order. Code that reads `point.x` remembers the shape it saw and where `x` was, an **inline cache**. Next time, if the shape matches, the read is a single memory load.

```js
function Point(x, y) {
  this.x = x
  this.y = y // every Point gets the same shape: {x, y}
}

const a = new Point(1, 2)
const b = new Point(3, 4)
b.z = 5 // b now has a different shape
delete a.x // a may drop to a slow "dictionary" mode
```

A property access that sees one shape is **monomorphic** and fastest; a few shapes is **polymorphic**; many shapes is **megamorphic** and falls back to a generic lookup. So: create objects with all their properties up front, in the same order, and avoid `delete` on hot objects (set the property to `undefined` instead).

### Yielding to the main thread

A long loop blocks input until it ends. Break it into chunks and yield between them:

```js
async function processAll(items, handle) {
  let lastYield = performance.now()
  for (const item of items) {
    handle(item)
    if (performance.now() - lastYield > 40) {
      await yieldToMain()
      lastYield = performance.now()
    }
  }
}

function yieldToMain() {
  if (globalThis.scheduler?.yield) return scheduler.yield()
  return new Promise((resolve) => setTimeout(resolve, 0))
}
```

`scheduler.yield()` lets pending input run and then continues your task with priority; the `setTimeout` fallback puts it at the back of the task queue.

### Moving work off the main thread

CPU-heavy work that doesn't touch the DOM (parsing large files, image processing, search indexing) belongs in a Web Worker:

```js
// main.js
const worker = new Worker(new URL('./search-worker.js', import.meta.url), { type: 'module' })
worker.postMessage({ query, documents })
worker.onmessage = (event) => render(event.data)

// search-worker.js
self.onmessage = (event) => {
  const { query, documents } = event.data
  self.postMessage(documents.filter((d) => d.text.includes(query)))
}
```

Messages are copied with the structured clone algorithm; for large binary data, transfer an `ArrayBuffer` instead of copying it.

### Measuring

```js
performance.mark('filter-start')
applyFilters()
performance.mark('filter-end')
performance.measure('filter', 'filter-start', 'filter-end')
```

## Common interview questions

**How does JavaScript garbage collection work?**
The engine periodically marks every object reachable from roots (globals, stack, live closures, browser-held references) and frees the rest. Engines are generational: frequent cheap collections for new objects, rarer full collections for old ones.

**Can circular references leak?**
Not with mark-and-sweep. Two objects referencing each other are collected once nothing reachable points at them. (Old IE reference counting across JS and COM objects did leak; that's history.)

**What's the most common leak in SPAs?**
Listeners, subscriptions and timers that outlive the component that created them, keeping its closures and DOM nodes alive.

**When would you use a `WeakMap`?**
To attach data to objects whose lifetime you don't control, such as DOM nodes or third-party objects, without preventing their collection.

**How do you find a leak?**
Repeat an action several times, compare heap snapshots before and after with forced GC, look for growing counts or detached nodes, and follow the retainer chain to the reference you forgot to clean up.

**Why doesn't `WeakMap` have `size` or iteration?**
Its contents depend on GC timing, so exposing them would make program behaviour non-deterministic.

## Pitfalls

- Using `delete` on hot objects or setting properties in varying order.
- Assuming removing a node from the DOM frees it.
- Building caches with `Map` and no eviction.
- Relying on `FinalizationRegistry` callbacks to release critical resources.
- Profiling in development mode only; framework dev builds allocate far more than production.

## Key takeaways

- Heap objects live while any path from a root (globals, the stack, closures, browser-held listeners and timers) reaches them.
- Collectors are generational: short-lived garbage is cheap; medium-lived churn is expensive.
- Most SPA leaks are listeners, timers, observers and subscriptions that outlive their component.
- Use `WeakMap` for metadata on objects you don't own, and bound every strong cache.
- Find leaks by repeating an action, comparing snapshots and following retainers.
- For speed: stable object shapes, short tasks that yield, and workers for heavy computation.
