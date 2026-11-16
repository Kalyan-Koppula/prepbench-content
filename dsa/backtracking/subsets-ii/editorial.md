**Key insight:** sort, then at each level of the backtracking tree use each distinct value at most once as "the next element". Duplicate subsets come only from choosing a different copy of the same value at the same level.

## Approach

1. Sort `nums` so equal values are adjacent.
2. `backtrack(start)`: record `path`; for `i` from `start`:
   - If `i > start` and `nums[i] === nums[i - 1]`, skip — the previous copy already explored this exact subtree.
   - Otherwise push, recurse with `i + 1`, pop.

Note the condition is `i > start`, not `i > 0`: going *deeper* with the second copy (e.g. building `[2, 2]`) is allowed; only choosing it *instead of* the first copy at the same level is skipped.

## Complexity

- Time `O(n · 2^n)` in the worst case (all distinct).
- Space `O(n)` excluding the output.

## Alternatives to mention

- Generate all `2^n` subsets, sort each, dedupe with a `Set` of strings: correct but wasteful, and interviewers want the skip rule.
- **Count-based:** group equal values; for a value with count `c`, branch on taking `0..c` copies. Same output, no skip condition needed.

## Pitfalls

- Forgetting to sort first — the skip check only works on adjacent duplicates.
- Using `i > 0` and losing subsets like `[2, 2]`.
