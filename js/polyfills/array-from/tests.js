test('copies an array into a new array', () => {
  const src = [1, 2, 3]
  const out = arrayFrom(src)
  expect(out).toEqual([1, 2, 3])
  expect(out).not.toBe(src)
})

test('consumes iterables: Set, Map, generator', () => {
  expect(arrayFrom(new Set(['a', 'a', 'b']))).toEqual(['a', 'b'])
  expect(arrayFrom(new Map([['k', 1]]))).toEqual([['k', 1]])
  function* gen() {
    yield 1
    yield 2
  }
  expect(arrayFrom(gen())).toEqual([1, 2])
})

test('splits strings by code point', () => {
  expect(arrayFrom('a😀b')).toEqual(['a', '😀', 'b'])
})

test('copies array-likes, filling missing indices with undefined', () => {
  const out = arrayFrom({ length: 3, 0: 'a', 2: 'c' })
  expect(out).toEqual(['a', undefined, 'c'])
  expect(out).toHaveLength(3)
  expect(1 in out).toBe(true)
})

test('coerces length to a whole number', () => {
  expect(arrayFrom({ length: '2', 0: 'x', 1: 'y' })).toEqual(['x', 'y'])
  expect(arrayFrom({ length: 2.7, 0: 'x', 1: 'y' })).toEqual(['x', 'y'])
  expect(arrayFrom({ length: -5 })).toEqual([])
  expect(arrayFrom({ length: 'many' })).toEqual([])
  expect(arrayFrom({})).toEqual([])
  expect(arrayFrom(42)).toEqual([])
})

test('turns holes in an array into real undefined entries', () => {
  const out = arrayFrom([1, , 3])
  expect(out).toHaveLength(3)
  expect(1 in out).toBe(true)
})

test('calls mapFn with (value, index) and thisArg', () => {
  const ctx = { k: 10 }
  const spy = fn(function (v, i) {
    return v * this.k + i
  })
  expect(arrayFrom(new Set([1, 2]), spy, ctx)).toEqual([10, 21])
  expect(spy.mock.calls).toEqual([
    [1, 0],
    [2, 1],
  ])
  expect(spy.mock.contexts[0]).toBe(ctx)
  expect(arrayFrom({ length: 3 }, (_, i) => i * i)).toEqual([0, 1, 4])
})

test('prefers the iterator over length', () => {
  const both = {
    length: 5,
    *[Symbol.iterator]() {
      yield 'from iterator'
    },
  }
  expect(arrayFrom(both)).toEqual(['from iterator'])
})

test('throws a TypeError for null, undefined or a bad mapFn', () => {
  expect(() => arrayFrom(null)).toThrow(TypeError)
  expect(() => arrayFrom(undefined)).toThrow(TypeError)
  expect(() => arrayFrom([1], 'nope')).toThrow(TypeError)
  expect(arrayFrom([1], undefined)).toEqual([1])
})

test('does not rely on Array.from', () => {
  const saved = Array.from
  Array.from = () => {
    throw new Error('used the built-in Array.from')
  }
  let out
  try {
    out = arrayFrom({ length: 2, 0: 'p', 1: 'q' }, (s) => s.toUpperCase())
  } finally {
    Array.from = saved
  }
  expect(out).toEqual(['P', 'Q'])
})
