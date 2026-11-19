**Key insight:** the whole pipeline is one recursive function, `dispatch(i)`, which calls middleware `i` with `next = () => dispatch(i + 1)`. Because `dispatch` always returns a promise, `await next()` naturally waits for everything downstream, which gives you the onion order for free.

## Approach

1. `use` pushes onto an array and returns `this`.
2. `run(ctx)` copies the array (so a `use` during a run doesn't affect it) and defines `dispatch(i)`:
   - if `i <= lastIndex`, `next` was called twice: return a rejected promise;
   - set `lastIndex = i`; if there's no middleware at `i`, return `Promise.resolve()`;
   - otherwise call it inside `try` and wrap the return value with `Promise.resolve(...)`, turning sync throws into rejections.
3. Return `dispatch(0).then(() => ctx)`.

## Walkthrough

```js
const app = new Pipeline()
app.use(async (ctx, next) => { ctx.log.push('a1'); await next(); ctx.log.push('a2') })
app.use(async (ctx, next) => { ctx.log.push('b1'); await next(); ctx.log.push('b2') })
app.use((ctx) => { ctx.log.push('handler') })
await app.run({ log: [] })
```

| Step | Running | Log |
| --- | --- | --- |
| 1 | a, before `next` | a1 |
| 2 | b, before `next` | a1, b1 |
| 3 | handler (no `next` call) | …, handler |
| 4 | b resumes after `await next()` | …, b2 |
| 5 | a resumes | …, a2 |

Final log: `a1 b1 handler b2 a2`, the "onion" model used by Koa and many server frameworks. Code before `next()` runs on the way in, code after it on the way out.

## Complexity

`O(m)` for `m` middleware per run.

## Edge cases to test

- Order of execution in and out.
- A middleware that doesn't call `next` stops the chain.
- Calling `next()` twice rejects.
- Errors (sync or async) propagate to `run` and can be caught by an earlier middleware wrapping `await next()` in `try`.
- Middleware added after `run` starts doesn't affect that run.

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

## In the interview

Draw the onion. Then show how error handling works (an outer `try { await next() } catch`), and compare with Express's callback style where `next(err)` passes errors.
