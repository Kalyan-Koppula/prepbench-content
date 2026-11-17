test('joins nested object keys with dots', () => {
  expect(flattenObject({ a: { b: { c: 1 } }, d: 2 })).toEqual({ 'a.b.c': 1, d: 2 })
})

test('uses the index as the key for array items', () => {
  expect(flattenObject({ tags: ['x', 'y'] })).toEqual({ 'tags.0': 'x', 'tags.1': 'y' })
})

test('handles objects inside arrays inside objects', () => {
  const input = { users: [{ name: 'Ada', roles: ['admin'] }, { name: 'Lin' }] }
  expect(flattenObject(input)).toEqual({
    'users.0.name': 'Ada',
    'users.0.roles.0': 'admin',
    'users.1.name': 'Lin',
  })
})

test('keeps empty objects and arrays as values', () => {
  const result = flattenObject({ filters: {}, selected: [], page: { size: 10, sort: [] } })
  expect(result).toEqual({ filters: {}, selected: [], 'page.size': 10, 'page.sort': [] })
  expect(Array.isArray(result.selected)).toBe(true)
})

test('keeps null, undefined and falsy leaves', () => {
  const result = flattenObject({ a: { n: null, u: undefined, z: 0, f: false } })
  expect(result['a.n']).toBe(null)
  expect('a.u' in result).toBe(true)
  expect(result['a.z']).toBe(0)
  expect(result['a.f']).toBe(false)
})

test('treats dates, class instances and functions as leaves', () => {
  class Money {
    constructor(cents) { this.cents = cents }
  }
  const when = new window.Date(0)
  const price = new Money(500)
  const format = () => ''
  const result = flattenObject({ order: { when, price, format } })
  expect(Object.keys(result)).toEqual(['order.when', 'order.price', 'order.format'])
  expect(result['order.when']).toBe(when)
  expect(result['order.price']).toBe(price)
  expect(result['order.format']).toBe(format)
})

test('descends into null-prototype objects', () => {
  const dict = Object.create(null)
  dict.en = 'Hello'
  expect(flattenObject({ greeting: dict })).toEqual({ 'greeting.en': 'Hello' })
})

test('lists keys in depth-first input order', () => {
  const result = flattenObject({ b: 1, a: { y: 2, x: 3 }, c: [4] })
  expect(Object.keys(result)).toEqual(['b', 'a.y', 'a.x', 'c.0'])
})

test('returns an empty object for empty input and leaves the input alone', () => {
  expect(flattenObject({})).toEqual({})
  const input = { a: { b: 1 } }
  flattenObject(input)
  expect(input).toEqual({ a: { b: 1 } })
})
