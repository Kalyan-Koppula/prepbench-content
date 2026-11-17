const makeState = () => ({
  todos: [
    { id: 1, text: 'write', done: true },
    { id: 2, text: 'test', done: false },
  ],
  filter: 'open',
  clicks: 0,
})
const selectTodos = (s) => s.todos
const selectFilter = (s) => s.filter
const visible = (todos, filter) => todos.filter((t) => (filter === 'open' ? !t.done : true))

test('computes the result from the input selectors', () => {
  const select = createSelector(selectTodos, selectFilter, visible)
  expect(select(makeState())).toEqual([{ id: 2, text: 'test', done: false }])
})

test('passes input results to the result function in order', () => {
  const result = fn(() => 'r')
  const select = createSelector((s) => s.a, (s) => s.b, (s) => s.c, result)
  select({ a: 1, b: 2, c: 3 })
  expect(result).toHaveBeenCalledWith(1, 2, 3)
})

test('returns the cached result when the inputs have not changed', () => {
  const select = createSelector(selectTodos, selectFilter, visible)
  const state = makeState()
  const first = select(state)
  const second = select({ ...state, clicks: 5 })
  expect(second).toBe(first)
  expect(select.recomputations()).toBe(1)
})

test('recomputes when an input changes', () => {
  const select = createSelector(selectTodos, selectFilter, visible)
  const state = makeState()
  const first = select(state)
  const second = select({ ...state, filter: 'all' })
  expect(second).not.toBe(first)
  expect(second).toHaveLength(2)
  expect(select.recomputations()).toBe(2)
})

test('skips the input selectors when called with the same arguments', () => {
  const input = fn((s) => s.todos)
  const select = createSelector(input, (todos) => todos.length)
  const state = makeState()
  select(state)
  select(state)
  select(state)
  expect(input).toHaveBeenCalledTimes(1)
})

test('passes every argument to the input selectors', () => {
  const selectById = createSelector(selectTodos, (state, id) => id, (todos, id) => todos.find((t) => t.id === id))
  const state = makeState()
  expect(selectById(state, 2).text).toBe('test')
  expect(selectById(state, 1).text).toBe('write')
  expect(selectById.recomputations()).toBe(2)
})

test('accepts the input selectors as an array', () => {
  const select = createSelector([selectTodos, selectFilter], (todos, filter) => `${todos.length}:${filter}`)
  expect(select(makeState())).toBe('2:open')
})

test('counts recomputations and can reset the counter', () => {
  const select = createSelector((s) => s.n, (n) => n * 2)
  select({ n: 1 })
  select({ n: 2 })
  select({ n: 2 })
  expect(select.recomputations()).toBe(2)
  select.resetRecomputations()
  expect(select.recomputations()).toBe(0)
  select({ n: 3 })
  expect(select.recomputations()).toBe(1)
})

test('remembers only the most recent inputs', () => {
  const select = createSelector((s) => s.n, (n) => ({ n }))
  select({ n: 1 })
  select({ n: 2 })
  select({ n: 1 })
  expect(select.recomputations()).toBe(3)
})

test('compares inputs with Object.is', () => {
  const select = createSelector((s) => s.v, (v) => [v])
  const a = select({ v: NaN })
  expect(select({ v: NaN })).toBe(a)
  select({ v: 0 })
  select({ v: -0 })
  expect(select.recomputations()).toBe(3)
})

test('selectors compose', () => {
  const selectOpen = createSelector(selectTodos, (todos) => todos.filter((t) => !t.done))
  const selectOpenCount = createSelector(selectOpen, (open) => open.length)
  const state = makeState()
  expect(selectOpenCount(state)).toBe(1)
  selectOpenCount({ ...state, clicks: 1 })
  expect(selectOpen.recomputations()).toBe(1)
  expect(selectOpenCount.recomputations()).toBe(1)
})
