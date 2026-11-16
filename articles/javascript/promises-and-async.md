---
title: Promises and async/await
order: 5
summary: Promise states, chaining and error flow, the four combinators, async/await pitfalls, and implementing Promise.all.
---

Promises are the backbone of async JavaScript, and `async`/`await` is syntax over them. Expect to predict outputs of chains, choose the right combinator, fix a slow sequential loop, and write `Promise.all` from scratch.

## States

| State | Meaning |
|---|---|
| pending | Not settled yet |
| fulfilled | Settled with a value |
| rejected | Settled with a reason |

- A promise settles **once**; later `resolve`/`reject` calls are ignored.
- "Resolved" is not the same as "fulfilled": resolving with another promise locks in to follow it, so it may still reject.
- Handlers always run asynchronously as microtasks, even if the promise is already settled.

```js
const p = new Promise((resolve, reject) => {
  resolve(1)
  reject(new Error('ignored'))  // no effect
  resolve(2)                    // no effect
})

const { promise, resolve, reject } = Promise.withResolvers() // ES2024
```

The executor runs synchronously; if it throws, the promise rejects.

## Chaining

`then` always returns a **new** promise, settled by what the handler does:

| Handler does | Returned promise |
|---|---|
| Returns a value | Fulfils with that value |
| Returns a promise/thenable | Follows it |
| Throws | Rejects with the thrown error |
| Handler missing | Passes the value or reason through |

```js
fetchUser()
  .then((user) => fetchOrders(user.id)) // return the promise, don't nest
  .then((orders) => orders.length)
  .catch((err) => { report(err); return 0 }) // recovers: chain continues fulfilled
  .finally(() => hideSpinner())              // no args; passes value through
```

`finally` doesn't change the result unless it throws or returns a rejected promise.

## Error propagation

A rejection skips `then` fulfilment handlers until it reaches a `catch` (or a `then` with a second argument).

```js
Promise.reject(new Error('x'))
  .then(() => console.log('a'))
  .catch(() => { console.log('b'); return 1 })
  .then((v) => console.log('c', v))
  .finally(() => console.log('d'))
// b, c 1, d
```

`then(onOk, onErr)` differs from `then(onOk).catch(onErr)`: in the first form, errors thrown inside `onOk` are **not** caught by `onErr`.

Unhandled rejections fire `unhandledrejection` in browsers and crash Node by default. Always end a chain with `catch` or `await` it inside `try`.

## Combinators

| Method | Settles when | Result | Empty input |
|---|---|---|---|
| `Promise.all` | All fulfil, or first rejects | Array of values in input order | Fulfils `[]` |
| `Promise.allSettled` | All settle | `[{ status, value }` or `{ status, reason }]` | Fulfils `[]` |
| `Promise.race` | First settles (either way) | That value or reason | Stays pending forever |
| `Promise.any` | First fulfils, or all reject | Value, or `AggregateError` with `errors` | Rejects with `AggregateError` |

- `all`: dependent data where any failure invalidates the whole.
- `allSettled`: independent requests where partial success is fine (dashboards, batch uploads).
- `race`: timeouts — race the work against a rejecting timer.
- `any`: redundant sources, fastest mirror wins.

None of them cancel the losers; pair with `AbortController` if needed.

```js
const timeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))
const data = await Promise.race([fetch(url), timeout(5000)])
// Simpler for fetch: fetch(url, { signal: AbortSignal.timeout(5000) })
```

## async/await

- An `async` function always returns a promise. Returning a value fulfils it; throwing rejects it.
- `await` pauses the function and resumes it in a microtask once the operand settles. Code before the first `await` runs synchronously.
- Top-level `await` works in ES modules.

### Sequential vs parallel

```js
// Sequential: ~ time(a) + time(b)
const a = await getA()
const b = await getB()

// Parallel: ~ max(time(a), time(b))
const [a2, b2] = await Promise.all([getA(), getB()])
```

Only go sequential when the second call needs the first result.

### `forEach` doesn't await

```js
// Bug: forEach ignores returned promises; "done" logs before saves finish
items.forEach(async (item) => { await save(item) })
console.log('done')

// Sequential
for (const item of items) await save(item)

// Parallel
await Promise.all(items.map((item) => save(item)))
```

### Limited concurrency

```js
async function mapWithLimit(items, limit, fn) {
  const results = new Array(items.length)
  let next = 0
  async function worker() {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i], i)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}
```

### `return` vs `return await`

Inside `try`, `return await p` lets the local `catch` handle a rejection; `return p` hands the promise out and the `catch` never sees it. Outside `try`, they behave the same.

## Implementing Promise.all

```js
function promiseAll(iterable) {
  return new Promise((resolve, reject) => {
    const items = Array.from(iterable)
    const results = new Array(items.length)
    let remaining = items.length
    if (remaining === 0) return resolve(results)

    items.forEach((item, i) => {
      Promise.resolve(item).then((value) => {
        results[i] = value          // keep input order, not completion order
        if (--remaining === 0) resolve(results)
      }, reject)                    // first rejection wins; later ones are ignored
    })
  })
}
```

Points interviewers check: accepts any iterable and non-promise values (`Promise.resolve` wraps them), preserves order, resolves `[]` immediately for empty input, rejects on the first failure.

`allSettled` is the same skeleton but both handlers store `{ status, value | reason }` and decrement. `any` mirrors `all` with fulfil/reject swapped and rejects with `new AggregateError(errors)`.

## Common interview questions

**What's the difference between a promise and a callback?**
Promises are composable values: they chain, propagate errors to one handler, settle once, and always call handlers asynchronously, avoiding callback hell and "called twice" bugs.

**Is code after `resolve()` in the executor executed?**
Yes. `resolve` doesn't return or stop execution; it just settles the promise.

**How do you cancel a promise?**
You can't cancel the promise itself. Cancel the underlying work with an `AbortController` signal and have the promise reject with an `AbortError`.

**How do you retry with backoff?**
Loop up to N attempts; on failure `await` a delay of `base * 2 ** attempt` (plus jitter), then try again; rethrow after the last attempt.

**Why is `await` in a loop sometimes a code smell?**
It serialises independent work. Collect the promises and await `Promise.all`, unless order or rate limits require sequencing.

**What does `Promise.resolve(p)` return if `p` is already a native promise?**
The same promise object `p`.

## Pitfalls

- Forgetting to `return` inside `then`, so the next step gets `undefined` and runs early.
- Wrapping an existing promise in `new Promise` (the "explicit construction" anti-pattern).
- `async` callbacks passed to `forEach`, `filter` or `reduce` without handling the returned promises.
- Expecting `Promise.race` to stop the slower operations.
- Swallowing errors with an empty `catch`.
