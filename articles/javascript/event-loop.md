---
title: The Event Loop
order: 1
summary: Call stack, tasks, microtasks and rendering — and how to predict the output order of any async snippet.
---

JavaScript runs your code on a single thread, yet a page can wait for a network response, run a timer and react to clicks all at once. The event loop is how that works. Interviewers test it in two ways: "what does this print?" puzzles, and "why is this page janky?" questions. Both come down to the same skill: knowing which queue every callback lands in, and when that queue gets drained.

## Why there is an event loop at all

Two rules shape everything else:

1. **One thread runs your JavaScript.** At any moment at most one function of yours is executing. Two callbacks never run at the same time, so you don't need locks around shared variables.
2. **Run to completion.** Once a piece of JavaScript starts, nothing interrupts it until it returns. A click handler can't fire halfway through your loop.

That leaves a problem. If `fetch` made the thread wait for the network, the whole page would freeze. So slow work happens **outside** JavaScript. The browser hands timers, network requests and input handling to its own internal threads. When one of them finishes, the browser doesn't call your callback directly. It puts a job in a queue. The event loop is the mechanism that takes jobs off those queues and runs them on the JavaScript thread, one at a time, whenever the thread is free.

```text
 your code ──calls──▶ setTimeout / fetch / addEventListener
                           │  (handled by the browser, off the JS thread)
                           ▼
                   job finished → callback placed in a queue
                           │
 event loop: when the call stack is empty, take the next job and run it
```

## The moving parts

| Part | What it holds | When it runs |
|---|---|---|
| Call stack | Frames of the functions executing right now | Immediately. Synchronous code runs to completion. |
| Task queue(s) | `setTimeout`, `setInterval`, UI events, `MessageChannel`, network callbacks | One task per turn of the loop |
| Microtask queue | Promise reactions, `await` continuations, `queueMicrotask`, `MutationObserver` | Drained **completely** after every task, and whenever the stack empties |
| Rendering steps | `requestAnimationFrame` callbacks, style, layout, paint | When the browser decides to draw a frame, typically 60–120 times a second |

Browsers really keep several task queues and may prioritise some (user input over timers, for example). For puzzles, treat tasks as one first-in, first-out queue. The **order within** the microtask queue, on the other hand, is strict and is what the puzzles test.

## One turn of the loop

```text
1. Take the oldest runnable task and run it to completion.
2. Drain the microtask queue, including microtasks queued by microtasks.
3. If it's time to render:
     a. run resize, scroll and media-query steps
     b. run requestAnimationFrame callbacks
     c. recalculate style and layout, run ResizeObserver and IntersectionObserver
     d. paint and composite
4. Repeat.
```

Three consequences follow directly from this and come up constantly:

- **The initial script is itself a task.** So every microtask it queues runs before any `setTimeout` callback, even one with a delay of 0.
- **Microtasks can starve everything.** Step 2 keeps going until the queue is empty. A microtask that always queues another microtask never lets step 3 or the next task happen. The page freezes exactly as if you had written `while (true) {}`.
- **A long task blocks input and paint.** If one task takes 300 ms, a click that arrives meanwhile waits for it to finish, and no frame is painted in between. Tasks longer than 50 ms are called long tasks, and they are the main cause of poor Interaction to Next Paint (INP).

## What `await` really does

Most puzzles involve `async` functions, so it helps to see them as promises. This function:

```js
async function load() {
  console.log('before')
  const value = await getValue()
  console.log('after', value)
}
```

behaves roughly like:

```js
function load() {
  return new Promise((resolve, reject) => {
    console.log('before')
    Promise.resolve(getValue()).then((value) => {
      console.log('after', value)
      resolve()
    }, reject)
  })
}
```

So:

- Everything **before** the first `await` runs synchronously, as part of the call.
- The rest of the function becomes a microtask that runs once the awaited promise settles.
- `await` on a value that is already resolved still pauses. The continuation goes to the back of the microtask queue, behind whatever was queued earlier.

## Scheduling APIs compared

