---
title: Async Patterns Cookbook
order: 10
summary: Short, correct implementations of the async utilities interviewers ask for — sleep, timeouts, retry with jitter, pools, dedupe, cancellation, polling and pagination.
---

Async utility questions check three things: that the promise settles exactly once, that errors propagate instead of disappearing, and that timers and listeners are cleaned up. Each recipe below is the version worth writing in an interview, followed by when to use it and the follow-ups. The promises article covers the combinators themselves.

## sleep

```js
function sleep(ms, { signal } = {}) {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted() // a throw inside the executor rejects the promise
    const onAbort = () => { clearTimeout(id); reject(signal.reason) }
    const id = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}
```

The plain one-liner `new Promise((r) => setTimeout(r, ms))` is fine unless cancellation comes up. Removing the abort listener on resolve avoids accumulating listeners on a long-lived signal.

## Timeout race

```js
function withTimeout(promise, ms, message = 'Timed out') {
  let id
  const timer = new Promise((_, reject) => {
    id = setTimeout(() => reject(new Error(message)), ms)
  })
  return Promise.race([promise, timer]).finally(() => clearTimeout(id))
}
```

Clearing the timer matters: without it, a fast success leaves a pending timer that keeps a Node process alive. The race does not stop the losing work. For `fetch`, prefer real cancellation: `fetch(url, { signal: AbortSignal.timeout(5000) })`, which rejects with a `TimeoutError` `DOMException`.

## Retry with exponential backoff and jitter

```js
async function retry(fn, { retries = 3, base = 200, max = 5000, shouldRetry = () => true, signal } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn(attempt)
    } catch (err) {
      if (attempt >= retries || !shouldRetry(err)) throw err
      const cap = Math.min(max, base * 2 ** attempt)
      await sleep(Math.random() * cap, { signal }) // "full jitter"
    }
  }
}

const res = await retry(() => fetchJson('/api/items'), {
  shouldRetry: (e) => e.status === undefined || e.status >= 500 || e.status === 429,
})
```

- `return await` inside `try` is required; `return fn()` would let the rejection escape the `catch`.
- Jitter spreads retries from many clients so they don't hit a recovering server in synchronized waves.
- Only retry idempotent operations and transient errors: network failures, 5xx, 429 (honour `Retry-After` when present). Never retry a 400.
- Total attempts are `retries + 1`; state that convention.

## Concurrency-limited pool

```js
async function pool(tasks, limit) {
  const results = new Array(tasks.length)
  let next = 0
  async function worker() {
    while (next < tasks.length) {
      const i = next++ // safe: no await between read and increment
      try {
        results[i] = { status: 'fulfilled', value: await tasks[i]() }
      } catch (reason) {
        results[i] = { status: 'rejected', reason }
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker))
  return results
}
```

Takes task functions, not promises: a promise has already started, so you can't limit it. Results keep input order and use the `allSettled` shape, so one failure doesn't abandon the rest. For fail-fast behaviour, let the error escape the worker and `Promise.all` rejects (the other workers keep running unless you add an abort flag).

Use it for bulk uploads, crawling, or prefetching where the server or browser would otherwise be flooded (browsers allow roughly six HTTP/1.1 connections per origin anyway).

## Sequential execution

```js
// Each step receives the previous result
const sequence = (fns, initial) =>
  fns.reduce((acc, fn) => acc.then(fn), Promise.resolve(initial))

// Same thing, more readable
async function runInOrder(items, fn) {
  const out = []
  for (const item of items) out.push(await fn(item))
  return out
}
```

Use when order matters (migrations, dependent writes) or when the server can't take parallel requests. `items.forEach(async …)` is the classic wrong answer: it starts everything at once and returns before anything finishes.

## Dedupe in-flight requests

```js
function dedupe(fn, keyOf = (...args) => JSON.stringify(args)) {
  const inFlight = new Map()
  return (...args) => {
    const key = keyOf(...args)
    if (inFlight.has(key)) return inFlight.get(key)
    const p = Promise.resolve()
      .then(() => fn(...args)) // a sync throw becomes a rejection
      .finally(() => inFlight.delete(key))
    inFlight.set(key, p)
    return p
  }
}

const getUser = dedupe((id) => fetch(`/api/users/${id}`).then((r) => r.json()))
```

