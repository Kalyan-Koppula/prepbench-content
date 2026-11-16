---
title: Backtracking
order: 11
summary: Build candidates one choice at a time, undo the choice, try the next — DFS over a decision tree.
---

## Recognise it

- "Return **all** subsets / permutations / combinations / partitions / placements."
- Constraints are tiny (`n <= 10`–`20`, a 9×9 board) — exponential output or search is expected.
- A puzzle with rules checked incrementally (N-Queens, Sudoku, word in a grid).

## Template

```ts
const result: number[][] = []
const path: number[] = []

function backtrack(start: number) {
  result.push([...path])            // record (subsets: every node; combos: only at a goal)
  for (let i = start; i < nums.length; i++) {
    path.push(nums[i])              // choose
    backtrack(i + 1)                // explore (i + 1: each item once; i: reuse allowed)
    path.pop()                      // unchoose
  }
}
backtrack(0)
```

## Variations

- **Subsets / combinations:** loop from `start` so each set is generated once, in index order.
- **Permutations:** loop over all indices, skip ones marked `used[i]`.
- **Duplicates in input:** sort first, then skip `nums[i] === nums[i - 1]` when `i > start` (same level) — "don't pick the same value twice as the *same* choice".
- **Grid search:** mark the cell, recurse into neighbours, unmark.
- **Constraint puzzles:** keep sets/bitmasks of what's used per row/column/box so each check is O(1).

## Pruning

- Sort candidates so you can `break` once a value overshoots the target.
- Stop early when the remaining items can't possibly complete the goal (too few left, sum too large).
- Return `true` up the stack as soon as a single solution is found, when only one is needed.

## Interview notes

- Draw the decision tree: what is one "choice", and what does each level represent?
- Complexity is usually "number of nodes × work per node", e.g. subsets `O(n · 2^n)`, permutations `O(n · n!)`.
- Say why a copy is needed when recording: `result.push([...path])`, not `result.push(path)`.

## Pitfalls

- Pushing `path` itself — every entry ends up as the same (empty) array.
- Forgetting to undo state (`pop`, `used[i] = false`, restoring a grid cell).
- Dedup with `i > 0` instead of `i > start` — that also skips valid choices at deeper levels.
- Using a `Set` of stringified results to dedupe: works, but signals you missed the sorting trick.
