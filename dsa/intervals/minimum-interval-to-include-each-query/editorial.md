**Key idea:** answer the queries **offline**, in increasing order. Sort intervals by left edge. For each query, add every interval that starts at or before it to a min-heap keyed by size. Then pop intervals from the top while they end before the query. Those can never cover any later query either, since later queries are larger. Whatever is left on top is the smallest interval covering this query.

## Recognising the pattern

Many queries against many intervals, where the order of answering doesn't matter, is the offline sweep from the [Intervals](/problems/patterns/intervals) sheet: sort both, move a pointer through the intervals as the queries increase, and keep the "active" intervals in a [Heap](/problems/patterns/heap) ordered by what you want to minimise.

## Brute force

For each query, scan every interval and keep the smallest one that contains it. That is the reference brute force below. `O(n · q)` time, too slow for `10^5` of each.

## Offline sweep with a heap

1. Sort intervals by left edge. Sort query indices by query value (keep the indices to put answers back in place).
2. For each query `q` in increasing order:
   1. Push every interval with `left ≤ q` as `[size, right]`.
   2. Pop while the top's `right < q`.
   3. The top's size is the answer, or −1 if the heap is empty.

**Why popping is permanent.** An interval with `right < q` can't contain `q` or any larger query. Removing it lazily, only when it reaches the top, is enough: intervals deeper in the heap that have expired don't affect the current answer until they surface.

**Why only the top needs checking.** Every interval in the heap starts at or before `q`. Once expired intervals at the top are gone, the top contains `q` and is the smallest such interval.

## Walkthrough

`intervals = [[1, 4], [2, 3], [5, 8], [6, 6]]`, `queries = [3, 6, 9, 1]`. Queries in order: 1, 3, 6, 9.

| query | pushed (size, right) | popped | top | answer |
| --- | --- | --- | --- | --- |
| 1 | (4, 4) | – | (4, 4) | 4 |
| 3 | (2, 3) | – | (2, 3) | 2 |
| 6 | (4, 8), (1, 6) | – | (1, 6) | 1 |
| 9 | – | (1, 6), (2, 3), (4, 4), (4, 8) | empty | −1 |

Placed back in the original order: `[2, 1, −1, 4]`.

## Complexity

- Scan per query: `O(n · q)`.
- Offline sweep: `O(n log n + q log q)` for the sorts, plus `O(n log n)` heap work. Space `O(n + q)`.

## Edge cases

- A query outside every interval: −1.
- Several intervals of the same size: any of them gives the same answer.
- Duplicate queries: each gets its own answer; the sweep handles them naturally.

## Common mistakes

- Answering in the original query order, which breaks the "expired forever" argument.
- Forgetting to remember each query's original index.
- Checking `right ≤ q` for expiry; an interval ending exactly at `q` still contains it.

## In the interview

- Say "offline" early: sorting the queries is allowed because only the answers' positions matter.
- Likely follow-ups:
  - *Queries must be answered online?* A segment tree over compressed coordinates storing the minimum size per point range.
  - *Count intervals covering each query instead?* Sort starts and ends and binary search: starts `≤ q` minus ends `< q`.
