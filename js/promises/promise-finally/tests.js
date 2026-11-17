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

test('runs the callback with no arguments and passes the value through', async () => {
  const cb = fn(() => 'ignored')
  const s = track(promiseFinally(after(20, 'data'), cb))
  await clock.tickAsync(20)
  expect(cb).toHaveBeenCalledTimes(1)
  expect(cb.mock.calls[0]).toEqual([])
  expect(s.status).toBe('fulfilled')
  expect(s.value).toBe('data')
})

test('runs the callback on rejection and keeps the original reason', async () => {
  const cb = fn()
  const err = new Error('failed')
  const s = track(promiseFinally(failAfter(10, err), cb))
  await clock.tickAsync(10)
  expect(cb).toHaveBeenCalledTimes(1)
  expect(s.status).toBe('rejected')
  expect(s.reason).toBe(err)
})

test('never runs the callback synchronously', async () => {
  const cb = fn()
  promiseFinally(Promise.resolve(1), cb)
  expect(cb).not.toHaveBeenCalled()
  await clock.flush()
  expect(cb).toHaveBeenCalledTimes(1)
})

test('waits for a promise returned by the callback', async () => {
  const s = track(promiseFinally(Promise.resolve('value'), () => after(100, 'cleanup done')))
  await clock.tickAsync(99)
  expect(s.settled).toBe(false)
  await clock.tickAsync(1)
  expect(s).toEqual({ settled: true, status: 'fulfilled', value: 'value', at: 100 })
})

test('an error thrown by the callback replaces the value', async () => {
  const cleanupError = new Error('cleanup failed')
  const s = track(
    promiseFinally(Promise.resolve('value'), () => {
      throw cleanupError
    }),
  )
  await clock.flush()
  expect(s.status).toBe('rejected')
  expect(s.reason).toBe(cleanupError)
})

test('a rejected promise from the callback replaces the original reason', async () => {
  const original = new Error('original')
  const cleanupError = new Error('cleanup failed')
  const s = track(promiseFinally(failAfter(5, original), () => failAfter(10, cleanupError)))
  await clock.tickAsync(15)
  expect(s.reason).toBe(cleanupError)
  expect(s.at).toBe(15)
})

test('passes the outcome through when the callback is not a function', async () => {
  const ok = track(promiseFinally(after(5, 'kept'), undefined))
  const bad = track(promiseFinally(failAfter(5, 'reason'), null))
  await clock.tickAsync(5)
  expect(ok.value).toBe('kept')
  expect(bad.reason).toBe('reason')
})

test('does not run the callback before the promise settles', async () => {
  const cb = fn()
  promiseFinally(after(50, 'x'), cb)
  await clock.tickAsync(49)
  expect(cb).not.toHaveBeenCalled()
  await clock.tickAsync(1)
  expect(cb).toHaveBeenCalledTimes(1)
})

test('works with thenables as the source', async () => {
  const thenable = { then: (resolve) => setTimeout(resolve, 10, 'from thenable') }
  const cb = fn()
  const s = track(promiseFinally(thenable, cb))
  await clock.tickAsync(10)
  expect(cb).toHaveBeenCalledTimes(1)
  expect(s.value).toBe('from thenable')
})
