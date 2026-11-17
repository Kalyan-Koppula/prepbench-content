test('lets the first `limit` calls through and returns results', () => {
  const spy = fn((x) => x * 2)
  const r = rateLimit(spy, 3, 1000)
  expect(r(1)).toBe(2)
  expect(r(2)).toBe(4)
  expect(r(3)).toBe(6)
  expect(spy).toHaveBeenCalledTimes(3)
})

test('drops calls over the limit and returns undefined', () => {
  const spy = fn(() => 'ran')
  const r = rateLimit(spy, 2, 1000)
  r('a')
  r('b')
  expect(r('c')).toBeUndefined()
  expect(spy.mock.calls).toEqual([['a'], ['b']])
})

test('uses a sliding window', () => {
  const spy = fn()
  const r = rateLimit(spy, 2, 1000)
  const at = (ms, v) => {
    clock.tick(ms - (clock.now() - start))
    r(v)
  }
  const start = clock.now()
  at(0, 'a')
  at(400, 'b')
  at(800, 'c')
  at(1000, 'd')
  at(1100, 'e')
  at(1400, 'f')
  expect(spy.mock.calls).toEqual([['a'], ['b'], ['d'], ['f']])
})

test('is not a fixed window that resets all at once', () => {
  const spy = fn()
  const r = rateLimit(spy, 2, 1000)
  r(1)
  clock.tick(900)
  r(2)
  clock.tick(100) // t=1000: only the call at 900 is in the window
  r(3)
  clock.tick(1) // t=1001: calls at 900 and 1000 are in the window
  r(4)
  expect(spy.mock.calls).toEqual([[1], [2], [3]])
})

test('dropped calls do not count toward the limit', () => {
  const spy = fn()
  const r = rateLimit(spy, 1, 100)
  r(1)
  clock.tick(50)
  r(2)
  clock.tick(49)
  r(3)
  clock.tick(1) // t=100
  r(4)
  expect(spy.mock.calls).toEqual([[1], [4]])
})

test('frees up as soon as calls age out after a quiet period', () => {
  const spy = fn()
  const r = rateLimit(spy, 2, 500)
  r(1)
  r(2)
  r(3)
  clock.tick(10_000)
  r(4)
  r(5)
  r(6)
  expect(spy.mock.calls).toEqual([[1], [2], [4], [5]])
})

test('forwards `this` and arguments', () => {
  const spy = fn(function (a, b) {
    return this.id + a + b
  })
  const obj = { id: 'x', go: rateLimit(spy, 1, 100) }
  expect(obj.go('y', 'z')).toBe('xyz')
  expect(spy.mock.contexts[0]).toBe(obj)
})

test('each limited function has its own history', () => {
  const s1 = fn()
  const s2 = fn()
  const r1 = rateLimit(s1, 1, 1000)
  const r2 = rateLimit(s2, 1, 1000)
  r1()
  r2()
  r1()
  expect(s1).toHaveBeenCalledTimes(1)
  expect(s2).toHaveBeenCalledTimes(1)
})
