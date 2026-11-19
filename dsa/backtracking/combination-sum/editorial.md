**Key idea:** backtrack over the candidates in sorted order, tracking how much of the target remains. Because a candidate may be reused, after choosing `candidates[i]` you recurse starting from `i` again, not `i + 1`. Stop a branch as soon as the next candidate is larger than what remains.

## Recognising the pattern

"Every combination that reaches a target" is the "choose from what comes after" template from the [Backtracking](/problems/patterns/backtracking) sheet, with a running total for pruning. Allowing reuse only changes where the next level starts.

## Brute force

Go through the candidates one at a time, and for each decide how many copies to take (0, 1, 2, … while the sum stays within the target). Record a combination when every candidate has been decided and the sum equals the target. That is the reference brute force below. It explores many "take zero copies" branches that lead nowhere, but generates each combination once.

## Backtracking with a remaining target

1. Sort the candidates.
2. `explore(start, remaining)`:
   1. If `remaining == 0`, record a copy of `path` and return.
   2. For `i` from `start`: if `candidates[i] > remaining`, stop the loop (all later ones are bigger too). Otherwise push it, call `explore(i, remaining − candidates[i])`, pop.

**Why recurse with `i`.** Starting the next level at `i` allows the same candidate again; starting at `i + 1` would forbid reuse. Never going back to indices before `i` is what keeps `[2, 3]` and `[3, 2]` from both appearing.

## Walkthrough

`candidates = [2, 3, 6, 7]`, `target = 7`

| path | remaining | next choices | result |
| --- | --- | --- | --- |
| [2] | 5 | 2, 3 | |
| [2, 2] | 3 | 2, 3 | |
| [2, 2, 2] | 1 | 2 > 1 → stop | |
| [2, 2, 3] | 0 | – | record |
| [2, 3] | 2 | 3 > 2 → stop | |
| [3] | 4 | 3 | |
| [3, 3] | 1 | stop | |
| [6] | 1 | stop | |
| [7] | 0 | – | record |

Answer `[[2, 2, 3], [7]]`.

## Complexity

The number of nodes in the search tree is bounded by roughly `n^(T / m)`, where `T` is the target and `m` the smallest candidate (the maximum depth). Each recorded combination costs up to `T / m` to copy. Space `O(T / m)` for the recursion depth.

## Edge cases

- No combination reaches the target: return `[]`.
- A candidate equal to the target: a combination of one element.
- The smallest candidate larger than the target: nothing to try.

## Common mistakes

- Recursing with `i + 1`, which forbids reuse.
- Looping from 0 at every level, which produces the same combination in several orders.
- Not sorting, and so not being able to stop the loop early.

## In the interview

- Explain how the start index prevents reordered duplicates and how `i` versus `i + 1` controls reuse.
- Likely follow-ups:
  - *Each candidate at most once, with duplicates in the input?* Recurse with `i + 1` and skip equal values per level (Combination Sum II).
  - *Only the number of combinations?* Dynamic programming over sums, like Coin Change II.
  - *Fixed size `k` with digits 1–9?* Add a depth limit (Combination Sum III).
