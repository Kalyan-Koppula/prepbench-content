**Key insight:** a one-slot cache needs no keys at all. Keep `{ this, args, result }` from the last call and compare the incoming call against it; a single slot means memory never grows.

## Approach

1. Closure state: `last` (undefined until the first successful call).
2. On a call, it's a hit if `last` exists, `last.ctx === this`, and the arguments are equal (custom `isEqual(args, last.args)` or the default comparison).
3. Default comparison: lengths match, and each position is `===` or both are `NaN` (`x !== x` is true only for `NaN`).
4. On a miss, call `fn.apply(this, args)`; only after it returns, store the new `last`.
5. `clear()` sets `last` back to undefined.

## Walkthrough

`const total = memoizeOne((items, tax) => sum(items) * (1 + tax))`:

| Call | Same `this` and arguments as last? | Action |
| --- | --- | --- |
| `total(cart, 0.2)` | no previous call | compute, remember args and result |
| `total(cart, 0.2)` | yes (same references) | return remembered result |
| `total(cart, 0.1)` | no (`tax` differs) | compute, replace the memory |
| `total(cart, 0.2)` | no (last call was 0.1) | compute again |
| `total(NaN, 0.2)` then `total(NaN, 0.2)` | yes: `NaN` counts as equal to `NaN` | cached |

Only the **most recent** call is remembered, which is exactly what UI code needs (recomputing derived data when inputs change) without unbounded memory.

## Complexity

`O(n)` per call for `n` arguments to compare; `O(1)` memory.

## Edge cases to test

- Same arguments twice: one computation.
- A different argument count invalidates.
- `NaN` arguments are treated as equal.
- A custom `isEqual` (for example deep equality).
- A different `this` invalidates.
- `clear()` forces recomputation.

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

## In the interview

Contrast with `memoize` (a cache of all inputs) and point out the use case: selectors and React render helpers where inputs change over time and only the latest result matters.
