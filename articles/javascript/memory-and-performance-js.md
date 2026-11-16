---
title: Memory and Performance in JavaScript
order: 8
summary: How garbage collection decides what lives, the classic leaks in frontend apps, weak references, and how to profile.
---

Single-page apps live for hours, so small leaks add up to sluggish tabs and crashes. Interviewers ask how GC works at a high level, which patterns leak, how `WeakMap` helps, and how you would find a leak or a slow interaction in DevTools.

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

## Profiling memory

1. **Reproduce** the suspected leak with a repeatable action (open and close a modal 10 times).
2. **Performance panel** with the Memory checkbox: a sawtooth that returns to baseline is healthy; a staircase that keeps rising after forced GC suggests a leak. Also watch the DOM node and listener counts.
3. **Heap snapshots**: take one, repeat the action, force GC (trash icon), take another, then use the **Comparison** view to see what was allocated and not freed. Filter by "Detached" to find detached DOM trees.
4. **Allocation instrumentation on timeline** shows which allocations survive over time, with stack traces.
5. Follow the **Retainers** panel up to the root you control (a listener, a cache, a closure) and remove that reference.

`performance.measureUserAgentSpecificMemory()` reports memory in production but requires cross-origin isolation.

## Runtime performance

- **Long tasks** (>50 ms) block input. Break work into chunks and yield with `scheduler.yield()` where supported, falling back to `setTimeout`, or move work to a Web Worker.
- **INP** (Interaction to Next Paint) measures responsiveness; keep event handlers short and defer non-visual work.
- **Avoid layout thrashing**: batch DOM reads before writes; don't interleave `offsetHeight` reads with style writes in a loop.
- **Keep object shapes stable**: initialise all properties in the constructor in the same order. Adding properties ad hoc or using `delete` can push hot code into slower paths.
- **Avoid unnecessary allocation in hot paths**: e.g. creating closures or arrays per frame in an animation loop increases GC pressure.
- **Measure, don't guess**: `performance.mark` and `performance.measure` for custom timings; the Performance panel flame chart for where time goes.

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
