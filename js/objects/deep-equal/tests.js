test('compares primitives by value without coercion', () => {
  expect(deepEqual(1, 1)).toBe(true)
  expect(deepEqual('a', 'a')).toBe(true)
  expect(deepEqual(1, '1')).toBe(false)
  expect(deepEqual(null, undefined)).toBe(false)
  expect(deepEqual(null, {})).toBe(false)
})

test('treats NaN as equal to NaN and 0 as equal to -0', () => {
  expect(deepEqual(NaN, NaN)).toBe(true)
  expect(deepEqual({ v: NaN }, { v: NaN })).toBe(true)
  expect(deepEqual(0, -0)).toBe(true)
  expect(deepEqual([-0], [0])).toBe(true)
})

test('compares nested objects regardless of key order', () => {
  const a = { user: { name: 'Ada', roles: ['admin'] }, active: true }
  const b = { active: true, user: { roles: ['admin'], name: 'Ada' } }
  expect(deepEqual(a, b)).toBe(true)
  expect(deepEqual(a, { ...b, user: { name: 'Ada', roles: ['user'] } })).toBe(false)
})

test('treats a key set to undefined as different from a missing key', () => {
  expect(deepEqual({ a: 1, b: undefined }, { b: undefined, a: 1 })).toBe(true)
  expect(deepEqual({ a: 1, b: undefined }, { a: 1 })).toBe(false)
  expect(deepEqual({ a: 1 }, { a: 1, b: undefined })).toBe(false)
  expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false)
})

test('compares arrays by position and length, never as objects', () => {
  expect(deepEqual([1, [2, 3]], [1, [2, 3]])).toBe(true)
  expect(deepEqual([1, 2], [2, 1])).toBe(false)
  expect(deepEqual([1, 2], [1, 2, 3])).toBe(false)
  expect(deepEqual([], {})).toBe(false)
  expect(deepEqual(['x'], { 0: 'x', length: 1 })).toBe(false)
})

test('requires the same prototype', () => {
  class Point {
    constructor(x, y) { this.x = x; this.y = y }
  }
  expect(deepEqual(new Point(1, 2), new Point(1, 2))).toBe(true)
  expect(deepEqual(new Point(1, 2), { x: 1, y: 2 })).toBe(false)
  expect(deepEqual(new Map(), {})).toBe(false)
})

test('compares Dates by time and RegExps by source and flags', () => {
  const D = window.Date
  expect(deepEqual(new D(1000), new D(1000))).toBe(true)
  expect(deepEqual(new D(1000), new D(2000))).toBe(false)
  expect(deepEqual(/a+/g, /a+/g)).toBe(true)
  expect(deepEqual(/a+/g, /a+/i)).toBe(false)
  expect(deepEqual(/a+/, /b+/)).toBe(false)
})

test('compares Maps by key and deep value', () => {
  const k = { id: 1 }
  expect(deepEqual(new Map([['a', { n: 1 }], [k, [1]]]), new Map([[k, [1]], ['a', { n: 1 }]]))).toBe(true)
  expect(deepEqual(new Map([['a', { n: 1 }]]), new Map([['a', { n: 2 }]]))).toBe(false)
  expect(deepEqual(new Map([['a', 1]]), new Map([['b', 1]]))).toBe(false)
  expect(deepEqual(new Map([['a', 1]]), new Map([['a', 1], ['b', 2]]))).toBe(false)
})

test('pairs up Set members one-to-one by deep equality', () => {
  expect(deepEqual(new Set([1, 2, 3]), new Set([3, 2, 1]))).toBe(true)
  expect(deepEqual(new Set([{ a: 1 }, [2]]), new Set([[2], { a: 1 }]))).toBe(true)
  expect(deepEqual(new Set([[1], [1]]), new Set([[1], [2]]))).toBe(false)
  expect(deepEqual(new Set([1]), new Set([1, 2]))).toBe(false)
})

test('handles cycles on both sides', () => {
  const a = { v: 1 }
  a.self = a
  const b = { v: 1 }
  b.self = b
  expect(deepEqual(a, b)).toBe(true)
  const c = { v: 2 }
  c.self = c
  expect(deepEqual(a, c)).toBe(false)
  const listA = [1]
  listA.push(listA)
  const listB = [1]
  listB.push(listB)
  expect(deepEqual(listA, listB)).toBe(true)
})

test('treats functions as equal only to themselves', () => {
  const f = () => 1
  expect(deepEqual({ f }, { f })).toBe(true)
  expect(deepEqual({ f }, { f: () => 1 })).toBe(false)
})
