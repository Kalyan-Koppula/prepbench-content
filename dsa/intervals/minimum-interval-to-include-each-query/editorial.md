**Key insight:** answer the queries **offline** in sorted order. As the query value grows, intervals become eligible in order of their left edge and expire by their right edge — a min-heap by size, with lazy removal of expired intervals, gives each answer in `O(log n)`.

## Approach

1. Sort intervals by `left`. Sort query **indices** by query value (keep indices to write answers back).
2. For each query `q` in increasing order:
   - Push every interval with `left <= q` onto a min-heap as `[size, right]`.
   - Pop from the top while `right < q` — it can't contain this query or any larger one.
   - The top (if any) is the smallest interval containing `q`.
3. Return answers in the original query order.

Lazy deletion is what keeps it simple: an expired interval buried in the heap is harmless until it reaches the top, and then it's popped for good.

`PriorityQueue` is provided here; be ready to explain how a binary heap works if asked to implement one.

## Complexity

- Time `O(n log n + q log q)` — two sorts, and each interval is pushed and popped at most once.
- Space `O(n + q)` for the heap, the sorted copies and the answers.

## Alternatives to mention

- Brute force: scan all intervals per query — `O(n · q)`, too slow at `10^5 × 10^5`.
- Sort intervals by size and assign each one to all still-unanswered queries inside it, using a sorted set / union-find "next unanswered query" structure — also `O((n + q) log)`.

## Pitfalls

- Answering in sorted order and returning that order — map results back to original indices.
- Duplicate query values: each needs its own answer slot.
- Size is `right - left + 1` (closed range), not `right - left`.
