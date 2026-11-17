test('returns the cached result for the same arguments', () => {
  const spy = fn((a, b) => a + b)
  const m = memoizeOne(spy)
  expect(m(1, 2)).toBe(3)
  expect(m(1, 2)).toBe(3)
  expect(spy).toHaveBeenCalledTimes(1)
})

test('remembers only the last call', () => {
  const spy = fn((n) => n * 2)
  const m = memoizeOne(spy)
  m(1)
  m(2)
  m(2)
  m(1)
  expect(spy.mock.calls).toEqual([[1], [2], [1]])
})

test('a different number of arguments is a miss', () => {
  const spy = fn()
  const m = memoizeOne(spy)
  m(1)
  m(1, undefined)
  m(1, undefined)
  expect(spy).toHaveBeenCalledTimes(2)
})

test('compares arguments by reference', () => {
  const spy = fn((list) => list.length)
  const m = memoizeOne(spy)
  const list = [1, 2]
  m(list)
  m(list)
  m([1, 2])
  expect(spy).toHaveBeenCalledTimes(2)
})

test('treats NaN as equal to NaN', () => {
  const spy = fn(() => 'r')
  const m = memoizeOne(spy)
  m(NaN, 'x')
  expect(m(NaN, 'x')).toBe('r')
  expect(spy).toHaveBeenCalledTimes(1)
})

test('a different `this` is a miss', () => {
  const spy = fn(function (n) {
    return this.k * n
  })
  const shared = memoizeOne(spy)
  const a = { k: 2, f: shared }
  const b = { k: 3, f: shared }
  expect(a.f(5)).toBe(10)
  expect(b.f(5)).toBe(15)
  expect(a.f(5)).toBe(10)
  expect(spy).toHaveBeenCalledTimes(3)
})

test('uses a custom isEqual with (newArgs, lastArgs)', () => {
  const spy = fn((o) => o.id)
  const isEqual = fn((next, prev) => next[0].id === prev[0].id)
  const m = memoizeOne(spy, isEqual)
  m({ id: 1 })
  expect(isEqual).not.toHaveBeenCalled()
  m({ id: 1 })
  m({ id: 2 })
  expect(spy).toHaveBeenCalledTimes(2)
  expect(isEqual.mock.calls[0]).toEqual([[{ id: 1 }], [{ id: 1 }]])
  expect(isEqual.mock.calls[1]).toEqual([[{ id: 2 }], [{ id: 1 }]])
})

test('a throwing call keeps the previous entry', () => {
  const spy = fn((n) => {
    if (n < 0) throw new RangeError('negative')
    return n * 10
  })
  const m = memoizeOne(spy)
  m(1)
  expect(() => m(-1)).toThrow(RangeError)
  expect(m(1)).toBe(10)
  expect(spy).toHaveBeenCalledTimes(2)
})

test('caches undefined results and clear() forgets them', () => {
  const spy = fn()
  const m = memoizeOne(spy)
  m('a')
  m('a')
  expect(spy).toHaveBeenCalledTimes(1)
  m.clear()
  m('a')
  expect(spy).toHaveBeenCalledTimes(2)
})
