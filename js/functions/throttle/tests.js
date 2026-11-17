test('runs immediately on the first call', () => {
  const spy = fn()
  const t = throttle(spy, 100)
  t('a', 1)
  expect(spy.mock.calls).toEqual([['a', 1]])
})

test('runs the latest call from the window when it closes', () => {
  const spy = fn()
  const t = throttle(spy, 100)
  t(1)
  clock.tick(20)
  t(2)
  clock.tick(20)
  t(3)
  expect(spy.mock.calls).toEqual([[1]])
  clock.tick(59)
  expect(spy.mock.calls).toEqual([[1]])
  clock.tick(1)
  expect(spy.mock.calls).toEqual([[1], [3]])
})

test('a single call does not cause a trailing run', () => {
  const spy = fn()
  const t = throttle(spy, 100)
  t('only')
  clock.tick(500)
  expect(spy).toHaveBeenCalledTimes(1)
})

test('the trailing run opens a new window', () => {
  const spy = fn()
  const t = throttle(spy, 100)
  t(1)
  t(2)
  clock.tick(100)
  expect(spy.mock.calls).toEqual([[1], [2]])
  t(3) // t=100: inside the window opened by the trailing run
  expect(spy).toHaveBeenCalledTimes(2)
  clock.tick(99)
  expect(spy).toHaveBeenCalledTimes(2)
  clock.tick(1)
  expect(spy.mock.calls[2]).toEqual([3])
})

test('runs immediately again after a quiet window', () => {
  const spy = fn()
  const t = throttle(spy, 100)
  t(1)
  clock.tick(150)
  t(2)
  expect(spy.mock.calls).toEqual([[1], [2]])
})

test('a steady stream runs once per window', () => {
  const spy = fn()
  const t = throttle(spy, 100)
  for (let ms = 0; ms <= 270; ms += 30) {
    t(ms)
    clock.tick(30)
  }
  clock.tick(500)
  expect(spy.mock.calls).toEqual([[0], [90], [180], [270]])
})

test('keeps `this` for immediate and trailing runs', () => {
  const spy = fn()
  const a = { f: throttle(spy, 50) }
  const b = { f: a.f }
  a.f()
  b.f()
  clock.tick(50)
  expect(spy.mock.contexts[0]).toBe(a)
  expect(spy.mock.contexts[1]).toBe(b)
})

test('separate throttled functions do not share state', () => {
  const s1 = fn()
  const s2 = fn()
  const t1 = throttle(s1, 100)
  const t2 = throttle(s2, 100)
  t1('x')
  t2('y')
  expect(s1.mock.calls).toEqual([['x']])
  expect(s2.mock.calls).toEqual([['y']])
})
