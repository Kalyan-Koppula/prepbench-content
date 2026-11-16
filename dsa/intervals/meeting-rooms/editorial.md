**Key insight:** once meetings are sorted by start time, a clash must show up between some pair of **adjacent** meetings — so one pass comparing each start to the previous end is enough.

## Approach

1. Sort by start time.
2. For each meeting after the first, if it starts before the previous one ends (`start < prevEnd`), return `false`.
3. Otherwise return `true`.

Why neighbours suffice: if meeting `k` clashes with some earlier meeting `j < k - 1`, then `start[j] <= start[k-1] <= start[k] < end[j]`, so `j` already clashes with `k - 1`. Repeating the argument, some adjacent pair must clash.

## Complexity

- Time `O(n log n)` for the sort; the scan is `O(n)`.
- Space `O(n)` here because we copy before sorting; `O(1)` extra if sorting in place is allowed.

## Alternatives to mention

- Compare every pair: `O(n²)`.

## Pitfalls

- Using `<=`: back-to-back meetings (`[1, 5]`, `[5, 8]`) are fine.
- Empty input is trivially `true`.
