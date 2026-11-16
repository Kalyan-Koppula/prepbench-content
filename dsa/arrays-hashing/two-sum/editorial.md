**Key insight:** for each `x`, the partner is fixed: `target - x`. A hash map of values seen so far answers "is the partner behind me?" in O(1).

## Approach

1. Walk the array once, keeping `value -> index` for everything already visited.
2. At index `i`, look up `target - nums[i]`. If present, return both indices.
3. Otherwise record `nums[i]` and continue.

Checking *before* inserting guarantees the two indices differ, even when `target = 2 * nums[i]`.

## Complexity

- Time `O(n)` — one pass, O(1) map operations.
- Space `O(n)` — the map.

## Alternatives to mention

- Brute force over all pairs: `O(n²)` time, `O(1)` space.
- Sort + two pointers: `O(n log n)`, but you must carry original indices through the sort.
