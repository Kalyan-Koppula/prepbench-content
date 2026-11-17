**Key insight:** the whole pipeline is one recursive function, `dispatch(i)`, which calls middleware `i` with `next = () => dispatch(i + 1)`. Because `dispatch` always returns a promise, `await next()` naturally waits for everything downstream, which gives you the onion order for free.

## Approach

1. `use` pushes onto an array and returns `this`.
2. `run(ctx)` copies the array (so a `use` during a run doesn't affect it) and defines `dispatch(i)`:
   - if `i <= lastIndex`, `next` was called twice: return a rejected promise;
   - set `lastIndex = i`; if there's no middleware at `i`, return `Promise.resolve()`;
   - otherwise call it inside `try` and wrap the return value with `Promise.resolve(...)`, turning sync throws into rejections.
3. Return `dispatch(0).then(() => ctx)`.

## Pitfalls

- Not wrapping a sync middleware's result in `Promise.resolve`: `await next()` works anyway, but `next().then(...)` crashes on `undefined`.
- A sync `throw` escaping `run` as an exception instead of a rejected promise.
- Looping over middleware with `for (const m of stack) await m(ctx, ...)` gives a sequence, not an onion: there's no "after" phase, and a middleware can't stop the chain.
- Keeping `index` on the instance instead of per run: a second `run` (or two concurrent ones) starts at the wrong place.

## Follow-ups interviewers add

- **Express-style error middleware:** `(err, ctx, next)` handlers that are skipped unless an error occurred.
- **Timeouts:** reject if a middleware doesn't call `next` or finish within N ms.
- **Redux middleware:** `store => next => action => ...` is the same idea in curried form; implement `applyMiddleware`.
- **Typed context:** let each middleware add fields to `ctx` and have TypeScript track them.
