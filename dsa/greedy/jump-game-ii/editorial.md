**Key idea:** think in levels, like BFS. All indices reachable with `k` jumps form a contiguous window. The next window ends at the farthest index any index in the current window can reach. Count how many windows it takes to cover the last index. One pass, `O(1)` space.

## Recognising the pattern

"Fewest steps" usually means BFS. Here the levels are contiguous ranges, so the BFS collapses into two numbers per level: where the current level ends, and how far the next one goes. That is a greedy from the [Greedy](/problems/patterns/greedy) sheet; [Jump Game](/problems/jump-game) is the yes/no version.

## Brute force

DP: `fewest[i]` = fewest jumps to reach `i`. From each `i`, relax every index it can jump to with `fewest[i] + 1`. That is the reference brute force below. `O(n · max jump)` time, up to `O(n²)`.

## Level-by-level greedy

1. `jumps = 0`, `windowEnd = 0` (the end of the level reachable with `jumps` jumps), `farthest = 0`.
2. For `i` from 0 to `n − 2`:
   1. `farthest = max(farthest, i + nums[i])`.
   2. If `i = windowEnd`: the current level is exhausted, so take a jump: `jumps++`, `windowEnd = farthest`.
3. Return `jumps`.

**Why stop at `n − 2`.** Arriving at the last index needs no further jump. Processing it would add an extra jump when `windowEnd` happens to equal `n − 1`.

**Why greedy is optimal.** Every index in level `k` is reachable in exactly `k` jumps and no fewer. Extending the next level to the farthest reachable point can only include more indices, never exclude useful ones.

## Walkthrough

`nums = [3, 1, 1, 2, 1, 1]`

| i | i + nums[i] | farthest | i = windowEnd? | jumps | windowEnd |
| --- | --- | --- | --- | --- | --- |
| 0 | 3 | 3 | yes | 1 | 3 |
| 1 | 2 | 3 | no | 1 | 3 |
| 2 | 3 | 3 | no | 1 | 3 |
| 3 | 5 | 5 | yes | 2 | 5 |
| 4 | 5 | 5 | no | 2 | 5 |

Answer `2`: levels are `{0}`, `{1, 2, 3}`, `{4, 5}`; one path is 0 → 3 → 5.

## Complexity

- DP over jumps: `O(n²)` worst case, `O(n)` space.
- BFS with an explicit queue: `O(n²)` edges in the worst case.
- Level greedy: `O(n)` time, `O(1)` space.

## Edge cases

- One element: 0 jumps.
- The first jump reaches the end: 1.
- The problem guarantees the end is reachable; without that guarantee, check `farthest ≤ i` at a window end and return −1.

## Common mistakes

- Looping to `n − 1`, which can count one extra jump.
- Greedily jumping to the index with the biggest value instead of the one that reaches farthest (`i + nums[i]`).
- Incrementing `jumps` on every improvement of `farthest`.

## In the interview

- Draw the levels as BFS layers; the two-variable version then follows.
- Likely follow-ups:
  - *Return the path?* Remember which index produced `farthest` in each level.
  - *Unreachable end possible?* Return −1 when a level ends without extending.
