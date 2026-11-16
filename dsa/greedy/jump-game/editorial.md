**Key insight:** every index up to the farthest reachable point is itself reachable, so a single number — `reach` — captures the whole state.

## Approach

1. `reach = 0`. Walk `i` from left to right.
2. If `i > reach`, index `i` can't be reached and neither can anything after it: return `false`.
3. Otherwise extend `reach = max(reach, i + nums[i])`; once it covers the last index, return `true`.

Why it's safe: reachability is contiguous — if you can get to `j`, you can stop at any index before `j` on the way. So tracking only the max loses nothing.

## Complexity

- Time `O(n)`, space `O(1)`.

## Alternatives to mention

- DP from the right (`ok[i]` = any of the next `nums[i]` cells is good): `O(n · max(nums))` worst case.
- Backwards greedy: keep `goal = n - 1`; scanning right to left, if `i + nums[i] >= goal`, move `goal = i`. Answer is `goal === 0`. Equally valid and nice to mention.

## Pitfalls

- Zeros are the only obstacle; the trap is an input where every route funnels onto the same zero.
- A single-element array is already at the end: `true`.
