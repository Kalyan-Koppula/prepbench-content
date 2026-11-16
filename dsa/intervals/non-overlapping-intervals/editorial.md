**Key insight:** minimising removals = maximising the intervals you keep, which is classic activity selection: sort by **end** and greedily keep every interval that starts at or after the last kept end.

## Approach

1. Sort by end time.
2. Walk the list with `lastEnd = -∞`. If `start >= lastEnd`, keep it and set `lastEnd = end`; otherwise it would overlap, so it's removed.
3. Answer is `n - kept`.

**Why earliest end is safe (exchange argument):** take any optimal set and swap its first interval for the earliest-ending interval overall. It ends no later, so it can't conflict with anything the original first interval didn't. Repeat on the rest.

## Complexity

- Time `O(n log n)` for the sort; the greedy pass is `O(n)`.
- Space `O(n)` for the sorted copy (`O(1)` extra if sorting in place).

## Alternatives to mention

- Sort by start and, on overlap, drop the one with the larger end (keep `lastEnd = min(lastEnd, end)`) — equivalent greedy.
- DP like longest increasing subsequence: `O(n²)`.

## Pitfalls

- Sorting by start and keeping the first of each overlap — fails on `[[1, 100], [2, 3], [4, 5]]`.
- Treating touching intervals as overlapping; here `[1, 2]` and `[2, 3]` are compatible (`>=`, not `>`).
