---
title: Create Store (Redux)
difficulty: Medium
order: 7
tags: [closures, state, redux, reducers]
frequency: high
exports: [createStore, combineReducers]
hints:
  - Everything lives in the closure - the current state, the listener list and an "is dispatching" flag.
  - To get the reducer's default state, dispatch a private init action as the store is created.
  - In `combineReducers`, track whether any slice came back as a different reference.
---

Implement the core of Redux: `createStore` and `combineReducers`.

```js
const counter = (state = 0, action) => (action.type === 'inc' ? state + 1 : state)
const todos = (state = [], action) => (action.type === 'add' ? [...state, action.text] : state)

const store = createStore(combineReducers({ counter, todos }))
store.getState() // { counter: 0, todos: [] }

const unsubscribe = store.subscribe(() => console.log(store.getState()))
store.dispatch({ type: 'inc' })            // logs { counter: 1, todos: [] }
store.dispatch({ type: 'add', text: 'x' }) // logs { counter: 1, todos: ['x'] }
unsubscribe()
```

## Notes

**`createStore(reducer, preloadedState?)`** returns `{ getState, dispatch, subscribe }`.

- On creation, dispatch an internal action whose `type` no reducer will recognise, so the state becomes the reducer's default (or `preloadedState`, if given, which the reducer receives instead of `undefined`).
- `dispatch(action)` runs `state = reducer(state, action)`, then calls every listener, and returns `action`. Listeners run after every dispatch, even if the state didn't change.
- `dispatch` throws an `Error` if `action` is not a plain object or has no `type` (`type: undefined`), and if called while a reducer is running (reducers must be pure). The store must keep working after such an error.
- `subscribe(listener)` returns an `unsubscribe` function (safe to call twice). Subscribing or unsubscribing while listeners are being called takes effect from the **next** dispatch.

**`combineReducers(reducers)`** takes an object of slice reducers and returns one reducer that:

- calls each slice reducer with its own slice of the state and the action, and builds `{ [key]: sliceState }`;
- returns the **previous state object** if every slice came back unchanged (`Object.is`), and a new object otherwise. Unchanged slices keep their references either way.
