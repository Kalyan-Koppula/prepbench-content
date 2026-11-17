// Lets a few microtask turns pass, so async middleware really interleaves.
const pause = async () => {
  for (let i = 0; i < 3; i++) await Promise.resolve()
}

test('runs middleware in onion order', async () => {
  const log = []
  const app = new Pipeline()
  app.use(async (ctx, next) => {
    log.push('a in')
    await next()
    log.push('a out')
  })
  app.use(async (ctx, next) => {
    log.push('b in')
    await next()
    log.push('b out')
  })
  app.use(() => {
    log.push('c')
  })
  await app.run({})
  expect(log).toEqual(['a in', 'b in', 'c', 'b out', 'a out'])
})

test('next() waits for async downstream middleware to finish', async () => {
  const log = []
  const app = new Pipeline()
    .use(async (ctx, next) => {
      await next()
      log.push(`outer sees ${ctx.user}`)
    })
    .use(async (ctx, next) => {
      await pause()
      ctx.user = 'ada'
      await next()
      await pause()
      log.push('inner done')
    })
  await app.run({})
  expect(log).toEqual(['inner done', 'outer sees ada'])
})

test('resolves with the shared context object', async () => {
  const ctx = { hits: 0 }
  const app = new Pipeline()
  app.use((c, next) => {
    c.hits++
    return next()
  })
  app.use((c) => {
    c.hits++
  })
  const result = await app.run(ctx)
  expect(result).toBe(ctx)
  expect(ctx.hits).toBe(2)
})

test('a middleware that skips next() ends the chain', async () => {
  const later = fn()
  const app = new Pipeline()
  app.use((ctx) => {
    ctx.status = 401
  })
  app.use(later)
  const ctx = await app.run({})
  expect(ctx.status).toBe(401)
  expect(later).not.toHaveBeenCalled()
})

test('resolves right away with no middleware', async () => {
  const ctx = {}
  await expect(new Pipeline().run(ctx)).resolves.toBe(ctx)
})

test('rejects when a middleware throws synchronously', async () => {
  const app = new Pipeline()
  app.use((ctx, next) => next())
  app.use(() => {
    throw new Error('sync failure')
  })
  await expect(app.run({})).rejects.toThrow('sync failure')
})

test('rejects when an async middleware rejects', async () => {
  const app = new Pipeline()
  app.use(async () => {
    await pause()
    throw new Error('async failure')
  })
  await expect(app.run({})).rejects.toThrow('async failure')
})

test('upstream middleware can catch downstream errors', async () => {
  const app = new Pipeline()
  app.use(async (ctx, next) => {
    try {
      await next()
    } catch (err) {
      ctx.error = err.message
    }
  })
  app.use(async () => {
    throw new Error('not found')
  })
  const ctx = await app.run({})
  expect(ctx.error).toBe('not found')
})

test('calling next() twice rejects', async () => {
  const downstream = fn()
  const app = new Pipeline()
  app.use(async (ctx, next) => {
    await next()
    await next()
  })
  app.use(downstream)
  await expect(app.run({})).rejects.toThrow('next() called multiple times')
  expect(downstream).toHaveBeenCalledTimes(1)
})

test('each run is independent', async () => {
  const app = new Pipeline()
  app.use((ctx, next) => {
    ctx.trail.push('first')
    return next()
  })
  app.use((ctx) => {
    ctx.trail.push('second')
  })
  const one = await app.run({ trail: [] })
  const two = await app.run({ trail: [] })
  expect(one.trail).toEqual(['first', 'second'])
  expect(two.trail).toEqual(['first', 'second'])
})
