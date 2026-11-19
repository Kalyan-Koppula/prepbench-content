**Key idea:** walk left to right and keep `reach`, the farthest index you can get to from any index seen so far. If you ever stand on an index beyond `reach`, you can't have arrived there, so the answer is false. If `reach` gets to the last index, it is true.

## Recognising the pattern

"Can you get to the end?" where each position offers a range of next positions is a reachability question. A BFS or a DP would work, but because the reachable set is always a **prefix** of the array (if you can reach index `k`, you can reach every index before it), one number describes it. That makes it a one-pass greedy from the [Greedy](/problems/patterns/greedy) sheet.

## Brute force

DP from the right: `ok[i]` is true if some jump from `i` lands on an index with `ok` true. `ok[n − 1]` is true. That is the reference brute force below. `O(n · max jump)` time, up to `O(n²)`.

## Greedy reach

1. `reach = 0`.
2. For each `i`:
   1. If `i > reach`, return false.
   2. `reach = max(reach, i + nums[i])`.
   3. If `reach ≥ n − 1`, return true.

**Why the reachable set is a prefix.** You reach index `k` from some `j < k` with `j + nums[j] ≥ k`. Every index between `j` and `k` is also within that jump. So "the farthest reachable index" tells you everything.

## Walkthrough

`nums = [2, 0, 1, 0, 3]`

| i | nums[i] | i ≤ reach? | reach after |
| --- | --- | --- | --- |
| 0 | 2 | yes | 2 |
| 1 | 0 | yes | 2 |
| 2 | 1 | yes | 3 |
| 3 | 0 | yes | 3 |
| 4 | 3 | **no** (4 > 3) | – |

Answer `false`: the zero at index 3 is a wall. For `[1, 2, 0, 1, 4]`, `reach` goes 1, 3, 3, 4, and 4 is the last index, so `true`.

## Complexity

- DP from the right: `O(n²)` worst case, `O(n)` space.
- Greedy reach: `O(n)` time, `O(1)` space.

## Edge cases

- One element: already at the end, true even if it is 0.
- A zero at index 0 with more elements: false.
- Zeros that can be jumped over: harmless.

## Common mistakes

- Checking only whether `nums[i] = 0`; a zero is fatal only when nothing jumps past it.
- Off-by-one: the goal is index `n − 1`, not `n`.
- BFS with a queue of indices, which is correct but `O(n²)` in the worst case.

## In the interview

- State the prefix property in one sentence; it is the whole proof.
- Likely follow-ups:
  - *Fewest jumps?* [Jump Game II](/problems/jump-game-ii): the same reach idea, grouped into levels.
  - *Jumps in both directions, landing on index with value 0 (Jump Game III)?* BFS or DFS with a visited set; the prefix property no longer holds.
