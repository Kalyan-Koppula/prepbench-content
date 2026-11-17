---
title: Memoize one (last call only)
difficulty: Medium
order: 7
tags: [closures, caching, this]
frequency: low
exports: [memoizeOne]
hints:
  - Store three things from the last successful call — its `this`, its arguments array and its result.
  - "A hit needs the same `this` *and* equal arguments. Write the default comparison yourself: same length, then `===` per position with a special case for `NaN`."
  - Only overwrite the stored call after `fn` returns, so a throw leaves the previous entry intact.
---

Implement `memoizeOne(fn, isEqual?)`. Unlike a full memoizer, it remembers **only the most recent call**. This is the cache behind many "recompute derived data only when the inputs change" helpers in UI code.

When the memoized function is called:

- If there is a remembered call, `this` is the same object, and the arguments are equal to the remembered ones, return the remembered result without calling `fn`.
- Otherwise call `fn` with this call's `this` and arguments, remember the call and its result, and return it.

**Default equality:** same number of arguments and each pair is `===`, except that `NaN` equals `NaN`.
**Custom equality:** `isEqual(newArgs, lastArgs)` receives the two argument arrays and returns a boolean. It is only consulted when there is a remembered call.

The memoized function also has `clear()`, which forgets the remembered call.

```js
const visible = memoizeOne((todos, filter) => todos.filter((t) => t.status === filter))
visible(todos, 'done') // computes
visible(todos, 'done') // cached
visible(todos, 'open') // computes; 'done' is forgotten
visible(todos, 'done') // computes again
```

## Notes

- Arguments are compared by reference: a new array with the same items is a different argument.
- `(1)` and `(1, undefined)` are different calls (the lengths differ).
- If `fn` throws, the error propagates and the previously remembered call stays.
- `undefined` results are cached like any other.
