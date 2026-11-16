**Key insight:** after sorting by start, overlapping intervals are contiguous in the list. Sweep once, either extending the last merged interval or starting a new one.

## Approach

1. Sort intervals by start.
2. For each `[start, end]`: if `start <= last.end`, set `last.end = max(last.end, end)`; otherwise push a new interval.
3. The merged list is already sorted by start.

## Complexity

- Time `O(n log n)` — the sort dominates; the sweep is linear.
- Space `O(n)` for the output (and the sorted copy).

## Alternatives to mention

- Brute force: repeatedly find any overlapping pair and merge it until none remain — `O(n²)` or worse.
- If coordinates are small, a difference array / painting the axis works in `O(n + range)`.

## Pitfalls

- Forgetting `Math.max`: `[1, 10]` then `[2, 3]` must stay `[1, 10]`, not shrink to `[1, 3]`.
- Using `<` instead of `<=` — touching intervals overlap here.
- Default `sort()` compares as strings; pass `(a, b) => a[0] - b[0]`.
