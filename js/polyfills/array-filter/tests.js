beforeEach(() => {
  Object.defineProperty(Array.prototype, 'myFilter', { value: myFilter, configurable: true, writable: true })
})

test('keeps elements whose callback result is truthy', () => {
  expect([1, 2, 3, 4].myFilter((n) => n % 2 === 0)).toEqual([2, 4])
  expect(['a', '', 'b', 0, null].myFilter((x) => x)).toEqual(['a', 'b'])
  expect([1, 2].myFilter(() => 'yes')).toEqual([1, 2])
})

test('returns a new array and leaves the original alone', () => {
  const src = [1, 2, 3]
  const out = src.myFilter(() => true)
  expect(out).toEqual([1, 2, 3])
  expect(out).not.toBe(src)
  expect(src).toEqual([1, 2, 3])
})

test('passes value, index and the array, with thisArg as `this`', () => {
  const src = ['x', 'y']
  const ctx = {}
  const spy = fn(() => true)
  src.myFilter(spy, ctx)
  expect(spy.mock.calls).toEqual([
    ['x', 0, src],
    ['y', 1, src],
  ])
  expect(spy.mock.contexts[0]).toBe(ctx)
})

test('skips holes and returns a dense array', () => {
  const spy = fn(() => true)
  const out = [1, , 3, , 5].myFilter(spy)
  expect(spy).toHaveBeenCalledTimes(3)
  expect(out).toEqual([1, 3, 5])
  expect(out).toHaveLength(3)
})

test('keeps undefined values that really exist', () => {
  const out = [undefined, 1].myFilter(() => true)
  expect(out).toHaveLength(2)
})

test('visits only the original length', () => {
  const src = [1, 2]
  const spy = fn((n, i, arr) => {
    if (i === 0) arr.push(10)
    return true
  })
  const out = src.myFilter(spy)
  expect(spy).toHaveBeenCalledTimes(2)
  expect(out).toEqual([1, 2])
})

test('throws a TypeError when the callback is not a function', () => {
  expect(() => [1].myFilter(undefined)).toThrow(TypeError)
  expect(() => [].myFilter({})).toThrow(TypeError)
})

test('works on array-likes', () => {
  const out = Array.prototype.myFilter.call({ length: 3, 0: 'a', 1: 'bb', 2: 'ccc' }, (s) => s.length > 1)
  expect(Array.isArray(out)).toBe(true)
  expect(out).toEqual(['bb', 'ccc'])
})

test('does not rely on the built-in filter', () => {
  const saved = Array.prototype.filter
  Array.prototype.filter = () => {
    throw new Error('used the built-in filter')
  }
  let out
  try {
    out = [1, 2, 3].myFilter((n) => n > 1)
  } finally {
    Array.prototype.filter = saved
  }
  expect(out).toEqual([2, 3])
})
