**Key insight:** iterate the first array (that gives you the order), and answer "is it in the others?" with `Set` lookups instead of nested `includes` scans.

## Approach

- **intersection:** build one `Set` per remaining array. Walk the first array, keeping a value if every set has it and you haven't emitted it yet (a second `Set` tracks that).
- **difference:** pour every value from the other arrays into one `Set`, then `filter` the first array by `!excluded.has(value)`.

Both are O(total items).

## Pitfalls

- `indexOf` / `===` miss `NaN`; `includes` and `Set` find it.
- `first.filter(x => rest.every(a => a.includes(x)))` is correct but O(n·m), and forgets to dedupe.
- Sorting to intersect loses the first array's order.
- Returning the input itself in the one-array / no-others cases lets the caller mutate it by accident.

## Follow-ups interviewers add

- **`union(...arrays)`** and **`symmetricDifference(a, b)`**.
- **`intersectionBy` / `differenceBy`** with a key function, e.g. comparing records by `id`.
- **Sorted inputs:** a two-pointer merge in O(n + m) with O(1) extra memory.
- **The newer built-ins:** `Set.prototype.intersection` and `difference` exist in recent engines. What do they return, and in what order?
