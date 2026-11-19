**Key insight:** a promise is a small state machine (`pending` to `fulfilled` or `rejected`, once) plus a queue of callbacks. Everything else falls out of one rule: `then` returns a *new* promise that is resolved with whatever the callback returns, and "resolved with" means "adopt it if it is thenable".

## Approach

1. **State.** `state`, `result`, and `callbacks` (functions to run on settlement).
2. **Constructor.** Create `resolve`/`reject` guarded by a single `done` flag, run the executor in `try/catch`, and route a throw to `reject`.
3. **Adoption.** `resolve(x)`: if `x` is an object or function, read `x.then` once (inside `try`, a getter can throw). If it is a function, call it with fresh one-shot resolve/reject functions; otherwise fulfil with `x`.
4. **Settling.** Set state and result, then queue every waiting callback with `queueMicrotask`.
5. **`then`.** Return `new MyPromise((resolve, reject) => …)`. Build `run()` which picks the right handler, passes the result through when the handler is missing, and otherwise calls `resolve(handler(result))` inside `try/catch`. Push `run` if pending, else `queueMicrotask(run)`.
6. **`catch`** is `then(null, fn)`. **`finally`** is `then` with both handlers running the callback and restoring the original outcome. **Statics** wrap the constructor.

## Walkthrough

How `new MyPromise((resolve) => resolve(1)).then((v) => v + 1).then(console.log)` runs:

| Step | Action |
| --- | --- |
| 1 | The executor runs synchronously and calls `resolve(1)`; `1` isn't thenable, so the state becomes fulfilled with 1 |
| 2 | The first `then` creates promise P2 and schedules its callback as a microtask (already fulfilled) |
| 3 | The second `then` registers a callback on P2, which is still pending |
| 4 | Microtask: `v + 1` = 2; P2 is resolved with 2, which queues P2's callbacks |
| 5 | Microtask: logs 2 |

The pieces interviewers check: callbacks always run asynchronously (`queueMicrotask`), `then` returns a new promise resolved with the handler's return value, thrown errors reject it, missing handlers pass values through, and resolving with a thenable **adopts** its state (calling its `then` exactly once).

## Complexity

`O(1)` per `then` registration; callbacks run once each.

## Edge cases to test

- Handlers run asynchronously, even on already-settled promises.
- Chaining values and errors; missing handlers pass through.
- Resolving with another promise or a custom thenable.
- `resolve` and `reject` after settling are ignored.
- An executor that throws rejects the promise.
- A thenable that calls both of its callbacks only counts the first.

## Pitfalls

- Running callbacks synchronously when the promise is already settled. Then `p.then(log); log('sync')` prints in the wrong order, which is the bug interviewers test first.
- Using `setTimeout` instead of a microtask: callbacks then run after timers that were queued earlier.
- Storing a thenable as a value instead of following it, so `then(() => fetchX())` hands the next callback a promise object.
- Separate `fulfilled`/`rejected` guards in the constructor: `resolve(thenable)` followed by `reject()` must still be ignored, because the promise is already *resolved* (locked in) even though it is not *settled* yet.
- Reading `x.then` twice; a getter can return different things each time.

## Follow-ups interviewers add

- **Promises/A+ compliance:** self-resolution (`p.then(() => p2)` where `p2` is the returned promise) must reject with a `TypeError`.
- **Statics on top:** `MyPromise.all`, `race`, `allSettled`, `any`.
- **Unhandled rejections:** how would you warn when a rejected promise has no handlers by the end of the turn?
- **Output prediction:** native promises take extra microtask ticks when a `then` callback returns a promise. Explain why `return Promise.resolve(x)` delays the chain by two ticks.

## In the interview

Build it in stages: states and settle-once, then `then` with a callback list, then asynchronous execution, then thenable adoption. Explaining why each stage exists matters more than reaching full Promises/A+ compliance.
