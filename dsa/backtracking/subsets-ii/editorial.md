**Key idea:** sort the numbers so equal values sit together, then run the usual subsets backtracking with one extra rule: at each level of the tree, use each **value** only once. Choosing the second of two equal values at the same position would rebuild exactly the subtree the first one already built.

## Recognising the pattern

Subsets with duplicate inputs and distinct outputs is the "skip duplicates" template from the [Backtracking](/problems/patterns/backtracking) sheet. Deduplicating afterwards also works, but generating no duplicates in the first place is cleaner and faster.

## Brute force

Sort, generate all `2^n` subsets by taking or skipping each element, and keep each subset only the first time its string key (like `"1,2,2"`) appears. That is the reference brute force below. Correct, but it generates every duplicate and builds a key for each: `O(n · 2^n)` with extra hashing.

## Backtracking that skips duplicates

1. Sort `nums`.
2. `explore(start)`:
   1. Record a copy of `path`.
   2. For `i` from `start` to `n − 1`:
      - If `i > start` and `nums[i] == nums[i − 1]`, skip.
      - Push `nums[i]`, `explore(i + 1)`, pop.

**Why `i > start` and not `i > 0`.** The rule forbids the same value **twice at the same position** of the subset. Deeper in the path, a repeated value is fine: for `[1, 2, 2]`, the subset `[2, 2]` takes the first `2` at position 0 and the second `2` at position 1. At that second level, `start` equals the second 2's index, so it isn't skipped.

## Walkthrough

`nums = [1, 2, 2]` (sorted)

| path | loop at this level | skipped |
| --- | --- | --- |
| [] | 1, 2, (2) | second 2 |
| [1] | 2, (2) | second 2 |
| [1, 2] | 2 | – |
| [1, 2, 2] | – | |
| [2] | 2 | – |
| [2, 2] | – | |

Result: `[], [1], [1,2], [1,2,2], [2], [2,2]`, six subsets.

## Complexity

- Dedup with keys: time `O(n · 2^n)` plus key building, space for the set of keys.
- Skip duplicates: time `O(n · 2^n)` in the worst case (all distinct), less with duplicates. Space `O(n)` beyond the output.

## Edge cases

- All values equal, like `[2, 2, 2]`: `n + 1` subsets, one per size.
- No duplicates: behaves like Subsets.
- Negative values: sorting puts them first; nothing else changes.

## Common mistakes

- Skipping with `i > 0`, which loses subsets such as `[2, 2]`.
- Forgetting to sort.
- Deduplicating with a set of arrays, which compares references and removes nothing.

## In the interview

- Explain what a duplicate subtree is with `[2, 2]`, then the one-line rule.
- Likely follow-ups:
  - *Permutations with duplicates (Permutations II)?* Sort, and skip `nums[i]` when it equals `nums[i − 1]` and `nums[i − 1]` isn't used yet.
  - *Combination sums with duplicates?* The same skip rule (Combination Sum II).
