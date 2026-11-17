const setTimeout = window.setTimeout // timers on the fake clock
function track(p) {
  const s = { settled: false }
  Promise.resolve(p).then(
    (value) => Object.assign(s, { settled: true, status: 'fulfilled', value }),
    (reason) => Object.assign(s, { settled: true, status: 'rejected', reason }),
  )
  return s
}
const later = (name, cb) => setTimeout(() => cb(null, name.toUpperCase()), 10)

test('fulfils with the value passed to the callback', async () => {
  const s = track(promisify(later)('ok'))
  await clock.tickAsync(9)
  expect(s.settled).toBe(false)
  await clock.tickAsync(1)
  expect(s.value).toBe('OK')
})

test('rejects with the error passed to the callback', async () => {
  const err = new Error('disk full')
  const s = track(promisify((cb) => setTimeout(cb, 5, err))())
  await clock.tickAsync(5)
  expect(s.status).toBe('rejected')
  expect(s.reason).toBe(err)
})

test('appends the callback after the caller arguments', async () => {
  const spy = fn((a, b, cb) => cb(null, a + b))
  const s = track(promisify(spy)(2, 3))
  await clock.flush()
  expect(spy.mock.calls[0]).toHaveLength(3)
  expect(spy.mock.calls[0].slice(0, 2)).toEqual([2, 3])
  expect(typeof spy.mock.calls[0][2]).toBe('function')
  expect(s.value).toBe(5)
})

test('keeps `this` from the call site', async () => {
  const counter = {
    count: 41,
    increment(cb) {
      this.count += 1
      cb(null, this.count)
    },
  }
  counter.incrementAsync = promisify(counter.increment)
  const s = track(counter.incrementAsync())
  await clock.flush()
  expect(s.value).toBe(42)
  expect(counter.count).toBe(42)
})

test('treats null and undefined errors as success', async () => {
  const a = track(promisify((cb) => cb(null, 'a'))())
  const b = track(promisify((cb) => cb(undefined, 'b'))())
  const c = track(promisify((cb) => cb())())
  await clock.flush()
  expect([a.value, b.value, c.value]).toEqual(['a', 'b', undefined])
  expect(c.status).toBe('fulfilled')
})

test('rejects when the function throws synchronously', async () => {
  const err = new TypeError('bad input')
  const wrapped = promisify(() => {
    throw err
  })
  let p
  expect(() => {
    p = wrapped()
  }).not.toThrow()
  const s = track(p)
  await clock.flush()
  expect(s.reason).toBe(err)
})

test('only the first callback call counts', async () => {
  const s = track(
    promisify((cb) => {
      cb(null, 'first')
      cb(new Error('second'))
      cb(null, 'third')
    })(),
  )
  await clock.flush()
  expect(s.status).toBe('fulfilled')
  expect(s.value).toBe('first')
})

test('runs the function once per call, not when wrapping', async () => {
  const spy = fn((x, cb) => cb(null, x * 2))
  const wrapped = promisify(spy)
  expect(spy).not.toHaveBeenCalled()
  const one = track(wrapped(1))
  const two = track(wrapped(2))
  await clock.flush()
  expect(spy).toHaveBeenCalledTimes(2)
  expect([one.value, two.value]).toEqual([2, 4])
})
