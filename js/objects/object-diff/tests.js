const sorted = (d) => ({ added: [...d.added].sort(), removed: [...d.removed].sort(), changed: [...d.changed].sort() })
const none = { added: [], removed: [], changed: [] }

test('reports nothing for structurally equal objects', () => {
  const before = { user: { name: 'Ada', tags: ['x'] }, n: 1 }
  const after = { n: 1, user: { tags: ['x'], name: 'Ada' } }
  expect(sorted(diff(before, after))).toEqual(none)
})

test('reports a changed top-level value', () => {
  expect(sorted(diff({ a: 1, b: 2 }, { a: 1, b: 3 }))).toEqual({ ...none, changed: ['b'] })
})

test('reports nested changes with dot paths', () => {
  const before = { user: { address: { city: 'London', zip: 'N1' } } }
  const after = { user: { address: { city: 'Paris', zip: 'N1' } } }
  expect(sorted(diff(before, after))).toEqual({ ...none, changed: ['user.address.city'] })
})

test('reports added and removed keys at any depth', () => {
  const before = { a: 1, meta: { draft: true } }
  const after = { meta: { published: true }, b: 2 }
  expect(sorted(diff(before, after))).toEqual({ added: ['b', 'meta.published'], removed: ['a', 'meta.draft'], changed: [] })
})

test('reports a new or deleted object once, not its leaves', () => {
  const result = diff({ old: { x: 1, y: 2 } }, { fresh: { deep: { z: 3 } } })
  expect(sorted(result)).toEqual({ added: ['fresh'], removed: ['old'], changed: [] })
})

test('compares arrays item by item using the index in the path', () => {
  const result = diff({ tags: ['a', 'b', 'c'] }, { tags: ['a', 'x'] })
  expect(sorted(result)).toEqual({ added: [], removed: ['tags.2'], changed: ['tags.1'] })
  expect(sorted(diff({ list: [{ id: 1 }] }, { list: [{ id: 2 }, { id: 3 }] }))).toEqual({ added: ['list.1'], removed: [], changed: ['list.0.id'] })
})

test('reports a change of shape as a single change', () => {
  const result = diff({ a: { x: 1 }, b: [1], c: 'text' }, { a: [1], b: { 0: 1 }, c: { x: 1 } })
  expect(sorted(result)).toEqual({ ...none, changed: ['a', 'b', 'c'] })
})

test('treats a key set to undefined as present', () => {
  expect(sorted(diff({ a: undefined }, {}))).toEqual({ ...none, removed: ['a'] })
  expect(sorted(diff({}, { a: undefined }))).toEqual({ ...none, added: ['a'] })
  expect(sorted(diff({ a: undefined }, { a: null }))).toEqual({ ...none, changed: ['a'] })
})

test('compares leaves with Object.is', () => {
  expect(sorted(diff({ n: NaN }, { n: NaN }))).toEqual(none)
  const shared = new Map()
  expect(sorted(diff({ m: shared, d: new Map() }, { m: shared, d: new Map() }))).toEqual({ ...none, changed: ['d'] })
})

test('does not mutate its arguments', () => {
  const before = { a: { b: 1 } }
  const after = { a: { c: 2 } }
  diff(before, after)
  expect(before).toEqual({ a: { b: 1 } })
  expect(after).toEqual({ a: { c: 2 } })
})
