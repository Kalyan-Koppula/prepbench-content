---
title: Backtracking
order: 11
summary: Build a candidate one choice at a time, recurse, then undo the choice — a depth-first walk over every possibility, cutting branches that can't succeed.
---

## The idea

Some problems ask for **every** arrangement that satisfies a rule: all subsets, all permutations, all ways to place eight queens, every word path on a board. There is no shortcut that skips looking at them; the work is to generate them systematically and to stop early on branches that can't lead anywhere.

Backtracking builds a solution **one decision at a time**. At each step it tries each option, recurses to make the next decision, and then **undoes** the option before trying the next one. The decisions form a tree, and backtracking is a depth-first walk over it:

```
                       []
            /           |           \
          [1]          [2]          [3]          choose the first element
         /   \          |
     [1,2]  [1,3]     [2,3]                      choose the next, only larger ones
       |
    [1,2,3]
```

That is the tree for the subsets of `[1, 2, 3]`: every node is a subset, and each path from the root adds one element. The algorithm visits each node once, records it, and returns ("backtracks") to try the next branch.

Three questions define every backtracking solution:

1. **What is the state?** The partial solution so far (the current path), plus anything needed to check it (used flags, remaining sum, occupied columns).
2. **What are the choices at each step?** The next element, the next digit's letters, the next column for a queen.
3. **When do I stop?** Record a result when the path is complete; abandon a branch when it is already invalid ("pruning").

## When to reach for it

- "Return **all** …": subsets, permutations, combinations, partitions, valid arrangements.
- Constraint puzzles: N-Queens, Sudoku, word search on a grid.
- Small input sizes (`n` around 10 to 20), which hint that exponential time is expected.
- "Does any arrangement exist?" when no greedy or DP structure is apparent.

Look-alikes:

| Statement says | What to use instead |
| --- | --- |
| **Count** the ways, or the best way, with overlapping subproblems | Dynamic programming ([1-D DP](/problems/patterns/dp-1d), [2-D DP](/problems/patterns/dp-2d)) |
| Shortest path or fewest moves | BFS ([Graphs](/problems/patterns/graphs)) |
| The kth permutation only | Direct construction with factorials (Permutation Sequence) |
| Many words on one board | A trie guiding the search ([Tries](/problems/patterns/tries)) |

## How it works

Generating subsets of `[1, 2, 3]` with "choose the next element from those after the last one chosen":

| call | path | start index | records | next choices |
| --- | --- | --- | --- | --- |
| 1 | [] | 0 | [] | 1, 2, 3 |
| 2 | [1] | 1 | [1] | 2, 3 |
| 3 | [1, 2] | 2 | [1, 2] | 3 |
| 4 | [1, 2, 3] | 3 | [1, 2, 3] | none, return |
| back in 3 | [1, 2] → pop 3 | | | |
| back in 2 | [1] → pop 2, push 3 | | [1, 3] | none |
| back in 1 | [] → pop 1, push 2 | | [2] … | |

The **invariant**: when a call starts, `path` holds exactly the choices made on the way down to it, and when the call returns, `path` is exactly as it was when it started. The push before the recursive call and the pop after it are what keep that true.

Restricting the next choice to indices **after** the last one chosen is what stops `[2, 1]` from being generated alongside `[1, 2]`. For permutations, where order matters, the choices are instead "any element not used yet".

## Templates

### Subsets and combinations (choose from what comes after)

```ts
function subsets(nums: number[]): number[][] {
  const result: number[][] = []
  const path: number[] = []

  function explore(start: number): void {
    result.push(path.slice()) // every node is a subset: record a copy
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]) // choose
      explore(i + 1) // explore with later elements only
      path.pop() // un-choose
    }
  }

  explore(0)
  return result
}
```

- Record a **copy** of the path; recording the path itself would leave you with many references to the same, finally empty, array.
- For combinations of a fixed size or target sum, record only at the goal and stop early when the goal is exceeded.
- If an element may be reused (Combination Sum), recurse with `i` instead of `i + 1`.

### Permutations (choose anything unused)

```ts
function permute(nums: number[]): number[][] {
  const result: number[][] = []
  const path: number[] = []
  const used = new Array(nums.length).fill(false)

  function explore(): void {
    if (path.length === nums.length) {
      result.push(path.slice())
      return
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) {
        continue
      }
      used[i] = true
      path.push(nums[i])
      explore()
      path.pop()
      used[i] = false
    }
  }

  explore()
  return result
}
```

### Skipping duplicates

```ts
// After sorting, at one level of the tree, use each distinct value only once.
for (let i = start; i < nums.length; i++) {
  if (i > start && nums[i] === nums[i - 1]) {
    continue // same value already tried at this position
  }
  // choose nums[i], explore(i + 1), un-choose
}
```

- Sort first so equal values sit together.
- The check is `i > start`, not `i > 0`: the same value may still be used **deeper** in the path (as in `[2, 2]`), just not twice at the same position.

