const people = [
  { name: 'Ada', team: 'core', age: 36 },
  { name: 'Lin', team: 'web', age: 29 },
  { name: 'Sam', team: 'core', age: 41 },
]

test('groups by the value a function returns', () => {
  const result = groupBy(people, (p) => (p.age >= 35 ? 'senior' : 'junior'))
  expect(result).toEqual({ senior: [people[0], people[2]], junior: [people[1]] })
})

test('accepts a property name instead of a function', () => {
  const result = groupBy(people, 'team')
  expect(result.core).toEqual([people[0], people[2]])
  expect(result.web).toEqual([people[1]])
  expect(Object.keys(result)).toEqual(['core', 'web'])
})

test('keeps the original items, in order, inside each group', () => {
  const result = groupBy(people, 'team')
  expect(result.core[0]).toBe(people[0])
  expect(result.core[1]).toBe(people[2])
})

test('passes the index as the second argument', () => {
  const spy = fn((x, i) => (i % 2 === 0 ? 'even' : 'odd'))
  const result = groupBy(['a', 'b', 'c'], spy)
  expect(spy.mock.calls).toEqual([['a', 0], ['b', 1], ['c', 2]])
  expect(result).toEqual({ even: ['a', 'c'], odd: ['b'] })
})

test('turns non-string keys into strings', () => {
  const result = groupBy([1.2, 1.8, 2.5, -1], (n) => (n < 0 ? undefined : Math.floor(n)))
  expect(Object.keys(result).sort()).toEqual(['1', '2', 'undefined'])
  expect(result['1']).toEqual([1.2, 1.8])
  expect(groupBy([0, 1, 2], (n) => n > 0).true).toEqual([1, 2])
})

test('returns an empty object for no items', () => {
  expect(Object.keys(groupBy([], 'x'))).toEqual([])
})

test('returns a null-prototype object', () => {
  expect(Object.getPrototypeOf(groupBy([1], String))).toBe(null)
})

test('works with keys that exist on Object.prototype', () => {
  const words = ['toString', 'constructor', '__proto__', 'toString']
  const result = groupBy(words, (w) => w)
  expect(result.toString).toEqual(['toString', 'toString'])
  expect(result.constructor).toEqual(['constructor'])
  expect(result['__proto__']).toEqual(['__proto__'])
  expect(Object.keys(result)).toHaveLength(3)
})

test('accepts any iterable', () => {
  const result = groupBy(new Set(['apple', 'avocado', 'banana']), (s) => s[0])
  expect(result.a).toEqual(['apple', 'avocado'])
  expect(result.b).toEqual(['banana'])
})
