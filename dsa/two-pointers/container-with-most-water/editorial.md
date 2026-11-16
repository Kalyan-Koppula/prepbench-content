**Key insight:** start with the widest container. The shorter of the two lines limits the area, and pairing it with any line closer in can only be worse — so discard the shorter line and move inward.

## Approach

1. `l = 0`, `r = n - 1`, `best = 0`.
2. While `l < r`: update `best` with `(r - l) * min(height[l], height[r])`.
3. Move the pointer at the shorter line inward (either one on a tie).

**Why it's safe:** say `height[l] <= height[r]`. Any container using `l` with some `r' < r` is narrower and still capped at `height[l]`, so it's no better than the one just measured. Line `l` has nothing left to offer and can be dropped.

## Complexity

- Time `O(n)` — each step moves one pointer.
- Space `O(1)`.

## Alternatives to mention

- Try every pair: `O(n²)` — too slow for `10^5`.

## Pitfalls

- Moving the taller line is the classic wrong greedy.
- This is **not** Trapping Rain Water: here only the two chosen lines matter, nothing in between holds water.
