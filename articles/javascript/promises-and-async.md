---
title: Promises and async/await
order: 5
summary: Promise states, chaining and error flow, the four combinators, async/await pitfalls, and implementing Promise.all.
---

Promises are the backbone of asynchronous JavaScript, and `async`/`await` is syntax built on top of them. In interviews you will be asked to predict the output of chains, pick the right combinator, fix a slow sequential loop, handle errors properly, and write `Promise.all` from scratch. All of that follows from a small model of what a promise is.

## Why promises exist

Before promises, asynchronous APIs took callbacks:

```js
getUser(id, function (err, user) {
  if (err) return handle(err)
  getOrders(user.id, function (err, orders) {
    if (err) return handle(err)
    getInvoice(orders[0].id, function (err, invoice) {
      if (err) return handle(err)
      render(invoice)
    })
  })
})
```

Three problems hide in that code:

1. **Nesting.** Each dependent step goes one level deeper ("callback hell").
2. **Error handling is manual.** Every level checks `err`; forget one and the error disappears.
3. **Inversion of control.** You hand your continuation to someone else's code. It might call it twice, never, or synchronously, and you can't stop it.

A promise fixes all three by turning "the eventual result" into a **value** you hold. It settles exactly once, always notifies asynchronously, chains without nesting, and routes errors to the nearest handler:

```js
getUser(id)
  .then((user) => getOrders(user.id))
  .then((orders) => getInvoice(orders[0].id))
  .then(render)
  .catch(handle)
```

## The model: a state machine with a list of reactions

A promise is an object with:

- a **state**: `pending`, then either `fulfilled` (with a value) or `rejected` (with a reason);
- a list of **reactions**: handlers registered with `then`, `catch` or `finally`.

| State | Meaning |
| --- | --- |
| pending | Not settled yet |
| fulfilled | Settled with a value |
| rejected | Settled with a reason (usually an `Error`) |

Rules:

- A promise settles **once**. Later calls to `resolve` or `reject` are ignored.
- When it settles, each registered reaction is queued as a **microtask**. Reactions added after settling are queued immediately. Either way, handlers never run synchronously (see [The Event Loop](/read/event-loop)).
- "Resolved" isn't the same as "fulfilled". Resolving with another promise (or any object with a `then` method, a "thenable") makes this promise **follow** that one, so it may still end up rejected.

```js
const p = new Promise((resolve, reject) => {
  resolve(1)
  reject(new Error('ignored')) // no effect: already settled
  resolve(2) // no effect
  console.log('still runs') // resolve doesn't stop the executor
})
```

The executor function runs **synchronously** inside the constructor. If it throws, the promise rejects with that error.

`Promise.withResolvers()` (ES2024) returns `{ promise, resolve, reject }`, handy when the code that settles the promise is somewhere else:

```js
const { promise, resolve, reject } = Promise.withResolvers()
socket.once('ready', resolve)
socket.once('error', reject)
await promise
```

## Chaining

`then` always returns a **new** promise. What happens to that new promise depends on the handler:

| The handler… | The returned promise… |
| --- | --- |
| returns a value | fulfils with that value |
| returns a promise or thenable | follows it |
| throws | rejects with the thrown error |
| is missing for this outcome | passes the value or reason straight through |

```js
fetchUser()
  .then((user) => fetchOrders(user.id)) // return the promise: don't nest a .then inside
  .then((orders) => orders.length)
  .catch((err) => {
    report(err)
    return 0 // recovers: the chain continues fulfilled with 0
  })
  .finally(() => hideSpinner()) // gets no arguments; passes the result through
```

`finally` doesn't change the result, unless it throws or returns a rejected promise, in which case that rejection replaces the result.

### Error propagation

A rejection skips fulfilment handlers until it reaches a rejection handler (`catch`, or the second argument of `then`).

```js
Promise.reject(new Error('x'))
  .then(() => console.log('a'))
  .catch(() => {
    console.log('b')
    return 1
  })
  .then((v) => console.log('c', v))
  .finally(() => console.log('d'))
// b, c 1, d
```

`then(onOk, onErr)` is not the same as `then(onOk).catch(onErr)`. In the first form, an error thrown **inside** `onOk` is not caught by `onErr`, because both handlers belong to the same step. In the second form, `catch` is a later step, so it sees errors from `onOk` too.

**Unhandled rejections** fire the `unhandledrejection` event in browsers and terminate the process by default in Node. Every chain should end with a `catch`, or be `await`ed inside a `try`.

## Predicting output: a worked trace

