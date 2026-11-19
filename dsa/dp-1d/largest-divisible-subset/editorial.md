**Key idea:** sort the numbers. In sorted order, a valid subset is a **chain** where each element divides the next: if `a | b` and `b | c` then `a | c`, so checking neighbours is enough. That turns the problem into "longest chain", solved exactly like the `O(n²)` [Longest Increasing Subsequence](/problems/longest-increasing-subsequence), with "divides" in place of "is smaller than". Store a back-pointer per element to rebuild the subset.

## Recognising the pattern

"Largest subset where every pair satisfies a relation" is hard in general. When the relation is **transitive** and fits a sort order, it becomes a longest-chain problem: the "ending at `i`" state from the [1-D Dynamic Programming](/problems/patterns/dp-1d) sheet, plus reconstruction.

## Alternative: chains starting at each element (shown below)

The same DP run from the right: `length[i]` = the longest chain **starting** at `a[i]`, using later elements that `a[i]` divides, with a `next` pointer. Reading the chain forwards needs no reversal. That is the reference brute force below. Same `O(n²)`.

Enumerating all subsets is `O(2^n)`, hopeless for 1,000 numbers.

## Longest chain ending at each element

1. Sort `a` ascending.
2. `length[i] = 1`, `previous[i] = −1`.
3. For each `i`, for each `j < i`: if `a[i] % a[j] = 0` and `length[j] + 1 > length[i]`, set `length[i] = length[j] + 1` and `previous[i] = j`.
4. Find `bestEnd`, the `i` with the largest `length[i]`.
5. Follow `previous` from `bestEnd`, then reverse.

**Why sorting first.** Divisibility between distinct positive numbers only goes from smaller to larger, so after sorting, a chain only ever looks to the left. That gives the DP a fixed order.

**Why checking the last element is enough.** If `a[j]` is the largest element of a valid chain and `a[j] | a[i]`, every earlier element divides `a[j]` and therefore `a[i]`.

## Walkthrough

`nums = [3, 5, 10, 20, 7]`, sorted `[3, 5, 7, 10, 20]`.

| i | a[i] | divisible by | length | previous |
| --- | --- | --- | --- | --- |
| 0 | 3 | – | 1 | – |
| 1 | 5 | – | 1 | – |
| 2 | 7 | – | 1 | – |
| 3 | 10 | 5 | 2 | 5 |
| 4 | 20 | 5, 10 | 3 | 10 |

`bestEnd` is 20; walking back: 20 → 10 → 5. Answer `[5, 10, 20]`.

## Complexity

- All subsets: `O(2^n · n)`.
- Chain DP: `O(n²)` time after an `O(n log n)` sort, `O(n)` space.

## Edge cases

- One element: that element.
- No pair divides (`[7, 11]`): any single element.
- 1 in the input: it divides everything and starts the longest chain.
- Large values (up to `2 · 10^9`): `%` on them is fine; no products are formed.

## Common mistakes

- Forgetting to sort, so chains must look in both directions.
- Checking divisibility against every element of the chain (correct but unnecessary).
- Returning only the length; the problem asks for the subset, so the back-pointers are required.

## In the interview

- State the transitivity argument; it is the reason the problem is tractable.
- Likely follow-ups:
  - *Count the largest subsets?* Track the number of ways to reach each `length[i]`.
  - *Relation "a divides b or b divides a" without distinct values?* Remove duplicates or treat them as dividing each other.