Two components asking for the same user at mount share one request. Deleting on settle (not on success only) means a failure isn't cached forever. This differs from memoization, which keeps results after they arrive; combining both with an expiry gives you a tiny SWR-style cache.

## Cancellation with AbortController

```js
const controller = new AbortController()
const { signal } = controller

async function search(query, signal) {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

search('react', signal).catch((err) => {
  if (err.name === 'AbortError') return // expected, not a failure
  showError(err)
})
controller.abort()

// Combine a user cancel with a timeout
const combined = AbortSignal.any([signal, AbortSignal.timeout(8000)])
```

The latest-wins pattern for typeahead: keep the previous controller, call `abort()` before starting a new request. Your own async functions should accept a `signal`, call `signal.throwIfAborted()` between steps, and pass it down to `fetch` and `sleep`. One `AbortController` can also remove many event listeners at once via `addEventListener(type, fn, { signal })`.

## Polling with backoff

```js
async function poll(check, { interval = 1000, maxInterval = 30000, factor = 1.5, signal } = {}) {
  let wait = interval
  while (true) {
    const result = await check()
    if (result.done) return result.value
    await sleep(wait, { signal })
    wait = Math.min(maxInterval, wait * factor)
  }
}

const report = await poll(async () => {
  const job = await fetchJson(`/api/jobs/${id}`)
  return { done: job.status === 'complete', value: job.result }
}, { signal: AbortSignal.timeout(120_000) })
```

Prefer a loop with `await sleep` over `setInterval`: the next poll can't start before the previous one finishes. Mention the alternatives when polling gets expensive: server-sent events or WebSockets for push, and pausing while `document.hidden` is true.

## promisify

```js
function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, (err, value) => (err ? reject(err) : resolve(value)))
    })
  }
}

const readFile = promisify(fs.readFile)
const text = await readFile('notes.txt', 'utf8')
```

Follow-ups: preserving `this` (hence `function` and `fn.call`), callbacks with multiple result values (resolve with an array), and Node's built-in `util.promisify`, which also honours a `util.promisify.custom` symbol.

## Async iteration over a paginated API

```js
async function* paginate(fetchPage) {
  let cursor
  do {
    const { items, nextCursor } = await fetchPage(cursor)
    yield* items
    cursor = nextCursor
  } while (cursor)
}

for await (const item of paginate((c) => fetchJson(`/api/items?cursor=${c ?? ''}`))) {
  render(item)
  if (enough()) break // calls the generator's return(); no further pages are fetched
}
```

Pages are fetched lazily, only as the consumer asks for more, which gives natural back-pressure. `Array.fromAsync(paginate(…))` (ES2024) collects everything when you do want it all.

## Latest-only (ignore stale responses)

Typeahead search is the classic race: the request for "re" can finish after the request for "rea", overwriting newer results with older ones. Abort the previous request when a new one starts:

```js
function latestOnly(fn) {
  let controller = null
  return async function (...args) {
    controller?.abort() // cancel the previous call's work
    controller = new AbortController()
    return fn(...args, controller.signal)
  }
}

const search = latestOnly((query, signal) =>
  fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal }).then((r) => r.json()),
)
```

Callers of an aborted call see an `AbortError`; ignore it. When the work can't be aborted, use a counter instead: increment it per call, remember the value, and drop the result if the counter has moved on.

## Async mutex

JavaScript runs one piece of code at a time, but an `async` function can be interrupted at every `await`. Two calls that read, await, then write can interleave and lose an update:

```js
let balance = 100
async function withdraw(amount) {
  const current = balance // both calls read 100
  await audit(amount) // both pause here
  balance = current - amount // the second write overwrites the first
}
```

A mutex makes callers wait their turn by chaining onto a shared promise:

```js
function createMutex() {
  let last = Promise.resolve()
  return function runExclusive(task) {
    const result = last.then(() => task())
    last = result.catch(() => {}) // a failed task must not block the queue
    return result
  }
}

const exclusive = createMutex()
await Promise.all([exclusive(() => withdraw(30)), exclusive(() => withdraw(50))]) // balance 20
```

## Batching (DataLoader-style)

Many components asking for one user each within the same tick can be served by a single batched request:

