**Key idea:** put every value in a hash set. A value `x` is the **start** of a run exactly when `x - 1` is missing. From each start, count upward while `x + 1, x + 2, …` are present. Each value is visited at most twice, so the whole thing is `O(n)`.

## Recognising the pattern

The run doesn't have to be contiguous in the array, only in **value**, so window and pointer techniques don't apply. Sorting would line the values up, but the problem asks for `O(n)`, which rules out comparison sorts. What you need is fast "is `v` in the input?" questions, which is a hash set: the core tool of the [Arrays & Hashing](/problems/patterns/arrays-hashing) sheet.

## Brute force

For each value `x`, count how far `x + 1, x + 2, …` exist by scanning the array for each one. Time `O(n³)` in the worst case (`n` starts, runs of length up to `n`, a scan per step), or `O(n²)` with a set. Too slow for `10^5` values.

## Better: sort

Sort the values. Runs are now adjacent. Walk the sorted array: if a value equals the previous one plus 1, extend the run; if it equals the previous one, it is a duplicate and changes nothing; otherwise start a new run of length 1. Track the longest.

Time `O(n log n)`, space `O(n)` for a sorted copy. This is the reference brute force shown below, and it is a perfectly good first answer.

## Optimal: hash set, count only from run starts

With a set you can ask "is `x + 1` present?" in `O(1)`. The danger is counting the same run many times: starting at 1, 2, 3 and 4 of the run `1..4` would walk it four times, which is quadratic for one long run.

The fix: only start counting at values with no predecessor.

1. Add every value to a set `values`. Duplicates collapse.
2. For each `x` in the set:
   1. If `values` contains `x - 1`, skip it. `x` is inside some run, not at its start.
   2. Otherwise count `length = 1` and increase it while `x + length` is in the set.
   3. Update `best`.
3. Return `best`.

**Why is this linear?** The inner `while` only runs from starts, and each run is walked exactly once from its single start. So across the whole loop, every value is touched once by the outer loop and at most once by an inner walk: at most `2n` set lookups.

## Walkthrough

`nums = [100, 4, 200, 1, 3, 2]`, so `values = {100, 4, 200, 1, 3, 2}`.

| x | `x − 1` present? | action | length | best |
| --- | --- | --- | --- | --- |
| 100 | no (99) | walk: 101 missing | 1 | 1 |
| 4 | yes (3) | skip | – | 1 |
| 200 | no (199) | walk: 201 missing | 1 | 1 |
| 1 | no (0) | walk 2, 3, 4; 5 missing | 4 | 4 |
| 3 | yes | skip | – | 4 |
| 2 | yes | skip | – | 4 |

Answer `4`, for the run 1, 2, 3, 4.

## Complexity

- Brute force with a set: time `O(n²)`, space `O(n)`.
- Sort: time `O(n log n)`, space `O(n)` for the copy.
- Set with run starts: time `O(n)` on average, about `2n` lookups. Space `O(n)` for the set.

## Edge cases

- Empty array: return `0`.
- All values equal: the set has one element, so the answer is `1`.
- Duplicates inside a run, like `[1, 2, 2, 3]`: the set removes them, giving 3.
- Negative numbers and a run crossing zero, like `[-1, 0, 1]`: arithmetic works the same.
- Very large values far apart: each is its own run of length 1.

## Common mistakes

- Walking upward from **every** value instead of only from starts, which is `O(n²)` on one long run.
- Iterating over `nums` instead of the set, so duplicate starts walk the same run again.
- In the sorting version, treating a duplicate as a break and resetting the run to 1.
- Returning `1` for an empty array.

## In the interview

- Say the sort solution first, then: "To get linear time I need constant-time membership, so I'll use a set, and only count from values that start a run."
- Explain why it's linear. Interviewers often ask, because the nested `while` looks quadratic.
- Likely follow-ups:
  - *Return the run itself?* Remember the start of the best run and its length.
  - *Values arrive one at a time?* Union-find, or a map from each run's endpoints to its length, merging runs when a value joins two.
  - *Memory is tight?* Sort in place and scan, `O(1)` extra space but `O(n log n)` time.
