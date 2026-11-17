beforeEach(() => {
  Object.defineProperty(Array.prototype, 'myReduce', { value: myReduce, configurable: true, writable: true })
})

const add = (a, b) => a + b

test('folds with an initial value', () => {
  expect([1, 2, 3].myReduce(add, 10)).toBe(16)
  expect(['a', 'b'].myReduce((acc, s) => ({ ...acc, [s]: true }), {})).toEqual({ a: true, b: true })
})

test('passes accumulator, value, index and the array', () => {
  const src = [5, 6]
  const spy = fn((acc, v) => acc + v)
  src.myReduce(spy, 0)
  expect(spy.mock.calls).toEqual([
    [0, 5, 0, src],
    [5, 6, 1, src],
  ])
})

test('without an initial value starts from the first element', () => {
  const spy = fn(add)
  expect([1, 2, 3].myReduce(spy)).toBe(6)
  expect(spy.mock.calls[0]).toEqual([1, 2, 1, [1, 2, 3]])
  expect(spy).toHaveBeenCalledTimes(2)
})

test('an explicit undefined is still an initial value', () => {
  expect([1, 2].myReduce((acc, n) => String(acc) + n, undefined)).toBe('undefined12')
})

test('empty arrays: TypeError without an initial value, initial value otherwise', () => {
  expect(() => [].myReduce(add)).toThrow(TypeError)
  const spy = fn()
  expect([].myReduce(spy, 'init')).toBe('init')
  expect(spy).not.toHaveBeenCalled()
})

test('a single element without an initial value is returned as is', () => {
  const spy = fn()
  expect(['only'].myReduce(spy)).toBe('only')
  expect(spy).not.toHaveBeenCalled()
})

test('skips holes, including leading ones', () => {
  const spy = fn(add)
  expect([, , 5, , 7].myReduce(spy)).toBe(12)
  expect(spy.mock.calls).toEqual([[5, 7, 4, [, , 5, , 7]]])
  expect([1, , 3].myReduce((acc, n, i) => acc + i, '')).toBe('02')
})

test('an array of only holes has no starting value', () => {
  expect(() => [, ,].myReduce(add)).toThrow(TypeError)
  expect([, ,].myReduce(add, 0)).toBe(0)
})

test('throws a TypeError for a non-function callback', () => {
  expect(() => [1, 2].myReduce('sum')).toThrow(TypeError)
  expect(() => [].myReduce(null, 0)).toThrow(TypeError)
})

test('does not rely on the built-in reduce', () => {
  const saved = [Array.prototype.reduce, Array.prototype.reduceRight]
  Array.prototype.reduce = Array.prototype.reduceRight = () => {
    throw new Error('used the built-in reduce')
  }
  let out
  try {
    out = [1, 2, 3].myReduce((a, b) => a * b)
  } finally {
    ;[Array.prototype.reduce, Array.prototype.reduceRight] = saved
  }
  expect(out).toBe(6)
})
