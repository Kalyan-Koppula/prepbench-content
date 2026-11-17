test('NaN is the same as NaN', () => {
  expect(objectIs(NaN, NaN)).toBe(true)
  expect(objectIs(0 / 0, Number.NaN)).toBe(true)
  expect(objectIs(NaN, 'NaN')).toBe(false)
})

test('+0 and -0 are different', () => {
  expect(objectIs(0, -0)).toBe(false)
  expect(objectIs(-0, 0)).toBe(false)
  expect(objectIs(-0, -0)).toBe(true)
  expect(objectIs(0, +0)).toBe(true)
  expect(objectIs(0, 0 * -1)).toBe(false)
})

test('equal primitives are the same', () => {
  expect(objectIs(1, 1)).toBe(true)
  expect(objectIs('a', 'a')).toBe(true)
  expect(objectIs(true, true)).toBe(true)
  expect(objectIs(null, null)).toBe(true)
  expect(objectIs(undefined, undefined)).toBe(true)
  expect(objectIs(Infinity, 1 / 0)).toBe(true)
})

test('different values are not the same', () => {
  expect(objectIs(1, 2)).toBe(false)
  expect(objectIs(Infinity, -Infinity)).toBe(false)
  expect(objectIs('a', 'b')).toBe(false)
})

test('no type coercion', () => {
  expect(objectIs(1, '1')).toBe(false)
  expect(objectIs(0, false)).toBe(false)
  expect(objectIs(null, undefined)).toBe(false)
  expect(objectIs('', 0)).toBe(false)
})

test('objects are compared by reference', () => {
  const o = { a: 1 }
  expect(objectIs(o, o)).toBe(true)
  expect(objectIs(o, { a: 1 })).toBe(false)
  expect(objectIs([], [])).toBe(false)
  const s = Symbol('s')
  expect(objectIs(s, s)).toBe(true)
  expect(objectIs(Symbol('s'), Symbol('s'))).toBe(false)
})

test('does not rely on Object.is', () => {
  const saved = Object.is
  Object.is = () => {
    throw new Error('used the built-in Object.is')
  }
  let results
  try {
    results = [objectIs(NaN, NaN), objectIs(0, -0), objectIs(1, 1)]
  } finally {
    Object.is = saved
  }
  expect(results).toEqual([true, false, true])
})