```js
console.log('1')
setTimeout(() => console.log('2'), 0)
Promise.resolve()
  .then(() => console.log('3'))
  .then(() => console.log('4'))
queueMicrotask(() => console.log('5'))
console.log('6')
```

| Step | Runs | Output | Queues after |
| --- | --- | --- | --- |
| Script | `log('1')` | 1 | – |
| Script | `setTimeout` | – | task: log 2 |
| Script | first `.then` registered on a fulfilled promise | – | micro: log 3 |
| Script | `queueMicrotask` | – | micro: log 3, log 5 |
| Script | `log('6')` | 6 | – |
| Microtasks | log 3; its promise fulfils, queuing the next `.then` | 3 | micro: log 5, log 4 |
| Microtasks | log 5 | 5 | micro: log 4 |
| Microtasks | log 4 | 4 | – |
| Next task | log 2 | 2 | – |

Output: `1 6 3 5 4 2`. The second `.then` isn't queued until the first one finishes, which is why `5` gets in between.

## The combinators

| Method | Settles when | Result | Empty input |
| --- | --- | --- | --- |
| `Promise.all` | All fulfil, or the first rejects | Array of values in **input** order | Fulfils with `[]` |
| `Promise.allSettled` | All settle | Array of `{ status, value }` or `{ status, reason }` | Fulfils with `[]` |
| `Promise.race` | The first settles, either way | That value or reason | Stays pending forever |
| `Promise.any` | The first fulfils, or all reject | That value, or an `AggregateError` | Rejects with `AggregateError` |

When to use which:

