**Key idea:** the same backtracking as Combination Sum, with two changes. Each position can be used once, so the next level starts at `i + 1`. And because the input has duplicates, sort it and skip a value at a given level if the previous position held the same value; otherwise the same combination is built twice.

## Recognising the pattern

Target sum with no reuse and duplicate inputs combines the target pruning and the "skip duplicates" template from the [Backtracking](/problems/patterns/backtracking) sheet, exactly as Subsets II does for plain subsets.

## Brute force

Group equal values and decide, for each distinct value, how many of its copies to take (zero up to how many exist), pruning when the sum exceeds the target. That is the reference brute force below. It produces each combination once by construction, but explores many zero-copy branches.

## Backtracking with skipping

1. Sort the candidates.
2. `explore(start, remaining)`:
   1. If `remaining == 0`, record a copy of `path`.
   2. For `i` from `start`:
      - If `candidates[i] > remaining`, stop the loop.
      - If `i > start` and `candidates[i] == candidates[i − 1]`, skip it.
      - Push it, `explore(i + 1, remaining − candidates[i])`, pop.

The skip rule stops two equal values from being used at the **same** position of a combination; it still allows using both of them at consecutive positions, as in `[1, 1, 6]`.

## Walkthrough

`candidates = [10, 1, 2, 7, 6, 1, 5]`, `target = 8`. Sorted: `[1, 1, 2, 5, 6, 7, 10]`.

| path | remaining | note |
| --- | --- | --- |
| [1, 1, 6] | 0 | record (both 1s at different positions) |
| [1, 2, 5] | 0 | record |
| [1, 7] | 0 | record |
| second 1 at position 0 | – | skipped: same as the first 1 at this level |
| [2, 6] | 0 | record |
| [5] → 5 + 6 > 8 | – | stop |

Answer `[[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]]`.

## Complexity

At most `2^n` subsets are explored, each copied in `O(n)`: `O(n · 2^n)` in the worst case, and much less with pruning by the target. Space `O(n)` for the recursion.

## Edge cases

- All candidates larger than the target: return `[]`.
- Many copies of one value: the skip rule lets you take 1, 2, 3 … copies, but each count only once.
- Candidates equal to the target: single-element combinations.

## Common mistakes

- Using `i` instead of `i + 1`, which reuses a position.
- Skipping with `i > 0`, which drops combinations like `[1, 1, 6]`.
- Deduplicating results at the end instead of avoiding duplicates during the search.

## In the interview

- Compare it with Combination Sum: "no reuse means `i + 1`, duplicates mean sort and skip per level."
- Likely follow-ups:
  - *Count only?* Knapsack-style DP over sums, counting each value's copies.
  - *Combinations of exactly `k` numbers?* Add a depth check.
