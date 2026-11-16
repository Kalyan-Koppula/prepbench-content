**Key insight (Dutch national flag):** maintain three regions with pointers `low`, `mid`, `high`: `[0, low)` is all `0`, `[low, mid)` all `1`, `(high, n)` all `2`, and `[mid, high]` still unknown. Classify `nums[mid]` and shrink the unknown region.

## Approach

While `mid <= high`:

- `nums[mid] === 0` → swap with `nums[low]`, then `low++`, `mid++` (the swapped-in value was a `1`, already classified).
- `nums[mid] === 1` → `mid++`.
- `nums[mid] === 2` → swap with `nums[high]`, then `high--` only. The value swapped in from the back hasn't been examined yet, so `mid` stays.

## Complexity

- Time `O(n)` — every step either advances `mid` or retreats `high`.
- Space `O(1)`.

## Alternatives to mention

- Counting sort: count `0`s, `1`s and `2`s, then overwrite — two passes, also `O(1)` space. Simple and correct; the follow-up asks for one pass.
- A general sort is `O(n log n)` and misses the point.

## Pitfalls

- Advancing `mid` after swapping with `high` skips an unexamined element.
- Loop condition is `mid <= high` (inclusive) — `high` itself is still unknown.
