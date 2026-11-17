const makeState = () => ({
  user: { name: 'Ada', tags: ['admin'], address: { city: 'London' } },
  settings: { theme: 'dark' },
  todos: [{ id: 1, done: false }, { id: 2, done: false }],
})

test('$set replaces a nested value and copies the path to it', () => {
  const state = makeState()
  const next = update(state, { user: { address: { city: { $set: 'Paris' } } } })
  expect(next.user.address.city).toBe('Paris')
  expect(next).not.toBe(state)
  expect(next.user).not.toBe(state.user)
  expect(next.user.address).not.toBe(state.user.address)
})

test('shares every branch that was not touched', () => {
  const state = makeState()
  const next = update(state, { user: { name: { $set: 'Grace' } } })
  expect(next.user.name).toBe('Grace')
  expect(next.settings).toBe(state.settings)
  expect(next.todos).toBe(state.todos)
  expect(next.user.tags).toBe(state.user.tags)
  expect(next.user.address).toBe(state.user.address)
})

test('never mutates the original state', () => {
  const state = makeState()
  update(state, { user: { tags: { $push: ['x'] }, address: { $merge: { zip: 'N1' } } }, settings: { $set: null } })
  expect(state).toEqual(makeState())
})

test('$push appends items to a new array', () => {
  const state = makeState()
  const next = update(state, { user: { tags: { $push: ['owner', 'billing'] } } })
  expect(next.user.tags).toEqual(['admin', 'owner', 'billing'])
  expect(state.user.tags).toEqual(['admin'])
})

test('$merge shallow-merges keys into a new object', () => {
  const state = makeState()
  const next = update(state, { settings: { $merge: { fontSize: 14, theme: 'light' } } })
  expect(next.settings).toEqual({ theme: 'light', fontSize: 14 })
  expect(state.settings).toEqual({ theme: 'dark' })
})

test('$apply computes the new value from the old one', () => {
  const next = update({ count: 4 }, { count: { $apply: (n) => n * 10 } })
  expect(next).toEqual({ count: 40 })
})

test('numeric keys update array items and keep the array an array', () => {
  const state = makeState()
  const next = update(state, { todos: { 1: { done: { $set: true } } } })
  expect(Array.isArray(next.todos)).toBe(true)
  expect(next.todos[1]).toEqual({ id: 2, done: true })
  expect(next.todos[0]).toBe(state.todos[0])
  expect(next.todos).not.toBe(state.todos)
})

test('applies several updates from one spec', () => {
  const state = makeState()
  const next = update(state, { user: { name: { $set: 'Lin' } }, settings: { theme: { $set: 'light' } } })
  expect(next.user.name).toBe('Lin')
  expect(next.settings.theme).toBe('light')
  expect(next.todos).toBe(state.todos)
})

test('returns the original object when nothing actually changes', () => {
  const state = makeState()
  expect(update(state, { user: { name: { $set: 'Ada' } } })).toBe(state)
  expect(update(state, { settings: { $apply: (s) => s } })).toBe(state)
  expect(update(state, {})).toBe(state)
})

test('throws on unknown commands and on commands mixed with keys', () => {
  expect(() => update({ a: 1 }, { a: { $increment: 1 } })).toThrow(Error)
  expect(() => update({ a: { b: 1 } }, { a: { $set: 1, b: { $set: 2 } } })).toThrow(Error)
})

test('throws a TypeError for a target of the wrong kind', () => {
  expect(() => update({ list: 'abc' }, { list: { $push: ['d'] } })).toThrow(TypeError)
  expect(() => update({ list: [1] }, { list: { $merge: { a: 1 } } })).toThrow(TypeError)
  expect(() => update({ a: null }, { a: { b: { $set: 1 } } })).toThrow(TypeError)
})
