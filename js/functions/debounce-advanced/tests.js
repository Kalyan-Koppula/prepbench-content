test('trails with the latest arguments by default', () => {
  const spy = fn()
  const d = debounce(spy, 100)
  d('a')
  clock.tick(50)
  d('b')
  clock.tick(99)
  expect(spy).not.toHaveBeenCalled()
  clock.tick(1)
  expect(spy.mock.calls).toEqual([['b']])
})

test('leading only: later calls in the burst are ignored but extend it', () => {
  const spy = fn()
  const d = debounce(spy, 100, { leading: true, trailing: false })
  d(1)
  expect(spy.mock.calls).toEqual([[1]])
  clock.tick(60)
  d(2)
  clock.tick(60)
  d(3) // t=120: still inside the burst because of the call at 60
  clock.tick(300)
  expect(spy.mock.calls).toEqual([[1]])
  d(4) // quiet for 300ms: a new burst
  expect(spy.mock.calls).toEqual([[1], [4]])
})

test('leading and trailing: a single call runs only once', () => {
  const spy = fn()
  const d = debounce(spy, 100, { leading: true, trailing: true })
  d('x')
  clock.tick(500)
  expect(spy).toHaveBeenCalledTimes(1)
})

test('leading and trailing: a burst runs at both edges', () => {
  const spy = fn()
  const d = debounce(spy, 100, { leading: true })
  d('a')
  clock.tick(30)
  d('b')
  clock.tick(30)
  d('c')
  expect(spy.mock.calls).toEqual([['a']])
  clock.tick(100)
  expect(spy.mock.calls).toEqual([['a'], ['c']])
})

test('returns the result of the latest run', () => {
  const t = debounce((x) => x + 1, 50)
  expect(t(1)).toBeUndefined()
  clock.tick(50)
  expect(t(9)).toBe(2)

  const l = debounce((x) => x * 2, 50, { leading: true })
  expect(l(1)).toBe(2)
  expect(l(5)).toBe(2)
  clock.tick(50) // trailing run with 5
  expect(l(7)).toBe(14) // new burst, leading run with 7
})

test('flush runs the pending call now and returns its result', () => {
  const spy = fn((s) => s.toUpperCase())
  const d = debounce(spy, 100)
  d('a')
  d('b')
  expect(d.flush()).toBe('B')
  expect(spy.mock.calls).toEqual([['b']])
  clock.tick(300)
  expect(spy).toHaveBeenCalledTimes(1)
})

test('flush with nothing pending does not call fn', () => {
  const spy = fn(() => 'r')
  const d = debounce(spy, 100, { leading: true })
  expect(d.flush()).toBeUndefined()
  expect(d()).toBe('r')
  expect(d.flush()).toBe('r')
  expect(spy).toHaveBeenCalledTimes(1)
})

test('cancel drops the pending call and resets the leading edge', () => {
  const spy = fn()
  const d = debounce(spy, 100, { leading: true })
  d(1)
  d(2)
  clock.tick(50)
  d.cancel()
  d(3)
  expect(spy.mock.calls).toEqual([[1], [3]])
  clock.tick(300)
  expect(spy.mock.calls).toEqual([[1], [3]])
})

test('maxWait forces runs during a long burst', () => {
  const spy = fn()
  const d = debounce(spy, 100, { maxWait: 250 })
  for (let t = 0; t <= 600; t += 40) {
    d(t)
    clock.tick(40)
  }
  expect(spy.mock.calls).toEqual([[240], [480]])
  clock.tick(60)
  expect(spy.mock.calls).toEqual([[240], [480], [600]])
})

test('leaves no timers running after a burst ends', () => {
  const spy = fn()
  const d = debounce(spy, 100, { maxWait: 300 })
  d(1)
  clock.tick(50)
  d(2)
  clock.tick(100)
  expect(spy.mock.calls).toEqual([[2]])
  expect(clock.pending()).toBe(0)
})

test('keeps `this` for leading and trailing runs', () => {
  const spy = fn()
  const a = { name: 'a', f: debounce(spy, 50, { leading: true }) }
  const b = { name: 'b', f: a.f }
  a.f()
  b.f()
  clock.tick(50)
  expect(spy.mock.contexts[0]).toBe(a)
  expect(spy.mock.contexts[1]).toBe(b)
})
