**Key insight:** generate each multiset once by choosing candidates in non-decreasing index order. Choosing index `i` and recursing *from `i` again* allows reuse; never looking back prevents permutations of the same combination.

## Approach

1. Sort `candidates` (enables early `break`).
2. `backtrack(start, remaining)`:
   - `remaining === 0` → record a copy of `path`.
   - For `i` from `start`: if `candidates[i] > remaining`, stop the loop. Otherwise push it, recurse with `(i, remaining - candidates[i])`, pop.

## Complexity

- Time is exponential: with `T = target` and `m` the smallest candidate, the tree depth is at most `T / m` and each level branches up to `n` ways — `O(n^(T/m))` as a loose bound. In practice pruning keeps it small.
- Space `O(T / m)` recursion depth, excluding the output.

## Alternatives to mention

- **Per-candidate counts:** for each candidate, decide how many copies (`0, 1, 2, …`) to take, then move to the next. Same results, another valid tree.
- If only the **number** of combinations were needed, this becomes the unbounded knapsack / coin change II DP in `O(n · T)`.

## Pitfalls

- Recursing with `i + 1` (forbids reuse) or with `0` (creates permutations like `[2, 3]` and `[3, 2]`).
- Using `continue` instead of `break` after sorting is correct but wastes work; without sorting, `break` is wrong.