```js
function createBatcher(loadMany) {
  let pending = new Map() // key -> { promise, resolve, reject }
  let scheduled = false

  async function flush() {
    const batch = pending
    pending = new Map()
    scheduled = false
    try {
      const results = await loadMany([...batch.keys()]) // same order as the keys
      ;[...batch.values()].forEach((entry, i) => entry.resolve(results[i]))
    } catch (err) {
      batch.forEach((entry) => entry.reject(err))
    }
  }

  return function load(key) {
    if (!pending.has(key)) {
      const { promise, resolve, reject } = Promise.withResolvers()
      pending.set(key, { promise, resolve, reject })
    }
    if (!scheduled) {
      scheduled = true
      queueMicrotask(flush) // collect every call made in this tick
    }
    return pending.get(key).promise
  }
}

const loadUser = createBatcher((ids) => fetch(`/api/users?ids=${ids.join(',')}`).then((r) => r.json()))
```

Scheduling the flush as a microtask gathers every `load` made during the current synchronous run, then sends one request. Repeated keys in the same tick share a promise, so this also deduplicates.

## Rate limiting with a token bucket

A pool limits how many requests run **at once**; a rate limiter limits how many **start per second**:

```js
function rateLimit(fn, perSecond) {
  let tokens = perSecond
  let lastRefill = Date.now()
  const queue = []

  function refill() {
    const now = Date.now()
    tokens = Math.min(perSecond, tokens + ((now - lastRefill) / 1000) * perSecond)
    lastRefill = now
  }

  function drain() {
    refill()
    while (queue.length > 0 && tokens >= 1) {
      tokens -= 1
      const { args, resolve, reject } = queue.shift()
      fn(...args).then(resolve, reject)
    }
    if (queue.length > 0) setTimeout(drain, 1000 / perSecond)
  }

  return (...args) =>
    new Promise((resolve, reject) => {
      queue.push({ args, resolve, reject })
      drain()
    })
}
```

Tokens refill continuously up to the bucket size, which allows short bursts while keeping the long-run average at `perSecond`. (A queue with `shift` is fine here: it stays short.)

## Choosing a pattern

| Need | Pattern |
|---|---|
| Wait, or delay a retry | `sleep` with optional signal |
| Bound the wait for slow work | `withTimeout` or `AbortSignal.timeout` |
| Flaky network, idempotent call | `retry` with backoff and jitter |
| Many requests, limited capacity | `pool` |
| Order-dependent steps | `for…of` with `await` |
| Same request from many callers | `dedupe` |
| User navigates away or types again | `AbortController` |
| Long-running server job | `poll` with backoff |
| Callback API | `promisify` |
| Cursor-based API | async generator |
| Only the newest response matters | latest-only with abort |
| Read-modify-write across `await`s | async mutex |
| Many small lookups in one tick | batcher |
| Requests per second capped | token bucket |

## Common interview questions

**Why does the pool take functions instead of promises?**
A promise represents work that has already started. To limit concurrency you must control when each task starts, which means receiving a function that creates the promise.

**Does `Promise.race` cancel the slower promise?**
No. The losing work keeps running and its result is ignored. Real cancellation needs an `AbortSignal` passed into the work itself, such as `fetch`'s `signal` option.

**Why add jitter to exponential backoff?**
Without jitter, clients that failed together retry together, producing synchronized spikes against a recovering service. Randomizing each delay spreads the load.

**How do you avoid race conditions in typeahead search?**
Abort the previous request when a new query starts, or tag each request with an incrementing id and ignore responses that aren't the latest. Debouncing reduces request volume but doesn't fix ordering on its own.

**What's the difference between dedupe and memoize for async functions?**
Dedupe shares a promise only while it's pending and then forgets it. Memoize keeps the result afterwards, which needs an invalidation strategy and should usually avoid caching rejections.

**Why is `for await…of` useful for pagination?**
It pulls pages on demand, so breaking out early stops further requests. The consumer code reads like a plain loop while the generator hides cursor handling.

**When would you use `Promise.allSettled` inside these utilities?**
When partial success is acceptable and the caller needs per-item outcomes, like a batch upload report. The pool above returns the same shape so callers can treat it like `allSettled`.

## Key takeaways

- Every async utility must settle exactly once, propagate errors and clean up timers and listeners.
- Limit concurrency by controlling when work **starts**: accept functions, not promises.
- Cancellation is cooperative: pass an `AbortSignal` into the work.
- `await` points are where async code interleaves; use a mutex for read-modify-write sequences.
- Microtask scheduling is a cheap way to batch everything requested in one tick.
