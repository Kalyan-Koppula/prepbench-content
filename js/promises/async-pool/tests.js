const setTimeout = window.setTimeout // timers on the fake clock
const start = clock.now()
function track(p) {
  const s = { settled: false }
  Promise.resolve(p).then(
    (value) => Object.assign(s, { settled: true, status: 'fulfilled', value, at: clock.now() - start }),
    (reason) => Object.assign(s, { settled: true, status: 'rejected', reason, at: clock.now() - start }),
  )
  return s
}
// Builds tasks that take `ms[i]` ms and record start times and concurrency.
function makeTasks(durations, { failAt = -1 } = {}) {
  const log = { started: [], running: 0, maxRunning: 0 }
  const tasks = durations.map((ms, i) =>
    fn(() => {
      log.started.push([i, clock.now() - start])
      log.running += 1
      log.maxRunning = Math.max(log.maxRunning, log.running)
      return new Promise((resolve, reject) =>
        setTimeout(() => {
          log.running -= 1
          if (i === failAt) reject(new Error('task ' + i + ' failed'))
          else resolve('r' + i)
        }, ms),
      )
    }),
  )
  return { tasks, log }
}

test('fulfils with results in task order, not finishing order', async () => {
  const { tasks } = makeTasks([30, 10, 20])
  const s = track(asyncPool(tasks, 3))
  await clock.tickAsync(30)
  expect(s.value).toEqual(['r0', 'r1', 'r2'])
})

test('starts only `limit` tasks right away', () => {
  const { tasks } = makeTasks([10, 10, 10, 10])
  asyncPool(tasks, 2)
  expect(tasks.map((t) => t.mock.calls.length)).toEqual([1, 1, 0, 0])
})

test('starts the next task as soon as a slot frees up', async () => {
  const { tasks, log } = makeTasks([100, 50, 30, 40])
  const s = track(asyncPool(tasks, 2))
  await clock.tickAsync(200)
  expect(log.started).toEqual([[0, 0], [1, 0], [2, 50], [3, 80]])
  expect(s.at).toBe(120)
})

test('never runs more than `limit` tasks at once', async () => {
  const { tasks, log } = makeTasks([40, 10, 70, 20, 20, 50, 10, 30])
  const s = track(asyncPool(tasks, 3))
  await clock.runAllAsync()
  expect(log.maxRunning).toBe(3)
  expect(s.value).toHaveLength(8)
})

test('calls every task exactly once', async () => {
  const { tasks } = makeTasks([5, 5, 5, 5, 5])
  asyncPool(tasks, 2)
  await clock.runAllAsync()
  expect(tasks.map((t) => t.mock.calls.length)).toEqual([1, 1, 1, 1, 1])
})

test('rejects on the first failure and starts nothing new', async () => {
  const { tasks, log } = makeTasks([50, 20, 10, 10, 10], { failAt: 1 })
  const s = track(asyncPool(tasks, 2))
  await clock.runAllAsync()
  expect(s.status).toBe('rejected')
  expect(s.reason.message).toBe('task 1 failed')
  expect(s.at).toBe(20)
  expect(log.started.map(([i]) => i)).toEqual([0, 1])
})

test('fulfils with an empty array for no tasks', async () => {
  const s = track(asyncPool([], 3))
  await clock.flush()
  expect(s.value).toEqual([])
})

test('a limit above the task count runs everything at once', async () => {
  const { tasks, log } = makeTasks([10, 20])
  const s = track(asyncPool(tasks, 10))
  await clock.tickAsync(20)
  expect(log.started).toEqual([[0, 0], [1, 0]])
  expect(s.value).toEqual(['r0', 'r1'])
})

test('handles tasks that return plain values or throw', async () => {
  const ok = track(asyncPool([() => 1, () => 2], 1))
  const err = new Error('sync')
  const bad = track(
    asyncPool([
      () => {
        throw err
      },
    ], 1),
  )
  await clock.flush()
  expect(ok.value).toEqual([1, 2])
  expect(bad.reason).toBe(err)
})
