test('returns primitives as they are', () => {
  expect(deepClone(42)).toBe(42)
  expect(deepClone('hi')).toBe('hi')
  expect(deepClone(null)).toBe(null)
  expect(deepClone(undefined)).toBe(undefined)
  expect(deepClone(false)).toBe(false)
})

test('returns an equal but separate top-level object', () => {
  const src = { a: 1, b: 'two' }
  const copy = deepClone(src)
  expect(copy).toEqual({ a: 1, b: 'two' })
  expect(copy).not.toBe(src)
})

test('copies nested objects so edits do not leak back', () => {
  const src = { user: { name: 'Ada', address: { city: 'London' } } }
  const copy = deepClone(src)
  copy.user.name = 'Grace'
  copy.user.address.city = 'Paris'
  expect(src).toEqual({ user: { name: 'Ada', address: { city: 'London' } } })
  expect(copy.user.address).not.toBe(src.user.address)
})

test('copies arrays nested in arrays and keeps them arrays', () => {
  const src = [1, [2, [3, 4]], 5]
  const copy = deepClone(src)
  expect(Array.isArray(copy[1][1])).toBe(true)
  expect(copy).toEqual([1, [2, [3, 4]], 5])
  copy[1][1].push(99)
  expect(src[1][1]).toEqual([3, 4])
})

test('copies objects inside arrays inside objects', () => {
  const src = { rows: [{ id: 1, tags: ['a'] }, { id: 2, tags: [] }] }
  const copy = deepClone(src)
  expect(copy).toEqual(src)
  expect(copy.rows).not.toBe(src.rows)
  expect(copy.rows[0]).not.toBe(src.rows[0])
  expect(copy.rows[0].tags).not.toBe(src.rows[0].tags)
})

test('gives empty objects and arrays new containers too', () => {
  const src = { o: {}, a: [] }
  const copy = deepClone(src)
  expect(copy).toEqual({ o: {}, a: [] })
  expect(copy.o).not.toBe(src.o)
  expect(copy.a).not.toBe(src.a)
})

test('keeps null, undefined and zero values inside objects', () => {
  const copy = deepClone({ a: null, b: undefined, c: 0, d: '' })
  expect(copy.a).toBe(null)
  expect('b' in copy).toBe(true)
  expect(copy.c).toBe(0)
  expect(copy.d).toBe('')
})

test('shares functions instead of copying them', () => {
  const onClick = () => 'clicked'
  const copy = deepClone({ handlers: { onClick } })
  expect(copy.handlers.onClick).toBe(onClick)
})

test('copies only own properties', () => {
  const base = { inherited: true }
  const src = Object.create(base)
  src.own = 1
  const copy = deepClone(src)
  expect(Object.keys(copy)).toEqual(['own'])
  expect(copy.inherited).toBeUndefined()
})
