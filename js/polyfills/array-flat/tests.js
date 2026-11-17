beforeEach(() => {
  Object.defineProperty(Array.prototype, 'myFlat', { value: myFlat, configurable: true, writable: true })
})

const nested = () => [1, [2, [3, [4]]]]

test('flattens one level by default', () => {
  expect(nested().myFlat()).toEqual([1, 2, [3, [4]]])
  expect(nested().myFlat(undefined)).toEqual([1, 2, [3, [4]]])
})

test('flattens to the given depth', () => {
  expect(nested().myFlat(2)).toEqual([1, 2, 3, [4]])
  expect(nested().myFlat(3)).toEqual([1, 2, 3, 4])
})

test('Infinity flattens everything', () => {
  let deep = ['core']
  for (let i = 0; i < 50; i++) deep = [deep, i]
  const out = deep.myFlat(Infinity)
  expect(out).toHaveLength(51)
  expect(out[0]).toBe('core')
  expect(out.some(Array.isArray)).toBe(false)
})

test('depth 0, negative or NaN returns a shallow copy', () => {
  const inner = [2]
  const src = [1, inner]
  const copy = src.myFlat(0)
  expect(copy).toEqual([1, [2]])
  expect(copy).not.toBe(src)
  expect(copy[1]).toBe(inner)
  expect(src.myFlat(-1)).toEqual([1, [2]])
  expect(src.myFlat(NaN)).toEqual([1, [2]])
})

test('removes holes from every flattened level', () => {
  const out = [1, , [2, , 3], , 4].myFlat()
  expect(out).toEqual([1, 2, 3, 4])
  expect(out).toHaveLength(4)
})

test('keeps arrays nested deeper than depth untouched', () => {
  const deepInner = [1, , 2]
  const out = [[deepInner]].myFlat(1)
  expect(out).toHaveLength(1)
  expect(out[0]).toBe(deepInner)
})

test('keeps undefined and null elements that exist', () => {
  const out = [undefined, [null, undefined]].myFlat()
  expect(out).toHaveLength(3)
  expect(out[1]).toBeNull()
})

test('does not flatten strings or array-likes', () => {
  const arrayLike = { length: 1, 0: 'x' }
  const out = ['ab', [arrayLike]].myFlat(Infinity)
  expect(out).toHaveLength(2)
  expect(out[0]).toBe('ab')
  expect(out[1]).toBe(arrayLike)
})

test('does not modify the original array', () => {
  const src = [1, [2, [3]]]
  src.myFlat(Infinity)
  expect(src).toEqual([1, [2, [3]]])
})

test('does not rely on the built-in flat', () => {
  const saved = [Array.prototype.flat, Array.prototype.flatMap]
  Array.prototype.flat = Array.prototype.flatMap = () => {
    throw new Error('used the built-in flat')
  }
  let out
  try {
    out = [1, [2, [3]]].myFlat(2)
  } finally {
    ;[Array.prototype.flat, Array.prototype.flatMap] = saved
  }
  expect(out).toEqual([1, 2, 3])
})
