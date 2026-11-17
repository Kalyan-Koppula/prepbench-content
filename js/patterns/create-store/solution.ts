type Action = { type: unknown; [key: string]: unknown }
type Reducer<S> = (state: S | undefined, action: Action) => S

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

function createStore<S>(reducer: Reducer<S>, preloadedState?: S) {
  let state = preloadedState as S
  let listeners: (() => void)[] = []
  let isDispatching = false

  const getState = () => state

  const dispatch = (action: Action): Action => {
    if (!isPlainObject(action)) throw new Error('Actions must be plain objects')
    if (action.type === undefined) throw new Error('Actions must have a type')
    if (isDispatching) throw new Error('Reducers may not dispatch actions')
    try {
      isDispatching = true
      state = reducer(state, action)
    } finally {
      isDispatching = false
    }
    // Copy-on-write in subscribe/unsubscribe means this array never changes under us.
    for (const listener of listeners) listener()
    return action
  }

  const subscribe = (listener: () => void) => {
    listeners = [...listeners, listener]
    let subscribed = true
    return () => {
      if (!subscribed) return
      subscribed = false
      const i = listeners.indexOf(listener)
      listeners = [...listeners.slice(0, i), ...listeners.slice(i + 1)]
    }
  }

  dispatch({ type: `@@store/INIT${Math.random().toString(36).slice(2)}` })
  return { getState, dispatch, subscribe }
}

function combineReducers(reducers: Record<string, Reducer<any>>): Reducer<Record<string, any>> {
  const keys = Object.keys(reducers)
  return (state = {}, action) => {
    let changed = false
    const next: Record<string, any> = {}
    for (const key of keys) {
      next[key] = reducers[key](state[key], action)
      if (!Object.is(next[key], state[key])) changed = true
    }
    if (Object.keys(state).length !== keys.length) changed = true
    return changed ? next : state
  }
}
