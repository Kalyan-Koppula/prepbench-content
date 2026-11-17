---
title: Create Selector
difficulty: Medium
order: 10
tags: [memoization, closures, redux, performance]
frequency: medium
exports: [createSelector]
hints:
  - The last argument is the result function; everything before it (or the single array before it) are input selectors.
  - Remember the last arguments, the last input results and the last output in the closure.
  - Compare element by element with `Object.is`; a different length counts as a change.
---

Implement `createSelector`, the memoised selector helper from Reselect / Redux Toolkit. Derived data (filtered lists, totals) gets recomputed only when the pieces it is built from actually change, so components that compare with `===` don't rerender for nothing.

```js
const selectTodos = (state) => state.todos
const selectFilter = (state) => state.filter

const selectVisible = createSelector(selectTodos, selectFilter, (todos, filter) =>
  todos.filter((t) => filter === 'all' || t.status === filter),
)

const a = selectVisible(state)
const b = selectVisible({ ...state, unrelated: 1 }) // todos and filter unchanged
a === b                          // true: result function not called again
selectVisible.recomputations()   // 1
```

## Notes

- `createSelector(...inputSelectors, resultFn)` or `createSelector([...inputSelectors], resultFn)`.
- Calling the selector with any arguments (`selector(state, props, ...)`):
  1. If the arguments are the same as the previous call (same count, each `Object.is`-equal), return the cached result without running anything.
  2. Otherwise run every input selector with **all** the arguments.
  3. If every input result is `Object.is`-equal to the previous call's, return the cached result.
  4. Otherwise call `resultFn(...inputResults)`, cache and return it.
- The cache holds one entry (the most recent call).
- `selector.recomputations()` returns how many times `resultFn` ran; `selector.resetRecomputations()` sets it back to 0.
- Selectors made with `createSelector` can be input selectors of other selectors.
