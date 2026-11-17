**Key insight:** two layers of the same check. First compare the call's **arguments** with the previous call; if they differ, run the cheap input selectors and compare **their results**. Only when those differ do you pay for the expensive result function.

## Approach

1. Pop `resultFn` off the arguments; the rest (or the single array) are the input selectors.
2. Keep `lastArgs`, `lastInputs`, `lastResult` and a counter in the closure.
3. On each call: if `sameList(lastArgs, args)`, return `lastResult`. Otherwise store the args, map the input selectors over them, and if `sameList(lastInputs, values)` return `lastResult`. Otherwise store the values, increment the counter and recompute.
4. `sameList` checks length and `Object.is` per index.

## Pitfalls

- Comparing the **state** object instead of the input results: any unrelated change (`clicks`) causes a recompute, which defeats the purpose.
- Deep-comparing inputs: slower than recomputing, and wrong for code that relies on new references signalling change.
- `===` instead of `Object.is` recomputes forever when an input is `NaN`.
- Calling input selectors with only `state`, so selectors with props (`(state, id) => id`) get `undefined`.
- Input selectors that return a new array every time (`s => s.todos.filter(...)`) make memoisation useless; that work belongs in the result function.

## Follow-ups interviewers add

- **Cache size > 1** (an LRU of argument lists), or a per-component selector factory for list items with different `id`s.
- **`weakMapMemoize`:** cache by argument identity in nested `WeakMap`s so many entries can live without leaking.
- **Why does `useSelector` care?** It reruns on every store update and rerenders if the result isn't `===` to the last one.
- **TypeScript:** infer `resultFn`'s parameter types from the input selectors' return types.
