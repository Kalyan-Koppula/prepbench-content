**Key insight:** "has it run?" and "what did it return?" are two different facts. Track them with two variables in the closure, and flip the flag *before* calling `fn`.

## Approach

1. Keep `started = false` and `result` in the closure.
2. If `started`, return `result`.
3. Otherwise set `started = true`, call `fn.apply(this, args)` and store the result.
4. Wrap the call in `try/catch`: on error reset `started` and rethrow, so the next call retries.

## Walkthrough

`const init = once(() => { setup(); return 'ready' })`:

| Call | `started` before | Action | Returns |
| --- | --- | --- | --- |
| `init()` | false | run `fn`, remember result | `'ready'` |
| `init()` | true | skip | `'ready'` |
| `init()` | true | skip | `'ready'` |

If the first call **throws**, `started` is reset so a later call can try again, and the error propagates to the caller. Setting `started = true` **before** calling `fn` also protects against re-entrant calls (if `fn` calls `init` again, the inner call returns immediately instead of recursing).

## Complexity

`O(1)` per call.

## Edge cases to test

- `fn` runs once no matter how many calls follow.
- Later calls return the first result, even if it's `undefined`.
- Arguments and `this` from the first call are used.
- A throwing first call allows a retry.
- Re-entrant calls don't run `fn` twice.

## Pitfalls

- `if (result === undefined)` as the "already ran" check: functions returning `undefined` or `0` run every time.
- Setting the flag *after* `fn` returns: a re-entrant call recurses until the stack overflows.
- Calling `fn(...args)` instead of `fn.apply(this, args)` loses `this`.
- Keeping a reference to `fn` forever; production versions set `fn = null` after the run so its closure can be garbage collected.

## Follow-ups interviewers add

- **`before(n, fn)`:** allow the first `n - 1` calls, then keep returning the last result. `once` is `before(2, fn)`.
- **Async once:** cache the promise for a one-time async init, but clear it if the promise rejects so a retry is possible.
- **Throwing counts:** what changes if the spec says a failed first run still counts (lodash's behaviour)?
- **`once` for event listeners:** compare with `addEventListener(type, handler, { once: true })`.

## In the interview

Mention the two subtle decisions explicitly (what happens on error, and re-entrancy), then the follow-ups: an async `once` that caches the promise, and releasing `fn` after the call so its closure can be garbage collected.
