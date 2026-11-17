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

test('fulfils with the value when the promise is fast enough', async () => {
  const s = track(withTimeout(after(50, 'data'), 100))
  await clock.tickAsync(50)
  expect(s).toEqual({ settled: true, status: 'fulfilled', value: 'data', at: 50 })
})

test('passes a rejection through when it happens in time', async () => {
  const err = new Error('server error')
  const s = track(withTimeout(failAfter(30, err), 100))
  await clock.tickAsync(30)
  expect(s.status).toBe('rejected')
  expect(s.reason).toBe(err)
})

test('rejects with a TimeoutError after exactly ms', async () => {
  const s = track(withTimeout(after(500, 'too slow'), 200))
  await clock.tickAsync(199)
  expect(s.settled).toBe(false)
  await clock.tickAsync(1)
  expect(s.status).toBe('rejected')
  expect(s.at).toBe(200)
  expect(s.reason).toBeInstanceOf(Error)
  expect(s.reason.name).toBe('TimeoutError')
  expect(s.reason.message).toBe('Timed out after 200ms')
})

test('clears its timer when the promise fulfils first', async () => {
  withTimeout(after(10, 'x'), 1000)
  await clock.tickAsync(10)
  expect(clock.pending()).toBe(0)
})

test('clears its timer when the promise rejects first', async () => {
  withTimeout(failAfter(10, new Error('x')), 1000).catch(() => {})
  await clock.tickAsync(10)
  expect(clock.pending()).toBe(0)
})

test('ignores the promise once the timeout has fired', async () => {
  const s = track(withTimeout(after(150, 'late'), 100))
  await clock.tickAsync(200)
  expect(s.reason.name).toBe('TimeoutError')
})

test('an already-resolved promise beats a zero timeout', async () => {
  const s = track(withTimeout(Promise.resolve('instant'), 0))
  await clock.tickAsync(0)
  expect(s.value).toBe('instant')
})

test('accepts plain values and thenables', async () => {
  const thenable = { then: (resolve) => setTimeout(resolve, 20, 'thenable') }
  const a = track(withTimeout('plain', 50))
  const b = track(withTimeout(thenable, 50))
  await clock.tickAsync(20)
  expect(a.value).toBe('plain')
  expect(b.value).toBe('thenable')
})