- **`all`**: dependent data where any failure makes the whole result useless (load a page's three required resources).
- **`allSettled`**: independent work where partial success is fine (a dashboard of widgets, a batch upload report).
- **`race`**: timeouts, by racing the work against a timer that rejects.
- **`any`**: redundant sources where the fastest success wins (mirrors, caches).

None of them cancel the losing operations. If the losers should stop, pass an `AbortSignal` into them.

```js
function timeout(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('timeout')), ms)
  })
}
const data = await Promise.race([fetchData(), timeout(5000)])

// For fetch specifically, this also cancels the request:
const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
```

## async and await

An `async` function always returns a promise. Returning a value fulfils it; throwing rejects it. Inside, `await x` pauses the function until `x` settles, then resumes it in a microtask with the value (or throws the reason at that point).

A useful way to read `async` code is as a `then` chain written top to bottom:

```js
async function loadInvoice(id) {
  const user = await getUser(id)
  const orders = await getOrders(user.id)
  return getInvoice(orders[0].id)
}

// behaves like
function loadInvoiceChained(id) {
  return getUser(id)
    .then((user) => getOrders(user.id))
    .then((orders) => getInvoice(orders[0].id))
}
```

Details that matter in puzzles:

- Code before the first `await` runs **synchronously**, as part of the call.
- `await` on a non-promise still yields: the rest of the function runs in a later microtask.
- Errors are caught with ordinary `try`/`catch`, which also covers synchronous throws in the same block.
- Top-level `await` works in ES modules (it delays the module's evaluation and that of modules importing it).

### Sequential versus parallel

```js
// Sequential: total ≈ time(a) + time(b)
const a = await getA()
const b = await getB()

// Parallel: total ≈ max(time(a), time(b))
const [a2, b2] = await Promise.all([getA(), getB()])
```

Await one after the other only when the second call needs the first result. Starting both first and awaiting later also runs them in parallel, but if `getB` rejects while you're still awaiting `getA`, that rejection is briefly unhandled; `Promise.all` avoids that.

### `forEach` doesn't wait

```js
// Bug: forEach ignores the promises returned by the async callback
items.forEach(async (item) => {
  await save(item)
})
console.log('done') // logs before any save finishes

// Sequential
for (const item of items) {
  await save(item)
}

// Parallel
await Promise.all(items.map((item) => save(item)))
```

The same applies to `filter`, `some` and `reduce` with async callbacks: they receive promises, which are always truthy objects.

### Limited concurrency

Hitting an API with 1,000 requests at once can trip rate limits. A small worker pool keeps at most `limit` in flight:

```js
async function mapWithLimit(items, limit, fn) {
  const results = new Array(items.length)
  let next = 0

  async function worker() {
    while (next < items.length) {
      const i = next
      next += 1
      results[i] = await fn(items[i], i)
    }
  }

  const workers = []
  for (let w = 0; w < Math.min(limit, items.length); w++) {
    workers.push(worker())
  }
  await Promise.all(workers)
  return results
}
```

This is safe without locks because JavaScript runs one piece of code at a time: reading and incrementing `next` can't be interleaved with another worker.

### `return` versus `return await`

Inside a `try` block, `return await p` waits for `p` there, so a rejection is caught by the local `catch`. `return p` hands the promise to the caller and the local `catch` never sees the rejection. Outside `try`, the two behave the same.

```js
async function safe() {
  try {
    return await mightFail() // a rejection is handled below
  } catch {
    return 'fallback'
  }
}
```

## Retry with backoff

```js
async function withRetry(operation, attempts = 3, baseMs = 200) {
  let lastError
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await operation()
    } catch (err) {
      lastError = err
      if (attempt < attempts - 1) {
        const delay = baseMs * 2 ** attempt + Math.random() * baseMs // exponential plus jitter
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }
  throw lastError
}
```

Only retry errors that are worth retrying (network failures, 429 and 503 responses), not validation errors.

## Cancellation

A promise can't be cancelled; it only represents a result. What you cancel is the **work** that produces it, with an `AbortController`:

```js
const controller = new AbortController()
const pending = fetch('/api/search?q=re', { signal: controller.signal })

controller.abort() // the fetch stops; `pending` rejects with an AbortError

try {
  await pending
} catch (err) {
  if (err.name !== 'AbortError') {
    throw err
  }
}
```

Your own async functions can accept a `signal`, check `signal.aborted` between steps, and listen for its `abort` event.

## Implementing the combinators

### Promise.all

```js
function promiseAll(iterable) {
  return new Promise((resolve, reject) => {
    const items = [...iterable]
    const results = new Array(items.length)
    let remaining = items.length
    if (remaining === 0) {
      resolve(results)
      return
    }
    items.forEach((item, i) => {
      Promise.resolve(item).then((value) => {
        results[i] = value // input order, not completion order
        remaining -= 1
        if (remaining === 0) {
          resolve(results)
        }
      }, reject) // the first rejection wins; later calls are ignored
    })
  })
}
```

What interviewers check: it accepts any iterable and plain values (`Promise.resolve` wraps them), preserves input order, resolves immediately with `[]` for empty input, and rejects on the first failure.

### allSettled, race and any

```js
function promiseAllSettled(iterable) {
  return promiseAll(
    [...iterable].map((item) =>
      Promise.resolve(item).then(
        (value) => ({ status: 'fulfilled', value }),
        (reason) => ({ status: 'rejected', reason }),
      ),
    ),
  )
}

function promiseRace(iterable) {
  return new Promise((resolve, reject) => {
    for (const item of iterable) {
      Promise.resolve(item).then(resolve, reject) // the first to settle wins
    }
  })
}
```

`any` mirrors `all` with the roles swapped: collect rejection reasons in order, resolve on the first fulfilment, and reject with `new AggregateError(errors)` when every input has rejected (or immediately for empty input).

## Interview questions

**What's the difference between a promise and a callback?**
A promise is a value representing a future result. It settles once, always calls handlers asynchronously, chains without nesting and routes errors to one handler, avoiding callback hell and "called twice" bugs.

**Does code after `resolve()` in the executor run?**
Yes. `resolve` settles the promise but doesn't return or stop the executor.

**How do you cancel a promise?**
You cancel the underlying work with an `AbortController`; the promise then rejects with an `AbortError`.

**Why is `await` in a loop sometimes a smell?**
It serialises independent work. Collect the promises and `await Promise.all`, unless order or rate limits require sequencing.

**What does `Promise.resolve(p)` return if `p` is a native promise?**
`p` itself.

**What's the difference between `Promise.all` and `Promise.allSettled`?**
`all` rejects as soon as one input rejects; `allSettled` always waits for everything and reports each outcome.

**What happens to an unhandled rejection?**
Browsers fire `unhandledrejection` and log it; Node terminates the process by default.

## Pitfalls

- Forgetting to `return` inside `then`, so the next step receives `undefined` and runs early.
- Wrapping an existing promise in `new Promise` (the "explicit construction" anti-pattern): just return the promise.
- `async` callbacks passed to `forEach`, `filter` or `reduce`.
- Expecting `Promise.race` to stop the slower operations.
- An empty `catch` that silently swallows errors.
- Starting several promises and awaiting them one by one, leaving later rejections briefly unhandled.

## Key takeaways

- A promise is a once-settling state machine whose handlers always run as microtasks.
- `then` returns a new promise shaped by what its handler returns or throws.
- Errors skip ahead to the next rejection handler.
- Pick the combinator by failure semantics: `all`, `allSettled`, `race`, `any`.
- `async`/`await` is a linear way to write a `then` chain; parallelise independent awaits.
- Cancel work with `AbortController`, not the promise.
