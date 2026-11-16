**Key insight:** the input is sorted and disjoint, so the ranges fall into three consecutive groups — strictly left of the new interval, overlapping it, strictly right of it. One linear pass handles all three.

## Approach

1. Copy ranges with `end < newStart` — they finish before the new interval begins.
2. While a range has `start <= newEnd`, it overlaps: widen `[newStart, newEnd]` to `[min(starts), max(ends)]` and skip it.
3. Push the widened interval, then copy the remaining ranges.

## Complexity

- Time `O(n)` — one pass, no sort.
- Space `O(n)` for the output.

## Alternatives to mention

- Append and rerun Merge Intervals: `O(n log n)` — correct, but ignores that the input is sorted. Interviewers want the linear version.
- Binary search for the first and last overlapping ranges finds the splice points in `O(log n)`, but building the new array is still `O(n)`.

## Pitfalls

- Empty `intervals` — the answer is just `[newInterval]`.
- Using `<=` in step 1 or `<` in step 2 — closed ranges that touch must merge.
- Forgetting the `min` on the start: the first overlapping range may start before `newInterval`.
