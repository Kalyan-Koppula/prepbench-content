const data = {
  user: { name: 'Ada', posts: [{ title: 'Hello', tags: ['js', 'css'] }] },
  matrix: [[1, 2], [3, 4]],
  'a.b': { c: 'dotted' },
  flags: { zero: 0, empty: '', off: false, nothing: null },
}

test('reads a dotted path', () => {
  expect(get(data, 'user.name')).toBe('Ada')
  expect(get({ a: { b: { c: 3 } } }, 'a.b.c')).toBe(3)
})

test('reads array indices written in brackets', () => {
  expect(get(data, 'user.posts[0].title')).toBe('Hello')
  expect(get(data, 'user.posts[0].tags[1]')).toBe('css')
  expect(get(data, 'matrix[1][0]')).toBe(3)
})

test('accepts numeric segments after a dot', () => {
  expect(get(data, 'user.posts.0.tags.0')).toBe('js')
})

test('accepts an array of keys, which may contain dots', () => {
  expect(get(data, ['user', 'posts', 0, 'title'])).toBe('Hello')
  expect(get(data, ['a.b', 'c'])).toBe('dotted')
})

test('returns undefined for a missing path without throwing', () => {
  expect(get(data, 'user.address.city')).toBeUndefined()
  expect(get(data, 'flags.nothing.deeper')).toBeUndefined()
  expect(get(null, 'a.b')).toBeUndefined()
})

test('returns the default when the value is missing', () => {
  expect(get(data, 'user.address.city', 'unknown')).toBe('unknown')
  expect(get(data, 'user.posts[5].title', 'n/a')).toBe('n/a')
  expect(get(undefined, 'x', 42)).toBe(42)
})

test('returns existing falsy values instead of the default', () => {
  expect(get(data, 'flags.zero', 1)).toBe(0)
  expect(get(data, 'flags.empty', 'x')).toBe('')
  expect(get(data, 'flags.off', true)).toBe(false)
  expect(get(data, 'flags.nothing', 'x')).toBe(null)
})

test('supports a path that starts with an index', () => {
  expect(get([{ id: 7 }, { id: 8 }], '[1].id')).toBe(8)
})

test('reads properties of primitives along the way', () => {
  expect(get(data, 'user.name.length')).toBe(3)
})

test('returns the object itself for an empty path', () => {
  expect(get(data, '')).toBe(data)
  expect(get(data, [])).toBe(data)
})
