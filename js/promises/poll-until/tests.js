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
// fn whose n-th call (1-based) returns { n, ready: n >= readyAt }, optionally after `takes` ms.
function job(readyAt, takes = 0) {
  const times = []
  const check = fn(() => {
    times.push(clock.now() - start)
    const result = { n: times.length, ready: times.length >= readyAt }
    return takes ? new Promise((resolve) => setTimeout(resolve, takes, result)) : Promise.resolve(result)
  })
  check.times = times
  return check
}
const isReady = (r) => r.ready

test('fulfils right away when the first result passes', async () => {
  const check = job(1)
  const s = track(pollUntil(check, isReady, { timeout: 1000 }))
  expect(check).toHaveBeenCalledTimes(1)
  await clock.flush()
  expect(s.value).toEqual({ n: 1, ready: true })
  expect(clock.pending()).toBe(0)
})

test('polls every 100ms by default', async () => {
  const check = job(3)
  const s = track(pollUntil(check, isReady))
  await clock.tickAsync(1000)
  expect(check.times).toEqual([0, 100, 200])
  expect(s.value).toEqual({ n: 3, ready: true })
  expect(s.at).toBe(200)
})

test('backs off by factor, capped at maxInterval', async () => {
  const check = job(5)
  pollUntil(check, isReady, { interval: 100, factor: 2, maxInterval: 300 })
  await clock.tickAsync(2000)
  // waits: 100, 200, 300 (400 capped), 300 (800 capped)
  expect(check.times).toEqual([0, 100, 300, 600, 900])
})

test('starts each wait when the previous result arrives', async () => {
  const check = job(3, 30)
  const s = track(pollUntil(check, isReady, { interval: 100 }))
  await clock.tickAsync(1000)
  expect(check.times).toEqual([0, 130, 260])
  expect(s.at).toBe(290)
})

test('passes each result to the predicate', async () => {
  const predicate = fn((r) => r.n === 2)
  const s = track(pollUntil(job(99), predicate, { interval: 10 }))
  await clock.tickAsync(10)
  expect(predicate.mock.calls).toEqual([[{ n: 1, ready: false }], [{ n: 2, ready: false }]])
  expect(s.value.n).toBe(2)
})

test('rejects with TimeoutError at the deadline and stops polling', async () => {
  const check = job(99)
  const s = track(pollUntil(check, isReady, { interval: 100, timeout: 250 }))
  await clock.tickAsync(249)
  expect(s.settled).toBe(false)
  await clock.tickAsync(1)
  expect(s.status).toBe('rejected')
  expect(s.reason.name).toBe('TimeoutError')
  expect(clock.pending()).toBe(0)
  await clock.tickAsync(1000)
  expect(check.times).toEqual([0, 100, 200])
})

test('ignores a poll that returns after the deadline', async () => {
  const check = job(2, 80)
  const s = track(pollUntil(check, isReady, { interval: 50, timeout: 150 }))
  // poll 1: 0-80, wait 50, poll 2 starts at 130 and would succeed at 210
  await clock.tickAsync(300)
  expect(s.reason.name).toBe('TimeoutError')
  expect(s.at).toBe(150)
})

test('rejects when fn fails and stops polling', async () => {
  const err = new Error('404')
  const check = fn().mockReturnValueOnce(Promise.resolve({ ready: false }))
  check.mockImplementation(() => Promise.reject(err))
  const s = track(pollUntil(check, isReady, { interval: 10, timeout: 1000 }))
  await clock.tickAsync(500)
  expect(s.reason).toBe(err)
  expect(check).toHaveBeenCalledTimes(2)
  expect(clock.pending()).toBe(0)
})

test('rejects when the predicate throws', async () => {
  const err = new Error('unexpected shape')
  const s = track(
    pollUntil(job(1), () => {
      throw err
    }),
  )
  await clock.flush()
  expect(s.reason).toBe(err)
})
