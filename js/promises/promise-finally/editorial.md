**Key insight:** `finally(cb)` is `then(onOk, onFail)` where both handlers run `cb`, wait for whatever it returns, and then *restore* the original outcome: return the value, or re-throw the reason. Chaining off `Promise.resolve(cb())` means a failing callback naturally overrides that outcome.

## Approach

1. If `onFinally` is not a function, return `Promise.resolve(promise)`.
2. Otherwise `Promise.resolve(promise).then(onOk, onFail)`, where
   - `onOk = value => Promise.resolve(onFinally()).then(() => value)`
   - `onFail = reason => Promise.resolve(onFinally()).then(() => { throw reason })`
3. If `onFinally()` throws, the handler throws and the result rejects with that error. If it returns a rejecting promise, the inner `.then` is skipped and its rejection propagates.

## Walkthrough

`promiseFinally(fetchUser(), () => hideSpinner())`:

| Original outcome | Callback outcome | Result |
| --- | --- | --- |
| fulfils with `user` | returns anything | fulfils with `user` (callback's value ignored) |
| fulfils with `user` | returns a promise | waits for it, then fulfils with `user` |
| rejects with `err` | returns normally | rejects with `err` |
| either | throws `e2` | rejects with `e2` (the callback's error replaces the result) |

The callback gets no arguments: `finally` is for cleanup, which shouldn't depend on success or failure.

## Complexity

`O(1)` beyond the wrapped promise; adds a couple of microtask hops.

## Edge cases to test

- Value passthrough on fulfilment and reason passthrough on rejection.
- Waiting for a promise returned by the callback.
- A throwing callback overrides the result.
- A missing or non-function callback just passes through.

## Pitfalls

- Passing the value to the callback (`cb(value)`); `finally` callbacks get no arguments by design, because they should not care how the promise ended.
- Returning the callback's result instead of the original value: `then(() => cb())` turns `finally` into a value-swallowing `then`.
- Using `.catch(cb).then(cb)` style chains: the callback runs twice on rejection, and the rejection is swallowed.
- Not waiting for an async cleanup, so the next `.then` runs before resources are released.

## Follow-ups interviewers add

- **Install it as a polyfill:** `Promise.prototype.finally = function (cb) { … this.constructor … }`, and why spec code uses the species constructor.
- **Output question:** what does `Promise.resolve(1).finally(() => 2).then(console.log)` log? (`1`.) And with `() => { throw 3 }`?
- **Use case:** hiding a spinner or releasing a lock no matter how a request ended.

## In the interview

Walk the four-row table above; it's the whole specification. Mention that native `finally` takes extra microtask ticks, which matters in output puzzles.