| API | Queue | Typical use |
|---|---|---|
| `setTimeout(fn, 0)` | Task. The delay is a minimum, clamped to at least 4 ms after 5 nested levels and throttled in background tabs. | Yield to the browser, defer non-urgent work |
| `queueMicrotask(fn)` | Microtask | Run right after the current code, before rendering or other tasks |
| `Promise.resolve().then(fn)` | Microtask | Same timing as `queueMicrotask`, but a throw becomes a rejected promise |
| `requestAnimationFrame(fn)` | Just before the next paint | Visual updates, reading and writing layout once per frame |
| `requestIdleCallback(fn)` | When the browser is idle | Low-priority work like analytics |
| `scheduler.postTask(fn, { priority })` | Prioritised task | Fine-grained priority. Feature-detect before using. |
| `scheduler.yield()` | Continuation task with priority | Break up long tasks without losing your place. Feature-detect before using. |

One subtle difference: if a `queueMicrotask` callback throws, the error is reported like any uncaught exception. If a `.then` callback throws, you get a rejected promise instead, which you only see if something handles it or the browser reports an unhandled rejection.

## A method for any output puzzle

1. Run the **synchronous** code top to bottom and write down its logs. Remember that an `async` function runs synchronously up to its first `await`, and a `new Promise` executor runs immediately.
2. While doing that, keep two lists: the **microtask queue** and the **task queue**. Add each callback at the moment it is scheduled, not when it was written.
3. When the synchronous code ends, run microtasks from the front, one by one. Any new microtask goes to the **back** of the same queue and still runs before any task.
4. Only when the microtask queue is empty, take the first task, run it, then drain microtasks again.
5. Say out loud anything that is **not** deterministic (the classic case is `requestAnimationFrame` against `setTimeout`).

### Puzzle 1: the basics

```js
console.log('1')
setTimeout(() => console.log('2'), 0)
Promise.resolve().then(() => console.log('3'))
queueMicrotask(() => console.log('4'))
console.log('5')
```

Answer: `1 5 3 4 2`.

| step | runs | microtasks | tasks | output so far |
| --- | --- | --- | --- | --- |
| sync | logs 1, schedules timer, `then`, microtask, logs 5 | `3`, `4` | `2` | 1 5 |
| microtask | `3` | `4` | `2` | 1 5 3 |
| microtask | `4` | – | `2` | 1 5 3 4 |
| task | `2` | – | – | 1 5 3 4 2 |

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

Answer: `start a1 b end a2 p`. Calling `a()` logs `a1`, then calls `b()`, which logs `b` and returns an already-resolved promise. `await` queues the rest of `a` as a microtask right then. Only after `a()` returns does the next line queue `p`. So `a2` is ahead of `p` in the queue.

### Puzzle 3: microtasks inside a task

```js
setTimeout(() => {
  console.log('t1')
  Promise.resolve().then(() => console.log('m1'))
}, 0)
setTimeout(() => console.log('t2'), 0)
```

Answer: `t1 m1 t2`. Both timers are tasks. The first one queues a microtask, and the microtask queue drains completely before the second task starts.

### Puzzle 4: interleaved chains

```js
Promise.resolve()
  .then(() => console.log(1))
  .then(() => console.log(2))
Promise.resolve()
  .then(() => console.log(3))
  .then(() => console.log(4))
```

Answer: `1 3 2 4`. A `.then` callback is queued only when the promise before it settles. Initially only the `1` and `3` callbacks are queued. Running `1` settles its promise, which queues `2` at the back, behind `3`. The two chains alternate.

### Puzzle 5: returning a promise from `then`

```js
Promise.resolve()
  .then(() => {
    console.log('A')
    return Promise.resolve('x')
  })
  .then((v) => console.log('B', v))
Promise.resolve()
  .then(() => console.log(1))
  .then(() => console.log(2))
  .then(() => console.log(3))
  .then(() => console.log(4))
```

Answer: `A 1 2 3 B x 4`. When a `then` callback returns a promise (any thenable), the outer promise doesn't adopt its value directly. The engine queues one job that calls the returned promise's `then`, and that call queues a second job that settles the outer promise. Only then is `B` queued. Two extra hops let `2` and `3` from the other chain run first. Returning a plain value instead (`return 'x'`) would give `A 1 B x 2 3 4`.

### Puzzle 6: `requestAnimationFrame` against `setTimeout`

```js
setTimeout(() => console.log('timeout'), 0)
requestAnimationFrame(() => console.log('raf'))
Promise.resolve().then(() => console.log('micro'))
```

