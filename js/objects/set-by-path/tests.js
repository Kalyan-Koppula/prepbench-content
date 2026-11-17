test('sets a value on an existing nested path', () => {
  const obj = { a: { b: { c: 1 } } }
  set(obj, 'a.b.c', 2)
  expect(obj).toEqual({ a: { b: { c: 2 } } })
})

test('returns the same object it was given', () => {
  const obj = {}
  expect(set(obj, 'x', 1)).toBe(obj)
  expect(obj.x).toBe(1)
})

test('creates missing objects along the way', () => {
  const obj = {}
  set(obj, 'settings.theme.color', 'teal')
  expect(obj).toEqual({ settings: { theme: { color: 'teal' } } })
})

test('creates arrays when the next key is an index', () => {
  const obj = {}
  set(obj, 'users[0].name', 'Ada')
  expect(Array.isArray(obj.users)).toBe(true)
  expect(obj).toEqual({ users: [{ name: 'Ada' }] })
})

test('treats a numeric key after a dot as an index too', () => {
  const obj = {}
  set(obj, 'grid.1.0', 'x')
  expect(Array.isArray(obj.grid)).toBe(true)
  expect(Array.isArray(obj.grid[1])).toBe(true)
  expect(obj.grid).toHaveLength(2)
  expect(obj.grid[1][0]).toBe('x')
})

test('keeps existing containers and their other keys', () => {
  const list = [{ id: 1 }, { id: 2 }]
  const obj = { meta: { a: 1 }, list }
  set(obj, 'meta.b', 2)
  set(obj, 'list[1].done', true)
  expect(obj.meta).toEqual({ a: 1, b: 2 })
  expect(obj.list).toBe(list)
  expect(list).toEqual([{ id: 1 }, { id: 2, done: true }])
})

test('keeps an existing object even when the next key is numeric', () => {
  const obj = { byId: { 5: 'five' } }
  set(obj, 'byId.7', 'seven')
  expect(Array.isArray(obj.byId)).toBe(false)
  expect(obj.byId).toEqual({ 5: 'five', 7: 'seven' })
})

test('replaces a primitive or null that is in the way', () => {
  const obj = { a: 'text', b: null }
  set(obj, 'a.inner', 1)
  set(obj, 'b[0]', 'z')
  expect(obj).toEqual({ a: { inner: 1 }, b: ['z'] })
})

test('accepts an array path whose keys may contain dots', () => {
  const obj = {}
  set(obj, ['config', 'api.url'], '/v2')
  expect(obj).toEqual({ config: { 'api.url': '/v2' } })
})

test('refuses paths that could modify Object.prototype', () => {
  try {
    const obj = {}
    expect(set(obj, '__proto__.hacked', true)).toBe(obj)
    set({}, 'constructor.prototype.hacked', true)
    set({}, ['__proto__', 'hacked'], true)
    expect({}.hacked).toBeUndefined()
    expect(obj).toEqual({})
  } finally {
    delete Object.prototype.hacked
  }
})
