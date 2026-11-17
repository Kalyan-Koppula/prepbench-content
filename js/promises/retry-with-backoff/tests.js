const start = clock.now()
function track(p) {
  const s = { settled: false }
  Promise.resolve(p).then(
    (value) => Object.assign(s, { settled: true, status: 'fulfilled', value, at: clock.now() - start }),
    (reason) => Object.assign(s, { settled: true, status: 'rejected', reason, at: clock.now() - start }),
  )
  return s
}
// A task that fails `failures` times, then returns `value`. Records when it was called.
function flaky(failures, value = 'ok') {
  const times = []
  const task = fn(async (attempt) => {
    times.push(clock.now() - start)
    if (attempt <= failures) throw new Error('fail ' + attempt)
    return value
  })
  task.times = times
  return task
}

test('resolves straight away when the first call succeeds', async () => {
  const task = flaky(0, 'first time')
  const s = track(retry(task))
  await clock.flush()
  expect(s.value).toBe('first time')
  expect(task).toHaveBeenCalledTimes(1)
  expect(clock.pending()).toBe(0)
})

test('waits 100ms then 200ms between attempts by default', async () => {
  const task = flaky(2)
  const s = track(retry(task))
  await clock.tickAsync(99)
  expect(task).toHaveBeenCalledTimes(1)
  await clock.tickAsync(500)
  expect(task.times).toEqual([0, 100, 300])
  expect(s.value).toBe('ok')
  expect(s.at).toBe(300)
})

test('passes the 1-based attempt number', async () => {
  const task = flaky(2)
  retry(task)
  await clock.runAllAsync()
  expect(task.mock.calls).toEqual([[1], [2], [3]])
})

test('rejects with the last error after all attempts fail', async () => {
  const task = flaky(10)
  const s = track(retry(task))
  await clock.runAllAsync()
  expect(task).toHaveBeenCalledTimes(3)
  expect(s.status).toBe('rejected')
  expect(s.reason.message).toBe('fail 3')
  expect(s.at).toBe(300)
})

test('honours attempts, delay, factor and maxDelay', async () => {
  const task = flaky(10)
  const s = track(retry(task, { attempts: 5, delay: 50, factor: 3, maxDelay: 400 }))
  await clock.runAllAsync()
  // waits: 50, 150, 400 (450 capped), 400 (1350 capped)
  expect(task.times).toEqual([0, 50, 200, 600, 1000])
  expect(s.reason.message).toBe('fail 5')
})

test('gives up immediately when shouldRetry returns false', async () => {
  const task = flaky(10)
  const shouldRetry = fn((error, attempt) => attempt < 2)
  const s = track(retry(task, { attempts: 5, shouldRetry }))
  await clock.runAllAsync()
  expect(task).toHaveBeenCalledTimes(2)
  expect(s.reason.message).toBe('fail 2')
  expect(shouldRetry.mock.calls.map(([e, n]) => [e.message, n])).toEqual([
    ['fail 1', 1],
    ['fail 2', 2],
  ])
})

test('does not ask shouldRetry after the final attempt', async () => {
  const shouldRetry = fn(() => true)
  retry(flaky(10), { attempts: 2, shouldRetry }).catch(() => {})
  await clock.runAllAsync()
  expect(shouldRetry).toHaveBeenCalledTimes(1)
})

test('treats a synchronous throw as a failed attempt', async () => {
  let calls = 0
  const s = track(
    retry(() => {
      calls += 1
      if (calls === 1) throw new Error('sync')
      return 'plain value'
    }),
  )
  await clock.runAllAsync()
  expect(calls).toBe(2)
  expect(s.value).toBe('plain value')
})

test('makes the first call synchronously', () => {
  const task = flaky(0)
  retry(task)
  expect(task).toHaveBeenCalledTimes(1)
})
