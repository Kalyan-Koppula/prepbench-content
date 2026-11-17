beforeEach(() => {
  Object.defineProperty(Array.prototype, 'myMap', { value: myMap, configurable: true, writable: true })
})

test('maps every element into a new array', () => {
  const src = [1, 2, 3]
  const out = src.myMap((n) => n * 10)
  expect(out).toEqual([10, 20, 30])
  expect(out).not.toBe(src)
  expect(src).toEqual([1, 2, 3])
})

test('passes value, index and the array', () => {
  const src = ['a', 'b']
  const spy = fn()
  src.myMap(spy)
  expect(spy.mock.calls).toEqual([
    ['a', 0, src],
    ['b', 1, src],
  ])
  expect(spy.mock.calls[0][2]).toBe(src)
})

test('uses thisArg as the callback `this`', () => {
  const ctx = { factor: 3 }
  const out = [1, 2].myMap(function (n) {
    return n * this.factor
  }, ctx)
  expect(out).toEqual([3, 6])
})

test('skips holes and keeps them in the result', () => {
  const spy = fn((n) => n * 2)
  const out = [1, , 3].myMap(spy)
  expect(spy).toHaveBeenCalledTimes(2)
  expect(out).toHaveLength(3)
  expect(1 in out).toBe(false)
  expect(out[0]).toBe(2)
  expect(out[2]).toBe(6)
})

test('visits only the original length', () => {
  const src = [1, 2]
  const spy = fn((n, i, arr) => {
    if (i === 0) arr.push(99)
    return n
  })
  const out = src.myMap(spy)
  expect(spy).toHaveBeenCalledTimes(2)
  expect(out).toEqual([1, 2])
  expect(src).toEqual([1, 2, 99])
})

test('reads elements when they are visited', () => {
  const src = [1, 2, 3, 4]
  const out = src.myMap((n, i, arr) => {
    if (i === 0) {
      arr[2] = 30
      delete arr[3]
    }
    return n
  })
  expect(out[2]).toBe(30)
  expect(out).toHaveLength(4)
  expect(3 in out).toBe(false)
})

test('throws a TypeError when the callback is not a function', () => {
  expect(() => [1].myMap(null)).toThrow(TypeError)
  expect(() => [].myMap('nope')).toThrow(TypeError)
})

test('works on array-likes and returns a real array', () => {
  const out = Array.prototype.myMap.call({ length: 2, 0: 'a', 1: 'b' }, (s) => s.toUpperCase())
  expect(Array.isArray(out)).toBe(true)
  expect(out).toEqual(['A', 'B'])
})

test('does not rely on the built-in map', () => {
  const saved = Array.prototype.map
  Array.prototype.map = () => {
    throw new Error('used the built-in map')
  }
  let out
  try {
    out = [1, 2].myMap((n) => n + 1)
  } finally {
    Array.prototype.map = saved
  }
  expect(out).toEqual([2, 3])
})
