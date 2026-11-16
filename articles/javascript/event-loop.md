---
title: The Event Loop
order: 1
summary: Call stack, tasks, microtasks and rendering — and how to predict the output order of any async snippet.
---

JavaScript runs on a single thread per agent, so everything asynchronous is scheduled through the event loop. Interviewers test it with "what does this print?" puzzles; you win them by knowing exactly which queue each callback lands in and when each queue drains.

## The moving parts

| Part | What it holds | When it runs |
|---|---|---|
| Call stack | Frames of currently executing functions | Now; synchronous code runs to completion |
| Task queue(s) | `setTimeout`, `setInterval`, UI events, `MessageChannel`, network callbacks | One task per loop iteration |
| Microtask queue | Promise reactions, `await` continuations, `queueMicrotask`, `MutationObserver` | Drained completely after every task (and whenever the stack empties) |
| Rendering steps | `requestAnimationFrame` callbacks, style, layout, paint | When the browser decides to render, typically ~60–120 times a second |

Browsers actually keep several task queues (user input may be prioritised over timers), but for puzzles treat them as one FIFO queue.

## One iteration of the loop

```text
1. Pick the oldest runnable task and run it to completion.
2. Drain the microtask queue — including microtasks queued by microtasks.
3. If it's time to render:
     a. run resize / scroll / media-query steps
     b. run requestAnimationFrame callbacks
     c. recalculate style and layout, run ResizeObserver / IntersectionObserver
     d. paint (and composite)
4. Repeat.
```

Key consequences:

- A microtask that keeps queuing microtasks starves rendering and input forever, just like an infinite loop.
- A long task (>50 ms) blocks clicks and paints; that's what hurts INP.
- The initial script is itself a task, so its microtasks run before any `setTimeout` callback.

## Scheduling APIs compared

| API | Queue | Typical use |
|---|---|---|
| `setTimeout(fn, 0)` | Task (min delay; clamped to ≥4 ms after 5 nested levels; throttled in background tabs) | Yield to the browser, defer non-urgent work |
| `queueMicrotask(fn)` | Microtask | Run right after current code but before rendering or other tasks |
| `Promise.resolve().then(fn)` | Microtask | Same timing as `queueMicrotask`, but errors become rejections |
| `requestAnimationFrame(fn)` | Before next paint | Visual updates, reading/writing layout once per frame |
| `requestIdleCallback(fn)` | When the browser is idle | Low-priority work like analytics |
| `scheduler.postTask(fn, { priority })` | Prioritised task | Fine-grained priority (Chromium; feature-detect) |
| `scheduler.yield()` | Continuation task with priority | Break up long tasks without losing your place (feature-detect) |

`queueMicrotask` reports thrown errors like a normal uncaught exception; a `.then` callback that throws produces a rejected promise instead.

## Output-order puzzles

### Puzzle 1: the basics

```js
console.log('1')
setTimeout(() => console.log('2'), 0)
Promise.resolve().then(() => console.log('3'))
queueMicrotask(() => console.log('4'))
console.log('5')
```

Answer: `1 5 3 4 2`. Synchronous logs first, then the microtasks in queue order, then the timer task.

### Puzzle 2: async functions

```js
async function a() {
  console.log('a1')
  await b()
  console.log('a2')
}
async function b() {
  console.log('b')
}
console.log('start')
a()
Promise.resolve().then(() => console.log('p'))
console.log('end')
```

Answer: `start a1 b end a2 p`. An `async` function runs synchronously until its first `await`. `b()` logs immediately and returns a fulfilled promise; the continuation of `a` is queued as a microtask before `p` is queued.

### Puzzle 3: microtasks inside a task

```js
setTimeout(() => {
  console.log('t1')
  Promise.resolve().then(() => console.log('m1'))
}, 0)
setTimeout(() => console.log('t2'), 0)
```

Answer: `t1 m1 t2`. After each task, the microtask queue drains before the next task starts.

### Puzzle 4: interleaved chains

```js
Promise.resolve()
  .then(() => console.log(1))
  .then(() => console.log(2))
Promise.resolve()
  .then(() => console.log(3))
  .then(() => console.log(4))
```

Answer: `1 3 2 4`. Each `.then` only queues its successor when it runs, so the two chains alternate.

### Puzzle 5: returning a promise from then

```js
Promise.resolve()
  .then(() => { console.log('A'); return Promise.resolve('x') })
  .then((v) => console.log('B', v))
Promise.resolve()
  .then(() => console.log(1))
  .then(() => console.log(2))
  .then(() => console.log(3))
  .then(() => console.log(4))
```

Answer: `A 1 2 3 B x 4`. Returning a thenable from a `then` callback costs two extra microtask hops (one to call its `then`, one to settle), so `B` is delayed behind the other chain.

### Puzzle 6: rAF vs setTimeout

```js
setTimeout(() => console.log('timeout'), 0)
requestAnimationFrame(() => console.log('raf'))
Promise.resolve().then(() => console.log('micro'))
```

Answer: `micro` first, always. The order of `timeout` and `raf` is not guaranteed: it depends on whether a rendering opportunity arrives before the timer task is picked. Say that explicitly; it's the point of the question.

## Node.js differences

- `process.nextTick` callbacks run before promise microtasks.
- `setImmediate` runs in the "check" phase after I/O; relative order with `setTimeout(fn, 0)` from the main module is not deterministic, but inside an I/O callback `setImmediate` runs first.
- No rendering steps or `requestAnimationFrame`.

## Common interview questions

**Is JavaScript single-threaded?**
Each realm's JavaScript runs on one thread at a time. The browser itself is multi-threaded (networking, compositing, workers), and Web Workers give you extra JS threads with message passing.

**Why doesn't `setTimeout(fn, 0)` run immediately?**
It queues a task. It runs only after the current task finishes, all microtasks drain, and possibly a render happens. The delay is a minimum, not a guarantee.

**Microtask vs task in one sentence?**
Microtasks run as soon as the stack is empty and all of them drain before the next task; tasks run one per loop iteration with a chance to render in between.

**How do you keep the UI responsive during heavy work?**
Chunk the work and yield between chunks with `scheduler.yield()` or `setTimeout`, or move it to a Web Worker. Yielding with microtasks does not help because rendering can't happen until they drain.

**When should DOM measurements go in `requestAnimationFrame`?**
When you're animating or batching visual writes: read and write once per frame, right before paint, avoiding redundant layouts.

**What is `MutationObserver`'s timing?**
Its callbacks are microtasks, so they see a batch of DOM changes after the current script but before the next paint.

## Pitfalls

- Assuming `await` always yields to timers. It only yields to the microtask queue.
- Recursively scheduling microtasks to "not block" — it blocks rendering just the same.
- Using `setInterval` for animations; use `requestAnimationFrame` so updates align with frames and pause in background tabs.
- Forgetting that background tabs throttle timers heavily (often to once per second or less).
