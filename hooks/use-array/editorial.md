**Key insight:** every helper is a pure function of the *previous* array passed to `setArray`. That one choice gives you immutability, correct batching and stable callbacks.

## Approach

`useState(initial)`, then each helper is a `useCallback(..., [])` that calls `setArray(prev => ...)`: spread for `push`, `filter` by index for `remove`, `map` for `update`, a fresh `[]` for `clear`. For an index outside `0..length-1`, return `prev` itself; React sees the same reference and skips the render.

## Pitfalls

- `array.push(x); setArray(array)`: mutates state, and because the reference didn't change React may not re-render at all.
- `setArray([...array, x])` reads the `array` captured when the handler was created, so two pushes in one click keep only the last.
- `prev.splice(index, 1)` mutates `prev` even inside an updater; Strict Mode calls updaters twice, so it removes two items.
- `remove(-1)` with `filter((_, i) => i !== index)` happens to be safe, but `slice`-based versions (`[...prev.slice(0, i), ...prev.slice(i + 1)]`) with `-1` duplicate or drop items.
- Listing `array` as a dependency makes every helper change identity on every update.

## Follow-ups

- Add `insertAt(index, item)`, `move(from, to)` and `filter(predicate)`.
- Why are index keys (`key={i}`) a problem for this list, and what would you use instead?
- Implement it with `useReducer` and discuss when that's clearer.
