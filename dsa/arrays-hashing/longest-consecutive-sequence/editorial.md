**Key insight:** in a set, a value `x` is the *start* of a run exactly when `x - 1` is missing. Only extend runs from starts, so every value is visited a constant number of times.

## Approach

1. Put all values in a `Set` (this also removes duplicates).
2. For each `x` in the set: if `x - 1` is in the set, skip — `x` is in the middle of someone else's run.
3. Otherwise walk `x + 1, x + 2, …` while present, counting the length; track the maximum.

## Complexity

- Time `O(n)` — the inner `while` only runs from run starts, so across all starts it touches each value once.
- Space `O(n)` — the set.

## Alternatives to mention

- Sort, then scan counting consecutive steps (skip equal neighbours): `O(n log n)` time, `O(1)` extra if sorting in place. Often perfectly acceptable — say it first if you like, then improve.
- Union-find over adjacent values — works, but heavier than needed.

## Pitfalls

- Iterate over the **set**, not the original array: with many duplicates of a run start, iterating the array re-walks the run each time and can go quadratic.
- Empty input returns `0`.
- Duplicates must not extend a run (`[1, 1, 2]` has length 2).
