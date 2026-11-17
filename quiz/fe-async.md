---
title: Async JavaScript
order: 22
module: javascript
summary: The event loop, tasks and microtasks, frame-aligned scheduling, Promise semantics and combinators, async/await, cancellation, timers, fetch, workers and streams.
---

## How does the event loop decide what runs next?

It takes the oldest runnable task and runs it to completion, then drains the microtask queue completely, including microtasks queued along the way. If a frame is due, it runs the rendering steps (rAF callbacks, style, layout, paint). Then it repeats. Nothing interrupts running JavaScript.

## What's the difference between a task and a microtask?

Tasks (macrotasks) come from timers, user input events, `MessageChannel`, network callbacks and the initial script; one runs per loop iteration. Microtasks come from promise reactions, `queueMicrotask`, `await` continuations and `MutationObserver`; the whole queue drains whenever the call stack empties, before the next task or render.

## What does this log: `setTimeout(() => log('a')); Promise.resolve().then(() => log('b')); log('c')`?

`c`, `b`, `a`. The synchronous log runs first as part of the current task, the promise reaction is a microtask that runs as soon as the stack empties, and the timeout callback is a separate task that waits for the next loop iteration.

## What does this log: `async function f() { log(1); await null; log(2) } f(); log(3)`?

`1`, `3`, `2`. An async function runs synchronously up to its first `await`; the rest of the body is scheduled as a microtask, so control returns to the caller, which logs `3`, before `2`.

## Why can an endless chain of microtasks freeze the page when an endless chain of `setTimeout`s doesn't?

The microtask queue is drained to empty before the browser may render or take the next task, so a microtask that keeps queuing another never yields: no paint, no input. Each `setTimeout` callback is its own task, and the browser can render and handle events between tasks.

## When would you use `queueMicrotask` instead of `setTimeout(fn, 0)`?

When work must run after the current synchronous code but before anything else, such as rendering, input or other tasks: for example, batching several state changes into one notification. Errors thrown inside it surface as normal uncaught exceptions, not promise rejections. Use `setTimeout` (or `scheduler.yield()`) when you actually want to yield to the browser.

## Where does `requestAnimationFrame` run relative to tasks and microtasks?

In the rendering step, just before style, layout and paint, roughly once per display refresh, and it pauses in background tabs. Microtasks queued in a rAF callback run right after that callback. It's the place to make visual changes; a `setTimeout` might run several times per frame or miss one.

## When is `requestIdleCallback` the right tool, and what's the catch?

For low-priority work like analytics batching or prefetching, run when the browser has idle time; the `deadline.timeRemaining()` argument tells you how long you have. Under constant load it may never run, so pass `{ timeout }` if it must happen eventually. Safari has long lacked it, so feature-detect and fall back to `setTimeout`.

## Why isn't `setTimeout(fn, 0)` actually zero milliseconds?

The delay is a minimum, not a schedule: the callback still waits behind other tasks. Browsers clamp nested timers to at least 4 ms after five levels of nesting, throttle timers in background tabs to about once a second, and Chrome throttles chained timers in long-hidden pages to once a minute.

## What happens if you pass `setTimeout` a delay larger than about 24.8 days?

The delay is stored as a signed 32-bit integer, so anything above 2^31 − 1 ms overflows and the callback fires almost immediately. For long waits, chain shorter timeouts or check a target timestamp periodically.

## What are a Promise's states, and can it change once settled?

Pending, fulfilled or rejected; fulfilled and rejected together are "settled", and a settled promise never changes again. Extra calls to `resolve` or `reject` are ignored. Resolving with another promise or thenable makes it follow that one, so it can be "resolved" yet still pending.

## Does the Promise constructor's executor run synchronously?

Yes. `new Promise(executor)` calls the executor immediately, before the constructor returns. A synchronous `throw` inside it becomes a rejection, but a throw inside an async callback, such as a `setTimeout` within the executor, is not caught: it's an uncaught error and the promise stays pending forever.

## Why does a `.then` callback run asynchronously even on an already-fulfilled promise?

Reactions are always queued as microtasks, never called inline. That guarantees code after `.then(...)` runs before the callback whether or not the promise had settled, so the ordering never depends on timing.

## How do `Promise.all`, `allSettled`, `race` and `any` differ?

`all` fulfils with every value in input order, or rejects on the first rejection. `allSettled` always fulfils with `{ status, value | reason }` for each. `race` settles like whichever settles first. `any` fulfils with the first fulfilment and rejects with an `AggregateError` only if all reject. Edge cases: `all([])` fulfils with `[]`; `race([])` stays pending forever.

## If one promise in `Promise.all` rejects, do the other operations stop?

No. `Promise.all` just stops waiting: the other operations keep running and their results are discarded. Promises have no built-in cancellation; to really stop the work, pass a shared `AbortSignal` and abort it when `all` rejects.

## What does `Promise.withResolvers` give you?

An object `{ promise, resolve, reject }` (ES2024), replacing the "deferred" pattern where you capture `resolve` and `reject` from inside the constructor. It's handy when the code that settles the promise lives somewhere else, such as an event handler or a message callback.

## What does an `async` function return, and when does its body run?

It always returns a promise. The body runs synchronously until the first `await`; a `return` value fulfils the promise and a `throw` rejects it, even a throw before any `await`. Returning a promise makes the outer promise follow it.

## What actually happens at an `await`?

The operand is converted to a promise, the function suspends and returns control to its caller, and the rest of the function is queued as a microtask once that promise settles. A fulfilment becomes the expression's value; a rejection is thrown at the `await`. Even `await 42` costs one microtask hop.

