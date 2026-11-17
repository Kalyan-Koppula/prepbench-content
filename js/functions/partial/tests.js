const _ = partial.placeholder

test('prepends the preset arguments', () => {
  const spy = fn((a, b, c) => [a, b, c].join(' '))
  const p = partial(spy, 'a', 'b')
  expect(p('c')).toBe('a b c')
  expect(spy).toHaveBeenCalledWith('a', 'b', 'c')
})

test('works with no presets', () => {
  const spy = fn()
  partial(spy)(1, 2)
  expect(spy).toHaveBeenCalledWith(1, 2)
})

test('always calls fn immediately, even with too few arguments', () => {
  const spy = fn()
  const p = partial((a, b, c) => spy(a, b, c), 1)
  p()
  expect(spy).toHaveBeenCalledWith(1, undefined, undefined)
})

test('is reusable without leaking arguments between calls', () => {
  const spy = fn()
  const p = partial(spy, 1)
  p(2)
  p(3, 4)
  expect(spy.mock.calls).toEqual([
    [1, 2],
    [1, 3, 4],
  ])
})

test('fills placeholders left to right, then appends', () => {
  const spy = fn()
  partial(spy, _, 'b', _)('a', 'c', 'd')
  expect(spy.mock.calls[0]).toEqual(['a', 'b', 'c', 'd'])
})

test('unfilled placeholders become undefined', () => {
  const spy = fn()
  partial(spy, _, 'b', _)('a')
  expect(spy.mock.calls[0]).toEqual(['a', 'b', undefined])
  expect(spy.mock.calls[0][2]).toBeUndefined()
})

test('placeholders are refilled on every call', () => {
  const spy = fn()
  const p = partial(spy, _, 2)
  p(1)
  p(3)
  expect(spy.mock.calls).toEqual([
    [1, 2],
    [3, 2],
  ])
})

test('forwards `this` and returns the result', () => {
  const obj = {
    rate: 3,
    scale: partial(function (a, b) {
      return this.rate * (a + b)
    }, 10),
  }
  expect(obj.scale(5)).toBe(45)
})
