**Key insight:** it's a BFS where each level is a contiguous range of indices; the next level ends at the farthest point any index in the current level can reach.

## Approach

1. `windowEnd` is the last index reachable with `jumps` jumps; `farthest` is the best reach found while scanning that window.
2. For each `i` before the last index, update `farthest = max(farthest, i + nums[i])`.
3. When `i` hits `windowEnd`, the current level is exhausted: take one more jump and set `windowEnd = farthest`.
4. Stop before the last index — you never need to jump *from* it.

Why greedy works ("stays ahead"): after `k` jumps the greedy window reaches at least as far as any sequence of `k` jumps, so no strategy reaches the end in fewer.

## Complexity

- Time `O(n)` — each index scanned once.
- Space `O(1)`.

## Alternatives to mention

- DP `dp[j] = min(dp[i] + 1)` over all `i` that can reach `j`: `O(n · max(nums))`.
- Explicit BFS with a queue: same idea, `O(n)` extra space.

## Pitfalls

- Looping to `n - 1` inclusive counts an extra jump when `windowEnd` lands exactly on the last index.
- `[0]` needs zero jumps.
