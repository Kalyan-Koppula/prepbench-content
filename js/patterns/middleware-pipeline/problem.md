---
title: Middleware Pipeline
difficulty: Medium
order: 6
tags: [promises, async, closures, koa]
frequency: medium
exports: [Pipeline]
hints:
  - "Write `dispatch(i)`, which runs middleware `i` and hands it `() => dispatch(i + 1)` as `next`."
  - Always return a promise from `dispatch`, including when middleware `i` doesn't exist or throws synchronously.
  - To catch a second `next()` call, remember the highest index dispatched so far in this run.
---

Implement a Koa-style middleware `Pipeline`. Each middleware receives a shared context object and a `next` function; code before `await next()` runs on the way in, code after it runs on the way out (the "onion" model).

```js
const app = new Pipeline()
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  ctx.log.push(`took ${Date.now() - start}ms`)
})
app.use(async (ctx, next) => {
  ctx.user = await loadUser(ctx.token)
  await next()
})
app.use((ctx) => {
  ctx.body = `hello ${ctx.user.name}`
})

await app.run({ token: 'abc', log: [] })
```

## Notes

- `use(middleware)` adds a middleware and returns the pipeline, so calls can be chained.
- `run(ctx)` returns a promise that resolves **with `ctx`** once the whole chain has finished, outer middleware included.
- Middleware is `(ctx, next) => void | Promise<void>` and may be sync or async.
- `next()` returns a promise that resolves after all downstream middleware has finished. Calling `next()` in the last middleware resolves immediately.
- A middleware that doesn't call `next()` ends the chain there; the middleware after it never runs.
- Errors, whether thrown synchronously or as rejections, reject the `run` promise, unless an upstream middleware catches them with `try { await next() } catch {}`.
- Calling `next()` more than once from the same middleware is a bug: that call must return a promise rejected with an `Error` whose message is `next() called multiple times`.
- Every `run` is independent; the pipeline can be run many times.
