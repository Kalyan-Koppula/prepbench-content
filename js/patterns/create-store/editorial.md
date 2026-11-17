**Key insight:** a store is a closure over three variables (`state`, `listeners`, `isDispatching`) plus the rule that only a reducer ever produces the next state. Most of the interview is about the edges: init, purity, and listeners changing mid-dispatch.

## Approach

1. Start with `state = preloadedState` and immediately dispatch a private init action with a random type. The reducer's default parameter then fills in the state.
2. `dispatch`: validate the action, refuse if already dispatching, run the reducer inside `try/finally` so the flag is always reset, notify listeners, return the action.
3. `subscribe`: replace the `listeners` array with a new one (copy-on-write) on every subscribe and unsubscribe. `dispatch` iterates whatever array it grabbed at the start, so mid-dispatch changes only show up next time. A `subscribed` flag makes unsubscribe idempotent.
4. `combineReducers`: run each slice reducer on `state[key]`, collect the results, and return the old state object if no slice changed.

## Pitfalls

- Not dispatching an init action: `getState()` is `undefined` until the first real dispatch.
- Forgetting `finally`: one throwing reducer leaves `isDispatching = true` and the store is dead.
- Iterating the live listener array: a listener that unsubscribes another one makes the loop skip someone.
- `combineReducers` always returning a fresh object breaks every `===`-based optimisation (`useSelector`, `connect`, memoised selectors).

## Follow-ups interviewers add

- **`applyMiddleware(...middlewares)`** with the `store => next => action` signature, and a thunk middleware.
- **`replaceReducer`** for code-splitting.
- **`useSelector` hook:** subscribe in `useSyncExternalStore` and re-render only when the selected value changes.
- **Why are reducers pure?** Time-travel debugging, replay, and predictable tests.
