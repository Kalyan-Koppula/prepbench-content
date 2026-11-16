**Key insight:** both lists are sorted and internally disjoint, so a two-pointer merge works: intersect the current pair, then discard whichever range ends first — nothing later in the other list can touch it.

## Approach

1. Pointers `i` and `j` at the start of each list.
2. Intersection candidate: `lo = max(starts)`, `hi = min(ends)`. If `lo <= hi`, record `[lo, hi]`.
3. Advance the pointer whose range has the smaller end (either one on a tie).
4. Stop when either list runs out.

Output is automatically sorted and disjoint, because each list is.

## Complexity

- Time `O(m + n)` — each step advances one pointer.
- Space `O(m + n)` for the output in the worst case; `O(1)` extra otherwise.

## Alternatives to mention

- Compare every pair and sort the results — `O(m · n)`.
- Event sweep over all endpoints, counting how many lists are "open" — general but heavier.

## Pitfalls

- Advancing both pointers after an intersection — the longer range may still overlap the next range in the other list.
- Using `<` for the non-empty test: touching ranges produce a single-point intersection like `[5, 5]`.
- Either list may be empty.
