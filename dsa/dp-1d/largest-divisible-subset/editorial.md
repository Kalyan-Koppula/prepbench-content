**Key insight:** once sorted, a pairwise-divisible set is exactly a chain where each element divides the next (divisibility is transitive) — so this is Longest Increasing Subsequence with `%` as the comparison, plus parent pointers to rebuild it.

## Approach

1. Sort ascending. Now for `j < i`, only `a[j]` can divide `a[i]`.
2. **State:** `len[i]` = size of the largest valid chain whose largest element is `a[i]`.
3. **Recurrence:** `len[i] = 1 + max(len[j])` over `j < i` with `a[i] % a[j] === 0`; record that `j` in `parent[i]`.
4. **Base case:** `len[i] = 1`, `parent[i] = -1` (the element alone).
5. **Order:** `i` left to right, `j < i`. Track the index with the largest `len`.
6. Walk `parent` from that index to rebuild the chain.

Why a chain is enough: if `a | b` and `b | c` then `a | c`, so checking neighbours in sorted order certifies every pair.

Progression: the brute force tries every subset (`O(2ⁿ · n²)`) or every chain by DFS; memoising "best chain ending at `i`" turns it into the `O(n²)` table. Unlike plain LIS, there's no `O(n log n)` trick because divisibility isn't a total order.

## Complexity

- Time `O(n²)` — the double loop dominates the sort.
- Space `O(n)` for `len` and `parent`.

## Pitfalls

- Skipping the sort: without it, `a[j] | a[i]` for `j < i` doesn't capture all chains.
- Returning only the length — the problem wants the elements; store parents as you go rather than re-deriving them.
- With `n = 1` the answer is the single element.
