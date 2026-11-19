**Key idea:** removing the fewest intervals is the same as **keeping the most** non-overlapping ones. Sort by **end** time and keep every interval that starts at or after the end of the last kept one. Choosing the interval that ends earliest always leaves the most room for the rest. The answer is the total minus the number kept.

## Recognising the pattern

This is interval scheduling, the classic greedy covered in both the [Intervals](/problems/patterns/intervals) and [Greedy](/problems/patterns/greedy) sheets. The sort key is the whole trick: by end time, not start time.

## Alternative: DP like LIS (shown below)

Sort by start; `most[i]` = the largest set of compatible intervals whose last interval is `i`, computed from every earlier `j` that ends by the time `i` starts. That is the reference brute force below. `O(n²)`, the same structure as [Longest Increasing Subsequence](/problems/longest-increasing-subsequence).

## Earliest end first

1. Sort a copy by end.
2. `kept = 0`, `lastEnd = −∞`.
3. For each interval: if `start ≥ lastEnd`, keep it: `kept++`, `lastEnd = end`.
4. Return `n − kept`.

**Why earliest end is safe (exchange argument).** Take any optimal set of kept intervals. Its first interval ends no earlier than the greedy's first choice, which has the earliest end of all. Swap it for the greedy choice: nothing else in the set overlaps it, because the greedy choice ends even earlier. Repeat for each position.

**Why not by start.** A long interval that starts first would be kept and would block many short ones. Sorting by end avoids that.

## Walkthrough

`intervals = [[1, 4], [2, 3], [3, 6], [5, 7]]`, sorted by end: `[2, 3], [1, 4], [3, 6], [5, 7]`.

| interval | lastEnd | start ≥ lastEnd? | kept |
| --- | --- | --- | --- |
| [2, 3] | −∞ | yes | 1 (lastEnd 3) |
| [1, 4] | 3 | no | 1 |
| [3, 6] | 3 | yes | 2 (lastEnd 6) |
| [5, 7] | 6 | no | 2 |

Answer `4 − 2 = 2`.

## Complexity

- DP: `O(n²)` time, `O(n)` space.
- Greedy: `O(n log n)` for the sort, then `O(n)`.

## Edge cases

- Touching intervals (`[1, 2]` and `[2, 3]`) don't overlap: 0 removals.
- Identical intervals: keep one, remove the rest.
- Already disjoint: 0.

## Common mistakes

- Sorting by start and keeping the first of each overlapping pair.
- Using `>` instead of `≥`, which treats touching intervals as overlapping.
- Counting removals directly with complicated rules instead of counting what is kept.

## In the interview

- Rephrase as "keep the most" and state the earliest-end rule with its exchange argument.
- Likely follow-ups:
  - *Minimum Number of Arrows to Burst Balloons?* The same greedy; touching counts as overlapping there.
  - *Weighted intervals?* Greedy fails; sort by end and use DP with binary search for the last compatible interval.
