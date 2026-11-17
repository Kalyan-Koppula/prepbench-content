const setTimeout = window.setTimeout // timers on the fake clock
const start = clock.now()
function track(p) {
  const s = { settled: false }
  Promise.resolve(p).then(
    (value) => Object.assign(s, { settled: true, status: 'fulfilled', value }),
    (reason) => Object.assign(s, { settled: true, status: 'rejected', reason }),
  )
  return s
}
// Tasks that log [name, startTime] and take `ms` to finish.
function makeLog() {
  const log = []
  const task = (name, ms = 1) => () => {
    log.push([name, clock.now() - start])
    return new Promise((resolve) => setTimeout(resolve, ms, name))
  }
  return { log, task }
}

test('starts up to `limit` tasks immediately', () => {
  const { log, task } = makeLog()
  const schedule = createRateLimiter(2, 100)
  schedule(task('a'))
  schedule(task('b'))
  schedule(task('c'))
  expect(log).toEqual([['a', 0], ['b', 0]])
})

test('starts the next task when the oldest start leaves the window', async () => {
  const { log, task } = makeLog()
  const schedule = createRateLimiter(2, 100)
  for (const name of ['a', 'b', 'c', 'd', 'e']) schedule(task(name))
  await clock.tickAsync(99)
  expect(log).toHaveLength(2)
  await clock.tickAsync(1)
  expect(log.slice(2)).toEqual([['c', 100], ['d', 100]])
  await clock.tickAsync(100)
  expect(log[4]).toEqual(['e', 200])
})

test('uses a sliding window, not fixed buckets', async () => {
  const { log, task } = makeLog()
  const schedule = createRateLimiter(2, 100)
  schedule(task('a'))
  await clock.tickAsync(60)
  schedule(task('b'))
  schedule(task('c'))
  schedule(task('d'))
  await clock.tickAsync(200)
  expect(log).toEqual([['a', 0], ['b', 60], ['c', 100], ['d', 160]])
})

test('limits starts, not running tasks', async () => {
  const { log, task } = makeLog()
  const schedule = createRateLimiter(1, 50)
  schedule(task('long-1', 1000))
  schedule(task('long-2', 1000))
  await clock.tickAsync(50)
  expect(log).toEqual([['long-1', 0], ['long-2', 50]])
})

test('starts tasks in the order they were scheduled', async () => {
  const { log, task } = makeLog()
  const schedule = createRateLimiter(1, 10)
  const names = ['q', 'w', 'e', 'r', 't', 'y']
  names.forEach((n) => schedule(task(n)))
  await clock.runAllAsync()
  expect(log.map(([n]) => n)).toEqual(names)
  expect(log.map(([, t]) => t)).toEqual([0, 10, 20, 30, 40, 50])
})

test('settles with each task outcome, and failures still use a slot', async () => {
  const { log, task } = makeLog()
  const schedule = createRateLimiter(1, 100)
  const err = new Error('429')
  const failed = track(
    schedule(() => {
      throw err
    }),
  )
  const ok = track(schedule(task('next')))
  await clock.tickAsync(99)
  expect(failed.reason).toBe(err)
  expect(ok.settled).toBe(false)
  await clock.tickAsync(2)
  expect(ok.value).toBe('next')
  expect(log).toEqual([['next', 100]])
})

test('a task scheduled after a quiet period starts at once', async () => {
  const { log, task } = makeLog()
  const schedule = createRateLimiter(2, 100)
  schedule(task('a'))
  schedule(task('b'))
  await clock.tickAsync(500)
  schedule(task('c'))
  expect(log).toEqual([['a', 0], ['b', 0], ['c', 500]])
})

test('leaves no timers behind once the queue is empty', async () => {
  const schedule = createRateLimiter(2, 100)
  const done = []
  for (let i = 0; i < 5; i++) schedule(() => i).then((v) => done.push(v))
  expect(clock.pending()).toBeGreaterThan(0)
  await clock.tickAsync(200)
  expect(done).toEqual([0, 1, 2, 3, 4])
  expect(clock.pending()).toBe(0)
})

test('separate limiters do not share a budget', () => {
  const { log, task } = makeLog()
  const one = createRateLimiter(1, 100)
  const two = createRateLimiter(1, 100)
  one(task('one'))
  two(task('two'))
  expect(log).toEqual([['one', 0], ['two', 0]])
})
