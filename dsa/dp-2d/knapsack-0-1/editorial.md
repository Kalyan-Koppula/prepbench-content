**Key idea:** decide about the items one at a time. Let `best[i][w]` be the most value you can carry using only the first `i` items with total weight at most `w`. For item `i`, either skip it (`best[i − 1][w]`) or take it, which uses its weight and must come from the **previous** row so it can't be taken twice: `best[i − 1][w − weight] + value`.

## Recognising the pattern

Choose a subset of items, each at most once, to maximise value under a weight limit: this is the 0/1 knapsack itself, the root of the knapsack family in the [2-D Dynamic Programming](/problems/patterns/dp-2d) sheet. Partition Equal Subset Sum, Target Sum and Last Stone Weight II are all this table with different values.

## Alternative: memoised recursion (shown below)

`bestFrom(i, room)` = most value from items `i, i + 1, …` with `room` weight left: skip item `i`, or take it if it fits. Without memoisation this tries all `2^n` subsets; with a memo table on `(i, room)` each state is solved once. That is the reference brute force below. `O(n × capacity)`.

## Bottom-up table

1. Row 0 (no items) is all zeros.
2. For each item `i` from 1 to `n`, for each `w` from 0 to `capacity`:
   - `best[i][w] = best[i − 1][w]`.
   - If the item fits, `best[i][w] = max(best[i][w], best[i − 1][w − weight] + value)`.
3. Return `best[n][capacity]`.

**Why greedy fails.** Taking items by best value per weight can block a better combination. With `capacity = 10`, weights `[1, 5, 5]` and values `[2, 9, 9]`, greedy takes the light item first (2 per unit), then one 5-weight item, and the second no longer fits: 11. Skipping the light item gives 18. Knapsack with whole items has no greedy shortcut; the fractional version does.

**One row, iterated downward.** Each row reads only the previous row at `w` and at `w − weight`. With a single array, iterate `w` from `capacity` **down** to `weight`: the smaller index hasn't been updated for this item yet, so it still means "without this item". Iterating upward would let the item be added repeatedly (that is the unbounded knapsack).

## Walkthrough

`weights = [4, 2, 3, 6]`, `values = [10, 4, 7, 13]`, `capacity = 9`

| items allowed | w = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| item 0 | 0 | 0 | 0 | 0 | 10 | 10 | 10 | 10 | 10 | 10 |
| + item 1 | 0 | 0 | 4 | 4 | 10 | 10 | 14 | 14 | 14 | 14 |
| + item 2 | 0 | 0 | 4 | 7 | 10 | 11 | 14 | 17 | 17 | 21 |
| + item 3 | 0 | 0 | 4 | 7 | 10 | 11 | 14 | 17 | 17 | 21 |

At `w = 9` with item 2: `best = max(14, best[w = 6 before item 2] + 7) = max(14, 14 + 7) = 21`. Item 3 can't beat it: `13 + best[w = 3] = 13 + 7 = 20`. Answer `21` (items 0, 1 and 2).

## Complexity

- All subsets: `O(2^n)`.
- Table or memoised recursion: `O(n × capacity)` time, `O(n × capacity)` space; `O(capacity)` with one row.
- This is "pseudo-polynomial": it depends on the numeric value of the capacity, not just the input length.

## Edge cases

- An item heavier than the capacity: never taken.
- Capacity 0: value 0.
- Items with zero weight: always worth taking; the recurrence handles them.

## Common mistakes

- Taking from the current row (`best[i][w − weight]`), which allows reuse.
- Iterating upward in the one-row version, for the same reason.
- Greedy by value per weight.

## In the interview

- Write the two-choice recurrence, then compress to one row and explain the direction.
- Likely follow-ups:
  - *Which items were chosen?* Walk back through the full table: if `best[i][w] ≠ best[i − 1][w]`, item `i` was taken.
  - *Unlimited copies?* Take from the current row, or iterate the one-row version upward.
  - *Huge capacity but small values?* Swap roles: `lightest[v]` = least weight that achieves value `v`.
