**Key insight:** water above bar `i` is `min(maxLeft[i], maxRight[i]) - height[i]`. With pointers at both ends, whichever side has the smaller running max is already bounded by it — the other side is guaranteed to have something at least as tall — so that side's water is settled.

## Approach

1. `l = 0`, `r = n - 1`, `leftMax = rightMax = 0`, `water = 0`.
2. While `l < r`:
   - If `height[l] < height[r]`: update `leftMax`, add `leftMax - height[l]`, then `l++`.
   - Else: update `rightMax`, add `rightMax - height[r]`, then `r--`.

When `height[l] < height[r]`, the right side holds a bar taller than `height[l]`, and `leftMax` is the true left maximum — so the level at `l` is exactly `leftMax` (or the bar itself if higher).

## Complexity

- Time `O(n)` — one pass.
- Space `O(1)`.

## Alternatives to mention

- For each bar, scan left and right for the maxima: `O(n²)`.
- Prefix max and suffix max arrays: `O(n)` time and space — the clearest stepping stone; derive it first, then compress to two pointers.
- Monotonic stack: pop shorter bars and fill water layer by layer (horizontal slices). `O(n)` time and space; useful if the interviewer asks for another angle.

## Pitfalls

- Adding `leftMax - height[l]` *before* updating `leftMax` can produce negative water.
- Edge bars never hold water; arrays shorter than 3 always return `0`.
