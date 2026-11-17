test('joins simple pairs in key order', () => {
  expect(stringifyQuery({ page: 2, sort: 'price', dir: 'asc' })).toBe('page=2&sort=price&dir=asc')
})

test('encodes keys and values', () => {
  expect(stringifyQuery({ 'full name': 'Zoë Ö', q: 'a&b=c?d/e', plus: '1+1' })).toBe(
    'full%20name=Zo%C3%AB%20%C3%96&q=a%26b%3Dc%3Fd%2Fe&plus=1%2B1',
  )
})

test('repeats the key for each array item', () => {
  expect(stringifyQuery({ id: [3, 1, 2], none: [], flat: ['a', ['b', ['c']]] })).toBe('id=3&id=1&id=2&flat=a&flat=b&flat=c')
})

test('skips undefined and writes null as an empty value', () => {
  expect(stringifyQuery({ a: undefined, b: null, c: [1, undefined, 2], d: 'x' })).toBe('b=&c=1&c=2&d=x')
})

test('stringifies numbers, booleans and empty strings', () => {
  expect(stringifyQuery({ n: 0, f: false, t: true, s: '', neg: -1.5 })).toBe('n=0&f=false&t=true&s=&neg=-1.5')
})

test('writes dates as encoded ISO strings', () => {
  const when = new window.Date(Date.UTC(2025, 0, 2, 3, 4, 5))
  expect(stringifyQuery({ since: when })).toBe('since=2025-01-02T03%3A04%3A05.000Z')
})

test('nests plain objects with brackets', () => {
  expect(stringifyQuery({ filter: { size: 'm', tags: ['new', 'sale'] }, page: 1 })).toBe(
    'filter[size]=m&filter[tags]=new&filter[tags]=sale&page=1',
  )
})

test('nests to any depth and encodes keys inside brackets', () => {
  expect(stringifyQuery({ a: { 'b c': { d: 1, e: null } } })).toBe('a[b%20c][d]=1&a[b%20c][e]=')
})

test('returns an empty string for an empty object', () => {
  expect(stringifyQuery({})).toBe('')
  expect(stringifyQuery({ gone: undefined, nested: {} })).toBe('')
})
