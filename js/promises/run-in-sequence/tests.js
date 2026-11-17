const setTimeout = window.setTimeout // timers on the fake clock
const start = clock.now()
const after = (ms, value) => new Promise((resolve) => setTimeout(resolve, ms, value))
function track(p) {
  const s = { settled: false }
  Promise.resolve(p).then(
    (value) => Object.assign(s, { settled: true, status: 'fulfilled', value, at: clock.now() - start }),
    (reason) => Object.assign(s, { settled: true, status: 'rejected', reason, at: clock.now() - start }),
  )
  return s
}

test('passes each result to the next task and collects them all', async () => {
  const s = track(runInSequence([(n) => after(10, n + 1), (n) => after(10, n * 10), (n) => 'n=' + n], 4))
  await clock.tickAsync(20)
  expect(s.value).toEqual([5, 50, 'n=50'])
})

test('starts each task only after the previous one finishes', async () => {
  const starts = []
  const task = (ms) => () => {
    starts.push(clock.now() - start)
    return after(ms)
  }
  const s = track(runInSequence([task(100), task(30), task(50)]))
  await clock.tickAsync(129)
  expect(starts).toEqual([0, 100])
  await clock.tickAsync(100)
  expect(starts).toEqual([0, 100, 130])
  expect(s.at).toBe(180)
})

test('calls the first task synchronously with the initial value', () => {
  const first = fn(() => after(10))
  runInSequence([first], 'seed')
  expect(first).toHaveBeenCalledWith('seed')
})

test('does not call the next task while the previous is pending', async () => {
  const second = fn()
  runInSequence([() => after(50), second])
  await clock.tickAsync(49)
  expect(second).not.toHaveBeenCalled()
  await clock.tickAsync(1)
  expect(second).toHaveBeenCalledTimes(1)
})

test('stops at the first rejection', async () => {
  const err = new Error('step 2 failed')
  const third = fn()
  const s = track(
    runInSequence([
      () => after(10, 'a'),
      () => after(10).then(() => Promise.reject(err)),
      third,
    ]),
  )
  await clock.runAllAsync()
  expect(s.status).toBe('rejected')
  expect(s.reason).toBe(err)
  expect(third).not.toHaveBeenCalled()
})

test('handles synchronous tasks and synchronous throws', async () => {
  const err = new Error('sync')
  const ok = track(runInSequence([(x) => x + 1, (x) => x * 2], 1))
  const bad = track(
    runInSequence([
      () => {
        throw err
      },
    ]),
  )
  await clock.flush()
  expect(ok.value).toEqual([2, 4])
  expect(bad.reason).toBe(err)
})

test('fulfils with an empty array when there are no tasks', async () => {
  const s = track(runInSequence([], 'unused'))
  await clock.flush()
  expect(s.value).toEqual([])
})

test('waits for thenables', async () => {
  const thenable = { then: (resolve) => setTimeout(resolve, 40, 'thenable') }
  const s = track(runInSequence([() => thenable, (prev) => prev + '!']))
  await clock.tickAsync(40)
  expect(s.value).toEqual(['thenable', 'thenable!'])
})
