**Key idea:** build subsets one element at a time, always choosing the next element from those **after** the last one chosen. Every partial choice is itself a subset, so record each one on the way down. Choose, recurse, then undo the choice before trying the next.

## Recognising the pattern

"Return every subset" means generating all `2^n` of them; nothing smarter exists. The job is to generate each exactly once, which is the "choose from what comes after" template from the [Backtracking](/problems/patterns/backtracking) sheet.

## Alternative: iterative doubling (shown below)

Start with `[[]]`. For each element, copy every subset you have so far and add the element to the copy. After processing `n` elements, you have all `2^n` subsets. That is the reference brute force below. Same `O(n · 2^n)` cost, no recursion.

A bitmask loop (`mask` from 0 to `2^n − 1`, bit `i` set means "take `nums[i]`") also works for small `n`.

## Backtracking

1. `result = []`, `path = []`.
2. `explore(start)`:
   1. Record a copy of `path`.
   2. For `i` from `start` to `n − 1`: push `nums[i]`, call `explore(i + 1)`, pop.
3. `explore(0)`.

Each subset corresponds to one increasing sequence of indices, and the loop from `start` generates each such sequence exactly once, so there are no duplicates.

**Record a copy.** `path` keeps changing. Pushing `path` itself would store many references to one array that is empty at the end.

## Walkthrough

`nums = [1, 2, 3]`

| path when recorded | then tries |
| --- | --- |
| [] | 1, 2, 3 |
| [1] | 2, 3 |
| [1, 2] | 3 |
| [1, 2, 3] | – |
| [1, 3] | – |
| [2] | 3 |
| [2, 3] | – |
| [3] | – |

Eight subsets.

## Complexity

- Both approaches: time `O(n · 2^n)`: there are `2^n` subsets and copying each costs up to `O(n)`. Space `O(n)` for the recursion and path, plus the output.

## Edge cases

- One element: `[[], [x]]`.
- Negative numbers: irrelevant to the generation.

## Common mistakes

- Recording `path` without copying it.
- Looping from 0 instead of `start`, which generates permutations and duplicates.
- Recording only at the leaves, which misses the smaller subsets (in this formulation every node is a subset).

## In the interview

- Draw the decision tree for `[1, 2, 3]`; it explains both correctness and the `2^n` count.
- Likely follow-ups:
  - *Duplicates in the input?* Sort and skip equal values at the same level (Subsets II).
  - *Only subsets of size `k`?* Record at depth `k` and stop there (Combinations).
  - *Subsets summing to a target?* Prune by the remaining sum (Combination Sum).
