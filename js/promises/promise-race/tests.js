const setTimeout = window.setTimeout // timers on the fake clock
const start = clock.now()
const after = (ms, value) => new Promise((resolve) => setTimeout(resolve, ms, value))
const failAfter = (ms, reason) => {
  const p = new Promise((_, reject) => setTimeout(reject, ms, reason))
  p.catch(() => {})
  return p
}
function track(p) {
  const s = { settled: false }
  Promise.resolve(p).then(
    (value) => Object.assign(s, { settled: true, status: 'fulfilled', value, at: clock.now() - start }),
    (reason) => Object.assign(s, { settled: true, status: 'rejected', reason, at: clock.now() - start }),
  )
  return s
}

test('fulfils with the first input to settle', async () => {
  const s = track(promiseRace([after(80, 'slow'), after(30, 'fast')]))
  await clock.tickAsync(30)
  expect(s).toEqual({ settled: true, status: 'fulfilled', value: 'fast', at: 30 })
})

test('rejects when the first input to settle rejects', async () => {
  const err = new Error('timeout')
  const s = track(promiseRace([after(100, 'data'), failAfter(50, err)]))
  await clock.tickAsync(49)
  expect(s.settled).toBe(false)
  await clock.tickAsync(1)
  expect(s.status).toBe('rejected')
  expect(s.reason).toBe(err)
})

test('ignores everything that settles afterwards', async () => {
  const s = track(promiseRace([after(10, 'winner'), failAfter(20, 'late error'), after(30, 'late value')]))
  await clock.tickAsync(30)
  expect(s.value).toBe('winner')
})

test('lets a plain value win against pending promises', async () => {
  const s = track(promiseRace([after(10, 'promise'), 'plain']))
  await clock.flush()
  expect(s.value).toBe('plain')
})

test('already-settled inputs win in iteration order', async () => {
  const s = track(promiseRace([Promise.resolve('a'), 'b']))
  await clock.flush()
  expect(s.value).toBe('a')
})

test('adopts thenables', async () => {
  const thenable = { then: (resolve) => setTimeout(resolve, 5, 'thenable') }
  const s = track(promiseRace([after(10, 'promise'), thenable]))
  await clock.tickAsync(10)
  expect(s.value).toBe('thenable')
})

test('accepts any iterable', async () => {
  const s = track(promiseRace(new Set([after(20, 'x'), after(15, 'y')])))
  await clock.tickAsync(20)
  expect(s.value).toBe('y')
})

test('stays pending forever for an empty input', async () => {
  const p = promiseRace([])
  expect(p).toBeInstanceOf(Promise)
  const s = track(p)
  await clock.runAllAsync()
  expect(s.settled).toBe(false)
})