## How do you handle errors with async/await, and what does an unhandled rejection do?

Wrap awaits in `try/catch`, or attach `.catch` to the returned promise at the boundary. A rejection with no handler fires `unhandledrejection` on `window` in browsers, and by default crashes the process in modern Node.

## Why isn't `return await` always redundant?

Inside a `try` block it matters: `return promise` hands the promise straight to the caller, so a rejection skips your `catch` and `finally` runs too early, while `return await promise` lets the `catch` see the rejection. Outside `try`, the two behave the same, though `await` gives a fuller async stack trace.

## Why doesn't `await` inside `forEach` wait?

`forEach` calls the async callback, ignores the promise it returns, and moves on, so all iterations start at once and the surrounding function continues before any finish. Use `for...of` with `await` for sequential work, or `await Promise.all(items.map(fn))` for parallel.

## How do you run independent awaits in parallel, and what's the trap in doing it by hand?

Start both operations first, then await them together: `const [a, b] = await Promise.all([getA(), getB()])`. If you instead start both and `await` them one after the other, a rejection of the second while you're still awaiting the first has no handler yet, which triggers an unhandled-rejection report.

## How would you run 100 requests with at most 5 in flight?

Create 5 workers that each loop, taking the next index from a shared counter, awaiting that request and storing the result at its index, then `await Promise.all(workers)`. That keeps exactly 5 busy until the queue drains and preserves result order. Batching in groups of 5 is simpler but idles while the slowest of each batch finishes.

## When would you debounce rather than throttle?

Debounce when only the final value matters after activity stops: search-as-you-type or saving a draft. Throttle when you need regular updates during continuous activity: scroll position, drag or resize handling, at most once per interval. For visual updates, aligning to `requestAnimationFrame` is often better than either.

## How do you cancel a `fetch`?

Create an `AbortController`, pass `controller.signal` in the fetch options, and call `controller.abort()`. The fetch promise rejects with a `DOMException` named `AbortError` (or with the reason you passed to `abort`). `AbortSignal.timeout(ms)` gives a signal that aborts with `TimeoutError`, and `AbortSignal.any([...])` combines several.

## How would you make your own async function cancellable?

Accept a `signal` option, call `signal.throwIfAborted()` at checkpoints, pass the signal down to `fetch` and other APIs, and listen for its `abort` event to clear timers or close resources. Passing `{ signal }` to `addEventListener` also removes listeners automatically on abort.

## Why doesn't `fetch` reject on a 404 or 500?

An HTTP error status is still a successful network exchange: the promise fulfils as soon as response headers arrive. Check `response.ok` (status 200 to 299) or `response.status` yourself. `fetch` rejects only when no usable response arrives: network failure, DNS errors, a CORS block or an abort, usually as a `TypeError`.

## What happens if you read a fetch response body twice?

The body is a stream that can be consumed only once, so a second `.json()` or `.text()` rejects with a `TypeError`, and `response.bodyUsed` is true. Call `response.clone()` before the first read if two consumers need it, for example to cache it and also parse it.

## When would you move work to a Web Worker, and what can't a worker do?

When CPU-heavy work like parsing, image processing, diffing or search indexing would block the main thread and hurt responsiveness. Workers run on their own thread with their own event loop, and have `fetch`, timers, IndexedDB, WebSockets and `OffscreenCanvas`, but no DOM, no `document` or `window`, and no `localStorage`. They talk to the page only through messages.

## How does `postMessage` move data between threads, and how do you avoid copying?

By default it structured-clones the data, a deep copy that costs time for large payloads. Pass transferables in the transfer list, such as `ArrayBuffer`, `MessagePort`, `ImageBitmap` or `OffscreenCanvas`, to move ownership with no copy; the sender's buffer becomes detached. True shared memory needs `SharedArrayBuffer`, which requires a cross-origin-isolated page (COOP and COEP headers).

## How do dedicated workers, shared workers and service workers differ?

A dedicated worker belongs to the page that created it and dies with it. A `SharedWorker` is one instance shared by all same-origin pages that connect to it via `MessagePort`. A service worker is a separate, event-driven proxy that intercepts network requests for its scope, outlives pages, and handles offline caching and push.

## What are streams useful for in the browser?

Processing data while it arrives instead of buffering it all: `response.body` is a `ReadableStream`, so you can show download progress, render a streamed LLM or NDJSON response chunk by chunk, or pipe it through `TextDecoderStream` or `DecompressionStream`. `pipeThrough` and `pipeTo` compose transforms and propagate cancellation.

## What is backpressure in streams?

The mechanism that slows a producer when the consumer can't keep up. Each stream has a queue with a high-water mark; when it's full, `desiredSize` drops to zero or below, a source's `pull` isn't called, and `pipeTo` stops reading upstream. Without it, a fast source buffers unbounded data in memory.

## How do you break up a long-running loop without blocking input?

Process the items in chunks and yield to the event loop between chunks, so input and rendering can run, which keeps INP down. `await scheduler.yield()` (feature-detect) resumes ahead of other queued tasks; a `setTimeout` or `MessageChannel` hop works everywhere but goes to the back of the queue. Microtasks don't yield, and truly heavy work belongs in a worker.

## How does `process.nextTick` in Node differ from a promise microtask?

The nextTick queue drains before the promise microtask queue, so a `nextTick` callback queued after a `.then` still runs first. Recursive `nextTick` calls can starve I/O just like recursive microtasks. Node also has `setImmediate`, which runs in the check phase after I/O polling.
