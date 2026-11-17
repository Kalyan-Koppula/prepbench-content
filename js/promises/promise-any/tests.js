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

test('fulfils with the first value to arrive', async () => {
  const s = track(promiseAny([after(300, 'slow'), after(100, 'fast'), after(200, 'mid')]))
  await clock.tickAsync(100)
  expect(s).toEqual({ settled: true, status: 'fulfilled', value: 'fast', at: 100 })
})

test('skips over earlier rejections', async () => {
  const s = track(promiseAny([failAfter(10, new Error('a')), after(50, 'ok'), failAfter(20, new Error('b'))]))
  await clock.tickAsync(49)
  expect(s.settled).toBe(false)
  await clock.tickAsync(1)
  expect(s.value).toBe('ok')
})

test('rejects with an AggregateError once every input has rejected', async () => {
  const s = track(promiseAny([failAfter(10, 'x'), failAfter(40, 'y')]))
  await clock.tickAsync(39)
  expect(s.settled).toBe(false)
  await clock.tickAsync(1)
  expect(s.status).toBe('rejected')
  expect(s.reason).toBeInstanceOf(AggregateError)
})

test('lists the reasons in input order, not rejection order', async () => {
  const e1 = new Error('first in list, rejects last')
  const e2 = new Error('second in list, rejects first')
  const s = track(promiseAny([failAfter(30, e1), failAfter(10, e2)]))
  await clock.tickAsync(30)
  expect(s.reason.errors).toHaveLength(2)
  expect(s.reason.errors[0]).toBe(e1)
  expect(s.reason.errors[1]).toBe(e2)
})

test('rejects an empty input with an empty AggregateError', async () => {
  const p = promiseAny([])
  expect(p).toBeInstanceOf(Promise)
  const s = track(p)
  await clock.flush()
  expect(s.reason).toBeInstanceOf(AggregateError)
  expect(s.reason.errors).toEqual([])
})

test('treats a plain value as an immediate fulfilment', async () => {
  const s = track(promiseAny([failAfter(5, 'no'), 'cached']))
  await clock.flush()
  expect(s.value).toBe('cached')
})

test('adopts thenables', async () => {
  const thenable = { then: (resolve) => setTimeout(resolve, 25, 'thenable') }
  const s = track(promiseAny([failAfter(5, 'no'), thenable]))
  await clock.tickAsync(25)
  expect(s.value).toBe('thenable')
})

test('a later fulfilment does not replace the first one', async () => {
  const s = track(promiseAny(new Set([after(10, 'one'), after(20, 'two')])))
  await clock.tickAsync(20)
  expect(s.value).toBe('one')
})
