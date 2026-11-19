**Key idea:** the water above a bar is `min(tallest bar to its left, tallest bar to its right) - its height`. Two pointers walking inward from both ends can compute this without storing those maxima: always process the side whose current bar is lower, because that side's water level is already decided.

## Recognising the pattern

Each position's answer depends on the **maximum on each side**. Computing those maxima from scratch per position is quadratic; storing them in two arrays is linear but uses memory. The constant-space version is the opposite-ends variant of the [Two Pointers](/problems/patterns/two-pointers) sheet, with a running maximum on each side. (A monotonic stack also works; see the follow-ups.)

## Brute force

For every bar `i`, scan left for the tallest bar in `0..i` and right for the tallest in `i..n-1`, then add `min(leftTallest, rightTallest) - height[i]`. Including `i` itself in both scans keeps the result from going negative. That is the reference brute force below.

Correct by the formula. Time `O(n²)`, space `O(1)`.

## Better: precomputed maxima

Build `leftMax[i]` (tallest in `0..i`) in one left-to-right pass, and `rightMax[i]` (tallest in `i..n-1`) in one right-to-left pass. Then sum `min(leftMax[i], rightMax[i]) - height[i]`. Time `O(n)`, space `O(n)`. This is the easiest correct linear answer.

## Optimal: two pointers with running maxima

Keep `left`, `right`, and the running maxima `leftMax` (tallest in `0..left`) and `rightMax` (tallest in `right..n-1`).

1. `left = 0`, `right = n - 1`, `leftMax = rightMax = water = 0`.
2. While `left < right`:
   1. If `height[left] < height[right]`:
      - Update `leftMax` with `height[left]`.
      - Add `leftMax - height[left]` to `water`, then `left++`.
   2. Otherwise do the mirror on the right side.
3. Return `water`.

**Why the lower side is decided.** Suppose `height[left] < height[right]`. The true level at `left` is `min(tallest on its left, tallest on its right)`. The tallest on its left is exactly `leftMax`. The tallest on its right is at least `height[right]`, which is already greater than `height[left]`, and `leftMax` can't exceed `height[right]` either: whenever `leftMax` grew past the right side's current bar, the algorithm would have switched to moving the right pointer. So the minimum is `leftMax`, and the water at `left` is final.

## Walkthrough

`height = [4, 2, 0, 3, 2, 5]`

| left (h) | right (h) | lower side | leftMax | rightMax | water added | total |
| --- | --- | --- | --- | --- | --- | --- |
| 0 (4) | 5 (5) | left | 4 | 0 | 0 | 0 |
| 1 (2) | 5 (5) | left | 4 | 0 | 2 | 2 |
| 2 (0) | 5 (5) | left | 4 | 0 | 4 | 6 |
| 3 (3) | 5 (5) | left | 4 | 0 | 1 | 7 |
| 4 (2) | 5 (5) | left | 4 | 0 | 2 | 9 |

`left` reaches `right`, so the answer is `9`.

## Complexity

- Brute force: time `O(n²)`, space `O(1)`.
- Precomputed maxima: time `O(n)`, space `O(n)`.
- Two pointers: time `O(n)`, one pass. Space `O(1)`.

## Edge cases

- Fewer than three bars: no dip can hold water, so the answer is 0.
- Strictly increasing or decreasing heights: nothing is trapped.
- A flat profile: nothing is trapped.
- Two equal peaks with a valley between them: the valley fills to the peak height.

## Common mistakes

- Using the taller of the two sides as the level instead of the shorter.
- Processing the higher side, whose level isn't decided yet.
- Forgetting to update the running maximum before adding water, which can add a negative amount.
- Confusing this with Container With Most Water, where only two lines matter.

## In the interview

- Start from the per-bar formula. Interviewers like to see it before any optimisation.
- Offer the two-array solution, then the two-pointer version with the "lower side is decided" argument.
- Likely follow-ups:
  - *Monotonic stack version?* Keep indices of decreasing heights. When a taller bar arrives, pop and fill the water bounded by the new bar and the next one on the stack, layer by layer.
  - *2-D elevation map?* Use a min-heap over the boundary cells and grow inward (Trapping Rain Water II).