Answer: `micro` first, always. The order of `timeout` and `raf` is **not guaranteed**: it depends on whether the browser reaches a rendering opportunity before it picks the timer task. In practice `timeout` usually wins, but say explicitly that it can go either way. That is the point of the question.

## Keeping the page responsive

Because rendering only happens between tasks, a long computation must give the browser a chance to paint and to handle input. The standard approach is to split the work into chunks and **yield** between them:

```js
function yieldToMain() {
  if (globalThis.scheduler && typeof scheduler.yield === 'function') {
    return scheduler.yield()
  }
  return new Promise((resolve) => setTimeout(resolve, 0))
}

async function processAll(items, handle) {
  let lastYield = performance.now()
  for (let i = 0; i < items.length; i++) {
    handle(items[i])
    // Give the browser a turn roughly every 50 ms.
    if (performance.now() - lastYield > 50) {
      await yieldToMain()
      lastYield = performance.now()
    }
  }
}
```

- Yielding with a **task** (`setTimeout`, `scheduler.yield`) works, because the loop can render and handle input before your next chunk.
- Yielding with a **microtask** (`await Promise.resolve()`) does not help. The microtask queue drains before any render, so the page stays frozen.
- For work that is long no matter how you split it (parsing a big file, image processing), move it to a **Web Worker**, which has its own thread and talks to the page with messages.

For visual changes, use `requestAnimationFrame`. It runs right before paint, once per frame, and pauses in background tabs. Do your layout reads first and your writes after, so the browser lays out the page once per frame instead of after every write.

## Node.js differences

Node has the same idea with different queues:

- `process.nextTick` callbacks run before promise microtasks, after the current operation.
- The loop has named phases: timers, pending callbacks, poll (I/O), check (`setImmediate`), close callbacks. Microtasks drain between each callback.
- `setImmediate` runs in the check phase. From the main module, its order against `setTimeout(fn, 0)` is not deterministic. Inside an I/O callback, `setImmediate` always runs first, because the check phase comes right after poll.
- There is no rendering step and no `requestAnimationFrame`.

## Interview questions

**Is JavaScript single-threaded?**
Your code runs on one thread per page (more precisely, per agent). The browser itself is multi-threaded: networking, decoding and compositing happen elsewhere. Web Workers give you extra JavaScript threads that share nothing and communicate by messages.

**Why doesn't `setTimeout(fn, 0)` run immediately?**
It schedules a task. The task runs only after the current task finishes, all microtasks drain, and possibly a frame is painted. The delay is a minimum, never a guarantee, and it is clamped further for nested timers and background tabs.

**What is the difference between a microtask and a task?**
Microtasks run as soon as the call stack is empty, and the whole queue drains before anything else happens. Tasks run one per turn of the loop, with a chance to render in between.

**How would you keep the UI responsive during heavy work?**
Split it into chunks and yield between them with `scheduler.yield()` or `setTimeout`, or move it to a Web Worker. Yielding with microtasks doesn't help because rendering can't happen until they drain.

**When should DOM measurement and mutation go in `requestAnimationFrame`?**
When you're animating or batching visual changes. Reading and writing once per frame, right before paint, avoids repeated layouts and keeps animation in step with the display.

**When do `MutationObserver` callbacks run?**
As microtasks. They receive a batch of DOM changes after the current script, before the next paint.

**Can a promise callback run in the middle of a synchronous loop?**
No. Run-to-completion means callbacks only run when the stack is empty.

## Pitfalls

- Assuming `await` lets timers run. It only yields to the microtask queue.
- Recursively scheduling microtasks to "avoid blocking". It blocks rendering just the same.
- Using `setInterval` for animation instead of `requestAnimationFrame`.
- Forgetting that background tabs throttle timers heavily, often to once per second or less.
- Treating `setTimeout(fn, 0)` and `setImmediate` (Node) or `requestAnimationFrame` (browser) as if their order were fixed.

## Key takeaways

- One thread, run to completion. Asynchronous callbacks wait in queues until the stack is empty.
- After every task, **all** microtasks run. Then the browser may render. Then the next task.
- Promise callbacks, `await` continuations and `queueMicrotask` are microtasks. Timers, events and messages are tasks.
- For output puzzles: synchronous logs first, then the microtask queue in order, then tasks, draining microtasks after each one.
- Keep tasks short. Yield with a task or move work to a worker, never with a microtask.
