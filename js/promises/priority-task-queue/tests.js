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
// Task that logs its name and start time, then finishes after `ms`.
function makeLog() {
  const log = []
  const task = (name, ms = 10) => () => {
    log.push([name, clock.now() - start])
    return new Promise((resolve) => setTimeout(resolve, ms, name))
  }
  return { log, task }
}

test('starts a task immediately when idle', () => {
  const queue = new TaskQueue()
  const task = fn(() => new Promise(() => {}))
  queue.add(task)
  expect(task).toHaveBeenCalledTimes(1)
})

test('runs one task at a time', async () => {
  const { log, task } = makeLog()
  const queue = new TaskQueue()
  queue.add(task('a', 100))
  queue.add(task('b', 50))
  await clock.tickAsync(99)
  expect(log).toEqual([['a', 0]])
  await clock.tickAsync(1)
  expect(log).toEqual([['a', 0], ['b', 100]])
})

test('picks the highest priority waiting task next', async () => {
  const { log, task } = makeLog()
  const queue = new TaskQueue()
  queue.add(task('first'))
  queue.add(task('low'), 1)
  queue.add(task('high'), 5)
  queue.add(task('mid'), 3)
  await clock.runAllAsync()
  expect(log.map(([name]) => name)).toEqual(['first', 'high', 'mid', 'low'])
})

test('keeps insertion order within the same priority', async () => {
  const { log, task } = makeLog()
  const queue = new TaskQueue()
  queue.add(task('running'))
  queue.add(task('a'), 2)
  queue.add(task('b'), 2)
  queue.add(task('c'))
  queue.add(task('d'), 2)
  await clock.runAllAsync()
  expect(log.map(([name]) => name)).toEqual(['running', 'a', 'b', 'd', 'c'])
})

test('does not interrupt the running task', async () => {
  const { log, task } = makeLog()
  const queue = new TaskQueue()
  queue.add(task('slow', 100), -5)
  await clock.tickAsync(40)
  queue.add(task('urgent'), 100)
  await clock.tickAsync(60)
  expect(log).toEqual([['slow', 0], ['urgent', 100]])
})

test('settles each add() with its own task result', async () => {
  const queue = new TaskQueue()
  const a = track(queue.add(() => 'plain'))
  const b = track(queue.add(() => new Promise((r) => setTimeout(r, 20, 'later'))))
  await clock.tickAsync(20)
  expect([a.value, b.value]).toEqual(['plain', 'later'])
})

test('a failing task rejects its promise and the queue moves on', async () => {
  const queue = new TaskQueue()
  const err = new Error('upload failed')
  const failed = track(queue.add(() => new Promise((_, reject) => setTimeout(reject, 10, err))))
  const next = track(queue.add(() => 'still runs'))
  await clock.tickAsync(10)
  expect(failed.reason).toBe(err)
  expect(next.value).toBe('still runs')
})

test('a synchronous throw rejects too', async () => {
  const queue = new TaskQueue()
  const err = new Error('sync')
  const failed = track(
    queue.add(() => {
      throw err
    }),
  )
  const next = track(queue.add(() => 'ok'))
  await clock.flush()
  expect(failed.reason).toBe(err)
  expect(next.value).toBe('ok')
})

test('size counts only waiting tasks', async () => {
  const queue = new TaskQueue()
  const { task } = makeLog()
  expect(queue.size).toBe(0)
  queue.add(task('a'))
  expect(queue.size).toBe(0)
  queue.add(task('b'))
  queue.add(task('c'))
  expect(queue.size).toBe(2)
  await clock.tickAsync(10)
  expect(queue.size).toBe(1)
  await clock.runAllAsync()
  expect(queue.size).toBe(0)
})

test('default priority 0 beats negative priorities', async () => {
  const { log, task } = makeLog()
  const queue = new TaskQueue()
  queue.add(task('running'))
  queue.add(task('background'), -1)
  queue.add(task('normal'))
  await clock.runAllAsync()
  expect(log.map(([name]) => name)).toEqual(['running', 'normal', 'background'])
})
