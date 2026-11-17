test('copies plain nested data', () => {
  const src = { a: [1, { b: 2 }], c: { d: 'x' } }
  const copy = cloneDeep(src)
  expect(copy).toEqual(src)
  expect(copy.a[1]).not.toBe(src.a[1])
  expect(Array.isArray(copy.a)).toBe(true)
})

test('handles an object that contains itself', () => {
  const src = { name: 'root' }
  src.self = src
  const copy = cloneDeep(src)
  expect(copy).not.toBe(src)
  expect(copy.self).toBe(copy)
})

test('keeps shared references shared in the copy', () => {
  const shared = { n: 1 }
  const src = { left: shared, right: shared, list: [shared] }
  const copy = cloneDeep(src)
  expect(copy.left).not.toBe(shared)
  expect(copy.right).toBe(copy.left)
  expect(copy.list[0]).toBe(copy.left)
})

test('clones Maps, including object keys and values', () => {
  const key = { id: 1 }
  const src = new Map([[key, { score: 10 }], ['plain', [1, 2]]])
  const copy = cloneDeep(src)
  expect(copy).toBeInstanceOf(Map)
  expect(copy).not.toBe(src)
  const [copiedKey] = copy.keys()
  expect(copiedKey).toEqual({ id: 1 })
  expect(copiedKey).not.toBe(key)
  expect(copy.get(copiedKey)).not.toBe(src.get(key))
  expect(copy.get('plain')).toEqual([1, 2])
  expect(copy.get('plain')).not.toBe(src.get('plain'))
})

test('clones Sets and their object members', () => {
  const member = { tag: 'a' }
  const src = new Set([1, member])
  const copy = cloneDeep(src)
  expect(copy).toBeInstanceOf(Set)
  expect(copy.size).toBe(2)
  expect(copy.has(1)).toBe(true)
  expect(copy.has(member)).toBe(false)
  expect([...copy][1]).toEqual({ tag: 'a' })
})

test('clones Dates and RegExps as new instances', () => {
  const src = { when: new window.Date(Date.UTC(2024, 0, 15)), pattern: /ab+c/gi }
  const copy = cloneDeep(src)
  expect(copy.when).toBeInstanceOf(Date)
  expect(copy.when).not.toBe(src.when)
  expect(copy.when.getTime()).toBe(src.when.getTime())
  expect(copy.pattern).toBeInstanceOf(RegExp)
  expect(copy.pattern).not.toBe(src.pattern)
  expect(copy.pattern.source).toBe('ab+c')
  expect(copy.pattern.flags).toBe('gi')
})

test('copies symbol-keyed properties', () => {
  const secret = Symbol('secret')
  const src = { visible: 1, [secret]: { hidden: true } }
  const copy = cloneDeep(src)
  expect(copy[secret]).toEqual({ hidden: true })
  expect(copy[secret]).not.toBe(src[secret])
})

test('keeps class instances working', () => {
  class Point {
    constructor(x, y) { this.x = x; this.y = y }
    length() { return Math.hypot(this.x, this.y) }
  }
  const copy = cloneDeep({ p: new Point(3, 4) })
  expect(copy.p).toBeInstanceOf(Point)
  expect(copy.p.length()).toBe(5)
})

test('keeps null-prototype objects null-prototype', () => {
  const src = Object.create(null)
  src.key = 'value'
  const copy = cloneDeep(src)
  expect(Object.getPrototypeOf(copy)).toBe(null)
  expect(copy.key).toBe('value')
})

test('handles cycles that pass through Maps and arrays', () => {
  const map = new Map()
  map.set('me', map)
  const arr = [map]
  arr.push(arr)
  const copy = cloneDeep(arr)
  expect(copy[1]).toBe(copy)
  expect(copy[0].get('me')).toBe(copy[0])
  expect(copy[0]).not.toBe(map)
})

test('returns primitives and functions as they are', () => {
  const f = () => 1
  expect(cloneDeep(7)).toBe(7)
  expect(cloneDeep(null)).toBe(null)
  expect(cloneDeep(f)).toBe(f)
  expect(cloneDeep({ f }).f).toBe(f)
})
