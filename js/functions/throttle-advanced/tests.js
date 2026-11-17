test('defaults to leading and trailing runs', () => {
  const spy = fn()
  const t = throttle(spy, 100)
  t(1)
  t(2)
  expect(spy.mock.calls).toEqual([[1]])
  clock.tick(100)
  expect(spy.mock.calls).toEqual([[1], [2]])
})

test('leading: false waits for the end of the window and uses the latest call', () => {
  const spy = fn()
  const t = throttle(spy, 100, { leading: false })
  t(1)
  clock.tick(40)
  t(2)
  clock.tick(59)
  expect(spy).not.toHaveBeenCalled()
  clock.tick(1)
  expect(spy.mock.calls).toEqual([[2]])
})

test('leading: false runs a single call exactly once', () => {
  const spy = fn()
  const t = throttle(spy, 100, { leading: false })
  t('x')
  expect(spy).not.toHaveBeenCalled()
  clock.tick(100)
  expect(spy).toHaveBeenCalledTimes(1)
  clock.tick(500)
  expect(spy).toHaveBeenCalledTimes(1)
})

test('trailing: false drops calls without extending the window', () => {
  const spy = fn()
  const t = throttle(spy, 100, { trailing: false })
  t(1)
  clock.tick(60)
  t(2)
  clock.tick(60)
  t(3) // t=120: the window opened at 0 has closed
  expect(spy.mock.calls).toEqual([[1], [3]])
  clock.tick(500)
  expect(spy.mock.calls).toEqual([[1], [3]])
})

test('leading: false keeps one run per window during a stream', () => {
  const spy = fn()
  const t = throttle(spy, 100, { leading: false })
  for (let ms = 0; ms <= 270; ms += 30) {
    t(ms)
    clock.tick(30)
  }
  clock.tick(500)
  expect(spy.mock.calls).toEqual([[90], [180], [270]])
})

test('a trailing run opens the next window', () => {
  const spy = fn()
  const t = throttle(spy, 100)
  t(1)
  t(2)
  clock.tick(100)
  t(3)
  expect(spy.mock.calls).toEqual([[1], [2]])
  clock.tick(100)
  expect(spy.mock.calls).toEqual([[1], [2], [3]])
})

test('cancel drops the saved call and reopens the gate', () => {
  const spy = fn()
  const t = throttle(spy, 100)
  t(1)
  t(2)
  clock.tick(30)
  t.cancel()
  t(3)
  expect(spy.mock.calls).toEqual([[1], [3]])
  clock.tick(500)
  expect(spy.mock.calls).toEqual([[1], [3]])
})

test('returns the result of the latest run', () => {
  const t = throttle((x) => x * 10, 100)
  expect(t(1)).toBe(10)
  expect(t(2)).toBe(10)
  clock.tick(100)
  expect(t(3)).toBe(20)
  const late = throttle((x) => x, 100, { leading: false })
  expect(late('a')).toBeUndefined()
})

test('keeps `this` for trailing runs', () => {
  const spy = fn()
  const a = { f: throttle(spy, 50, { leading: false }) }
  const b = { f: a.f }
  a.f()
  b.f()
  clock.tick(50)
  expect(spy).toHaveBeenCalledTimes(1)
  expect(spy.mock.contexts[0]).toBe(b)
})
