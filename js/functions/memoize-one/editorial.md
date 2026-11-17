**Key insight:** a one-slot cache needs no keys at all. Keep `{ this, args, result }` from the last call and compare the incoming call against it; a single slot means memory never grows.

## Approach

1. Closure state: `last` (undefined until the first successful call).
2. On a call, it's a hit if `last` exists, `last.ctx === this`, and the arguments are equal (custom `isEqual(args, last.args)` or the default comparison).
3. Default comparison: lengths match, and each position is `===` or both are `NaN` (`x !== x` is true only for `NaN`).
4. On a miss, call `fn.apply(this, args)`; only after it returns, store the new `last`.
5. `clear()` sets `last` back to undefined.

## Pitfalls

- `JSON.stringify(args)` comparisons: slow, lossy (`undefined`, functions) and wrong for UI code, where a new object reference *should* trigger recomputation.
- Forgetting the length check: `(1)` and `(1, undefined)` look equal when you only loop over one array.
- Ignoring `this`: two component instances sharing one memoized method would read each other's results.
- Writing `last` before calling `fn`: a throw leaves a half-built entry or wipes the good one.
- Using a `result !== undefined` check as "have I cached?".

## Follow-ups interviewers add

- **Selectors:** build `createSelector(inputSelectors, combiner)` (Reselect) on top of `memoizeOne`.
- **Shallow equality:** write an `isEqual` that compares objects one level deep, and discuss when it is worth the cost.
- **Cache size N:** generalize to the last N calls (a tiny LRU).
- **React:** how `useMemo` differs (per component instance, deps array compared with `Object.is`).
