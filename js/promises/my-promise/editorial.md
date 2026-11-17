**Key insight:** a promise is a small state machine (`pending` to `fulfilled` or `rejected`, once) plus a queue of callbacks. Everything else falls out of one rule: `then` returns a *new* promise that is resolved with whatever the callback returns, and "resolved with" means "adopt it if it is thenable".

## Approach

1. **State.** `state`, `result`, and `callbacks` (functions to run on settlement).
2. **Constructor.** Create `resolve`/`reject` guarded by a single `done` flag, run the executor in `try/catch`, and route a throw to `reject`.
3. **Adoption.** `resolve(x)`: if `x` is an object or function, read `x.then` once (inside `try`, a getter can throw). If it is a function, call it with fresh one-shot resolve/reject functions; otherwise fulfil with `x`.
4. **Settling.** Set state and result, then queue every waiting callback with `queueMicrotask`.
5. **`then`.** Return `new MyPromise((resolve, reject) => …)`. Build `run()` which picks the right handler, passes the result through when the handler is missing, and otherwise calls `resolve(handler(result))` inside `try/catch`. Push `run` if pending, else `queueMicrotask(run)`.
6. **`catch`** is `then(null, fn)`. **`finally`** is `then` with both handlers running the callback and restoring the original outcome. **Statics** wrap the constructor.

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
