const counter = (state = 0, action) => {
  if (action.type === 'inc') return state + (action.by ?? 1)
  if (action.type === 'reset') return 0
  return state
}
const todos = (state = [], action) => (action.type === 'add' ? [...state, action.text] : state)

test('starts from the reducer default state', () => {
  expect(createStore(counter).getState()).toBe(0)
})

test('preloaded state wins over the default', () => {
  expect(createStore(counter, 41).getState()).toBe(41)
})

test('dispatch runs the reducer and returns the action', () => {
  const store = createStore(counter)
  const action = { type: 'inc', by: 5 }
  expect(store.dispatch(action)).toBe(action)
  store.dispatch({ type: 'inc' })
  expect(store.getState()).toBe(6)
})

test('listeners run after every dispatch and see the new state', () => {
  const store = createStore(counter)
  const seen = []
  store.subscribe(() => seen.push(store.getState()))
  store.dispatch({ type: 'inc' })
  store.dispatch({ type: 'unknown' })
  expect(seen).toEqual([1, 1])
})

test('unsubscribe stops a listener and is safe to call twice', () => {
  const store = createStore(counter)
  const a = fn()
  const b = fn()
  const stopA = store.subscribe(a)
  store.subscribe(b)
  stopA()
  stopA()
  store.dispatch({ type: 'inc' })
  expect(a).not.toHaveBeenCalled()
  expect(b).toHaveBeenCalledTimes(1)
})

test('subscription changes during a dispatch apply from the next dispatch', () => {
  const store = createStore(counter)
  const late = fn()
  const victim = fn()
  let stopVictim
  store.subscribe(() => {
    store.subscribe(late)
    stopVictim()
  })
  stopVictim = store.subscribe(victim)
  store.dispatch({ type: 'inc' })
  expect(late).not.toHaveBeenCalled()
  expect(victim).toHaveBeenCalledTimes(1)
  store.dispatch({ type: 'inc' })
  expect(late).toHaveBeenCalled()
  expect(victim).toHaveBeenCalledTimes(1)
})

test('rejects actions that are not plain objects with a type', () => {
  const store = createStore(counter)
  expect(() => store.dispatch('inc')).toThrow(Error)
  expect(() => store.dispatch({ by: 1 })).toThrow(Error)
  expect(() => store.dispatch(null)).toThrow(Error)
  expect(store.getState()).toBe(0)
})

test('a reducer cannot dispatch, and the store keeps working afterwards', () => {
  let store
  const sneaky = (state = 0, action) => {
    if (action.type === 'sneaky') store.dispatch({ type: 'other' })
    return action.type === 'inc' ? state + 1 : state
  }
  store = createStore(sneaky)
  expect(() => store.dispatch({ type: 'sneaky' })).toThrow(Error)
  store.dispatch({ type: 'inc' })
  expect(store.getState()).toBe(1)
})

test('combineReducers builds state from slice defaults', () => {
  const store = createStore(combineReducers({ counter, todos }))
  expect(store.getState()).toEqual({ counter: 0, todos: [] })
  store.dispatch({ type: 'add', text: 'write tests' })
  store.dispatch({ type: 'inc' })
  expect(store.getState()).toEqual({ counter: 1, todos: ['write tests'] })
})

test('combineReducers passes each reducer only its slice', () => {
  const slice = fn((state = 'init') => state)
  const root = combineReducers({ slice })
  root({ slice: 'mine', other: 'x' }, { type: 'ping' })
  expect(slice).toHaveBeenLastCalledWith('mine', { type: 'ping' })
})

test('combineReducers keeps references when nothing changes', () => {
  const root = combineReducers({ counter, todos })
  const state = root(undefined, { type: '@@init' })
  expect(root(state, { type: 'nothing' })).toBe(state)
  const next = root(state, { type: 'inc' })
  expect(next).not.toBe(state)
  expect(next.counter).toBe(1)
  expect(next.todos).toBe(state.todos)
})
