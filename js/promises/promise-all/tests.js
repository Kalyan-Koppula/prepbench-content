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

test('returns a promise', () => {
  const p = promiseAll([1])
  expect(p).toBeInstanceOf(Promise)
})

test('fulfils with values in input order, not settle order', async () => {
  const s = track(promiseAll([after(300, 'a'), after(100, 'b'), after(200, 'c')]))
  await clock.tickAsync(299)
  expect(s.settled).toBe(false)
  await clock.tickAsync(1)
  expect(s).toEqual({ settled: true, status: 'fulfilled', value: ['a', 'b', 'c'], at: 300 })
})

test('treats plain values as fulfilled', async () => {
  const s = track(promiseAll([1, after(10, 2), 'three', null]))
  await clock.tickAsync(10)
  expect(s.value).toEqual([1, 2, 'three', null])
})

test('fulfils with an empty array for an empty input', async () => {
  const s = track(promiseAll([]))
  await clock.flush()
  expect(s.status).toBe('fulfilled')
  expect(s.value).toEqual([])
})

test('rejects with the earliest rejection in time, as soon as it happens', async () => {
  const late = new Error('late')
  const early = new Error('early')
  const s = track(promiseAll([after(500, 'ok'), failAfter(300, late), failAfter(100, early)]))
  await clock.tickAsync(100)
  expect(s.status).toBe('rejected')
  expect(s.reason).toBe(early)
  expect(s.at).toBe(100)
})

test('ignores later rejections after the first one', async () => {
  const first = new Error('first')
  const s = track(promiseAll([failAfter(10, first), failAfter(20, new Error('second'))]))
  await clock.tickAsync(50)
  expect(s.reason).toBe(first)
})

test('accepts any iterable, including generators', async () => {
  function* gen() {
    yield after(20, 'x')
    yield 'y'
  }
  const fromSet = track(promiseAll(new Set([after(5, 1), 2])))
  const fromGen = track(promiseAll(gen()))
  await clock.tickAsync(20)
  expect(fromSet.value).toEqual([1, 2])
  expect(fromGen.value).toEqual(['x', 'y'])
})

test('adopts thenables', async () => {
  const thenable = { then: (resolve) => setTimeout(resolve, 30, 'from thenable') }
  const s = track(promiseAll([thenable, 'plain']))
  await clock.tickAsync(30)
  expect(s.value).toEqual(['from thenable', 'plain'])
})

test('keeps undefined values at their index', async () => {
  const s = track(promiseAll([after(10, undefined), after(5, 'b')]))
  await clock.tickAsync(10)
  expect(s.value).toHaveLength(2)
  expect(s.value[1]).toBe('b')
})
