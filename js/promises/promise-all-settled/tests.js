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

test('records fulfilled and rejected outcomes in input order', async () => {
  const boom = new Error('boom')
  const s = track(promiseAllSettled([after(30, 'a'), failAfter(10, boom), after(20, 'c')]))
  await clock.tickAsync(30)
  expect(s.status).toBe('fulfilled')
  expect(s.value).toEqual([
    { status: 'fulfilled', value: 'a' },
    { status: 'rejected', reason: boom },
    { status: 'fulfilled', value: 'c' },
  ])
})

test('waits for the slowest input even when an early one rejects', async () => {
  const s = track(promiseAllSettled([failAfter(5, new Error('x')), after(200, 'slow')]))
  await clock.tickAsync(199)
  expect(s.settled).toBe(false)
  await clock.tickAsync(1)
  expect(s.settled).toBe(true)
  expect(s.at).toBe(200)
})

test('never rejects, even when every input rejects', async () => {
  const s = track(promiseAllSettled([failAfter(1, 'a'), failAfter(2, 'b')]))
  await clock.tickAsync(2)
  expect(s.status).toBe('fulfilled')
  expect(s.value.map((o) => o.reason)).toEqual(['a', 'b'])
})

test('treats plain values as fulfilled', async () => {
  const s = track(promiseAllSettled([0, 'x', undefined]))
  await clock.flush()
  expect(s.value).toEqual([
    { status: 'fulfilled', value: 0 },
    { status: 'fulfilled', value: 'x' },
    { status: 'fulfilled', value: undefined },
  ])
})

test('outcome objects have exactly status plus value or reason', async () => {
  const s = track(promiseAllSettled([Promise.resolve(1), failAfter(0, 'no')]))
  await clock.tickAsync(0)
  expect(Object.keys(s.value[0]).sort()).toEqual(['status', 'value'])
  expect(Object.keys(s.value[1]).sort()).toEqual(['reason', 'status'])
})

test('fulfils with an empty array for an empty input', async () => {
  const s = track(promiseAllSettled(new Set()))
  await clock.flush()
  expect(s.value).toEqual([])
})

test('adopts thenables that reject', async () => {
  const thenable = { then: (_, reject) => setTimeout(reject, 15, 'nope') }
  const s = track(promiseAllSettled([thenable]))
  await clock.tickAsync(15)
  expect(s.value).toEqual([{ status: 'rejected', reason: 'nope' }])
})

test('accepts a generator', async () => {
  function* gen() {
    yield after(10, 1)
    yield failAfter(5, 2)
  }
  const s = track(promiseAllSettled(gen()))
  await clock.tickAsync(10)
  expect(s.value).toEqual([
    { status: 'fulfilled', value: 1 },
    { status: 'rejected', reason: 2 },
  ])
})
