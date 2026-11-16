**Key insight:** this is Subsets II with a target. Sort, recurse with `i + 1` (each position once), and skip a value equal to the previous one at the same level so duplicate combinations are never built.

## Approach

1. Sort `candidates`.
2. `backtrack(start, remaining)`:
   - `remaining === 0` → record a copy of `path`.
   - For `i` from `start`:
     - If `candidates[i] > remaining`, `break` (everything after is larger).
     - If `i > start` and `candidates[i] === candidates[i - 1]`, `continue` (same choice as the previous sibling).
     - Push, recurse with `(i + 1, remaining - candidates[i])`, pop.

## Complexity

- Time `O(n · 2^n)` in the worst case — each position is in or out, and copying a combination costs up to `O(n)`. The sum bound prunes most of it in practice.
- Space `O(n)` recursion depth, excluding the output.

## Alternatives to mention

- Group equal values and branch on how many copies (`0..count`) of each to take — avoids the skip rule entirely and is easy to reason about.
- Generating all subsets and deduplicating with a `Set` works only for tiny `n`; with `n = 100` it's hopeless.

## Pitfalls

- Skipping with `i > 0` instead of `i > start` loses combinations that use two equal values, like `[1, 1, 6]`.
- Recursing with `i` (as in Combination Sum) reuses the same position.