### Grid search (mark, recurse, unmark)

```ts
function trace(board: string[][], word: string, i: number, r: number, c: number): boolean {
  if (i === word.length) {
    return true
  }
  if (r < 0 || c < 0 || r >= board.length || c >= board[0].length || board[r][c] !== word[i]) {
    return false
  }
  const saved = board[r][c]
  board[r][c] = '#' // mark as used on this path
  const found =
    trace(board, word, i + 1, r + 1, c) ||
    trace(board, word, i + 1, r - 1, c) ||
    trace(board, word, i + 1, r, c + 1) ||
    trace(board, word, i + 1, r, c - 1)
  board[r][c] = saved // unmark
  return found
}
```

### Choosing a template

- Order doesn't matter, pick a subset: **choose from what comes after**.
- Order matters, use every element: **choose anything unused**.
- Input has duplicates and output must not: sort and **skip duplicates** per level.
- Paths on a board: **mark, recurse, unmark**.
- Constraint puzzles (queens, Sudoku): choose for one cell or row at a time, with fast "is this allowed?" checks kept in sets or arrays.

## Choosing the state and the pruning

| Problem | State | Prune when |
| --- | --- | --- |
| Combination Sum | path, remaining target | remaining < 0, or (sorted) the candidate exceeds the remainder |
| Palindrome Partitioning | path of pieces, start index | the next piece isn't a palindrome |
| N-Queens | queen column per row; used columns and diagonals | the column or a diagonal is taken |
| Sudoku | grid; used digits per row, column and box | a digit is already in the row, column or box |
| Word Search | position in the word, current cell | letter mismatch, or cell already on the path |

Good pruning can turn an impossible search into a fast one. Checking constraints **before** recursing, using `O(1)` lookups (sets or boolean arrays), is the standard way.

## Worked problems

**Subsets.** Record every node of the "choose from what comes after" tree. `2^n` subsets, each copied in `O(n)`.

**Combination Sum.** The same tree, but an element may be chosen again (recurse with the same index) and you record only when the remaining target hits zero. Sorting lets you stop the loop as soon as a candidate is larger than the remainder.

**Permutations.** Every level picks any unused element; the path is complete at length `n`. `n!` results.

**N-Queens.** Place one queen per row. Columns and both diagonal directions are tracked in sets (`row − col` and `row + col` identify the diagonals), so each placement is checked in `O(1)`.

## Variations and tricks

- **Include / exclude formulation.** For subsets, at index `i` either take `nums[i]` or don't, then move to `i + 1`. Same tree, different shape of code.
- **Bitmasks.** For `n ≤ 20`, subsets can be enumerated as the integers `0 .. 2^n − 1`.
- **Swap-based permutations.** Swap each element into position `k`, recurse on `k + 1`, swap back. No `used` array needed.
- **Memoisation.** If the same state is reached by different paths and you only need a count or a yes/no, cache results: that turns backtracking into dynamic programming.
- **Early exit.** For "does any solution exist?", return `true` up the chain as soon as one is found.

## Complexity

- Subsets: `O(n · 2^n)` time (each of `2^n` subsets copied in `O(n)`), `O(n)` recursion depth.
- Permutations: `O(n · n!)` time, `O(n)` depth.
- Combinations of size `k`: `O(k · C(n, k))`.
- Grid word search: `O(m · n · 4 · 3^(L − 1))` for a word of length `L`.
- Constraint puzzles: exponential in the worst case; pruning is what makes them practical.

## Pitfalls

- Recording `path` instead of a copy of it.
- Forgetting to undo a choice (pop the path, clear a used flag, unmark a cell).
- Skipping duplicates with `i > 0` instead of `i > start`, which drops valid answers.
- Generating permutations when the problem wants combinations (or the reverse), producing duplicates like `[1, 2]` and `[2, 1]`.
- Pruning too late: checking validity only at the leaves explores far more than necessary.

## Practice ladder

1. [Subsets](/problems/subsets): the basic "choose from what comes after" tree.
2. [Subsets II](/problems/subsets-ii): sorting and skipping duplicates at each level.
3. [Combination Sum](/problems/combination-sum): reusing elements and a target to prune.
4. [Combination Sum II](/problems/combination-sum-ii): no reuse, duplicates in the input.
5. [Permutations](/problems/permutations): choosing any unused element.
6. [Letter Combinations of a Phone Number](/problems/letter-combinations-of-a-phone-number): a fixed number of positions, each with its own choices.
7. [Word Search](/problems/word-search): mark, recurse and unmark on a grid.
8. [Palindrome Partitioning](/problems/palindrome-partitioning): choosing where to cut, pruned by a palindrome check.
9. [Permutation Sequence](/problems/permutation-sequence): skipping whole subtrees by counting instead of enumerating.
10. [N-Queens](/problems/n-queens): constraint tracking with column and diagonal sets.
11. [Sudoku Solver](/problems/sudoku-solver): full constraint search with row, column and box tracking.
