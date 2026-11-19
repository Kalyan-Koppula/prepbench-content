**Key idea:** fill the positions one at a time. For the next position, try every element that hasn't been used yet, recurse, then mark it unused again. When every position is filled, record a copy.

## Recognising the pattern

"Every ordering" of distinct elements is the permutation template from the [Backtracking](/problems/patterns/backtracking) sheet: unlike subsets, order matters, so each level chooses from **all** unused elements rather than only later ones.

## Alternative: swap-based (shown below)

Fix positions from left to right by swapping: for position `k`, swap each element at `k..n−1` into position `k`, recurse on `k + 1`, then swap back. The array itself holds the current permutation, so no `used` array or separate path is needed. That is the reference brute force below; it is just as efficient.

## Backtracking with a used array

1. `path = []`, `used` = all false.
2. `explore()`:
   1. If `path` has `n` elements, record a copy and return.
   2. For each `i` with `used[i]` false: mark it used, push `nums[i]`, call `explore()`, pop, unmark.

Every permutation is a sequence of distinct choices, one per level, so each is generated exactly once.

## Walkthrough

`nums = [1, 2, 3]`

| level 1 | level 2 | level 3 | recorded |
| --- | --- | --- | --- |
| 1 | 2 | 3 | [1, 2, 3] |
| 1 | 3 | 2 | [1, 3, 2] |
| 2 | 1 | 3 | [2, 1, 3] |
| 2 | 3 | 1 | [2, 3, 1] |
| 3 | 1 | 2 | [3, 1, 2] |
| 3 | 2 | 1 | [3, 2, 1] |

Six permutations: `3 × 2 × 1`.

## Complexity

- Time `O(n · n!)`: `n!` permutations, each copied in `O(n)`. The internal nodes of the tree add a constant factor.
- Space `O(n)` for the path, the `used` array and the recursion, plus the output.

## Edge cases

- One element: one permutation.
- Negative numbers: irrelevant.

## Common mistakes

- Forgetting to unmark `used[i]` after the recursive call.
- Recording `path` instead of a copy.
- Starting the loop at a `start` index as in subsets, which produces only the increasing order.

## In the interview

- Contrast with subsets: "here order matters, so each position may take any unused element."
- Likely follow-ups:
  - *Duplicates in the input (Permutations II)?* Sort, and skip `nums[i]` if it equals `nums[i − 1]` and `nums[i − 1]` is not currently used.
  - *Next permutation in order?* A direct `O(n)` rule (Next Permutation).
  - *The kth permutation?* Count subtrees with factorials instead of enumerating (Permutation Sequence).
