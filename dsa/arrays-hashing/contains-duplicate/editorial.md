**Key insight:** a value is a duplicate exactly when it's already in the set of values seen so far — one pass with a hash set, returning early on the first hit.

## Approach

1. Keep a `Set` of values visited.
2. For each `x`: if the set already has `x`, return `true`; otherwise add it.
3. If the loop finishes, every value was new — return `false`.

The one-liner `new Set(nums).size !== nums.length` is equivalent but always processes the whole array; the loop can stop early.

## Complexity

- Time `O(n)` — one pass, O(1) average set operations.
- Space `O(n)` — the set in the worst case (no duplicates).

## Alternatives to mention

- Compare every pair: `O(n²)` time, `O(1)` space.
- Sort, then check neighbours: `O(n log n)` time, `O(1)` extra if sorting in place is allowed — mention that it mutates the input.
