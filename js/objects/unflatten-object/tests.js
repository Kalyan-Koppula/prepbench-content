test('nests dot-separated keys', () => {
  expect(unflattenObject({ 'a.b.c': 1, d: 2 })).toEqual({ a: { b: { c: 1 } }, d: 2 })
})

test('merges keys that share a prefix into one object', () => {
  expect(unflattenObject({ 'theme.color': 'teal', 'theme.size': 'lg', 'theme.font.family': 'Inter' })).toEqual({
    theme: { color: 'teal', size: 'lg', font: { family: 'Inter' } },
  })
})

test('creates arrays for numeric segments', () => {
  const result = unflattenObject({ 'tags.0': 'a', 'tags.1': 'b' })
  expect(Array.isArray(result.tags)).toBe(true)
  expect(result).toEqual({ tags: ['a', 'b'] })
})

test('mixes arrays and objects at any depth', () => {
  const result = unflattenObject({ 'users.0.name': 'Ada', 'users.0.roles.0': 'admin', 'users.1.name': 'Lin' })
  expect(result).toEqual({ users: [{ name: 'Ada', roles: ['admin'] }, { name: 'Lin' }] })
  expect(Array.isArray(result.users[0].roles)).toBe(true)
})

test('stores leaf values as they are, including empty containers and null', () => {
  const empty = {}
  const result = unflattenObject({ 'page.filters': empty, 'page.selected': [], 'page.cursor': null })
  expect(result.page.filters).toBe(empty)
  expect(result.page.selected).toEqual([])
  expect(result.page.cursor).toBe(null)
})

test('throws when a key has to pass through a leaf value', () => {
  expect(() => unflattenObject({ user: 'Ada', 'user.name': 'Ada' })).toThrow()
  expect(() => unflattenObject({ count: 0, 'count.total': 1 })).toThrow()
})

test('throws when a leaf would overwrite nested keys', () => {
  expect(() => unflattenObject({ 'user.name': 'Ada', user: 'Ada' })).toThrow()
})

test('does not walk into objects that were passed in as values', () => {
  const settings = { a: 1 }
  expect(() => unflattenObject({ settings, 'settings.b': 2 })).toThrow()
  expect(settings).toEqual({ a: 1 })
})

test('skips keys that could reach Object.prototype', () => {
  try {
    const result = unflattenObject({ '__proto__.polluted': 'yes', 'constructor.prototype.polluted': 'yes', ok: 1 })
    expect({}.polluted).toBeUndefined()
    expect(result).toEqual({ ok: 1 })
  } finally {
    delete Object.prototype.polluted
  }
})

test('returns a fresh empty object for empty input', () => {
  const flat = {}
  const result = unflattenObject(flat)
  expect(result).toEqual({})
  expect(result).not.toBe(flat)
})
