**Key idea:** start with the widest container, the first and last lines. The water level is capped by the shorter of the two lines, and that line can't do better with any narrower partner, so move it inward. Repeat until the pointers meet, tracking the best area.

## Recognising the pattern

You are choosing **two positions** to maximise a value that depends on both the distance between them and the smaller of their heights. Trying all pairs is quadratic. The opposite-ends variant of the [Two Pointers](/problems/patterns/two-pointers) sheet works here because every step can discard one line with a proof that it can't be part of a better answer.

## Brute force

Compute `(j - i) * min(height[i], height[j])` for every pair `i < j` and keep the maximum. That is the reference brute force below.

Correct because it checks every container. Time `O(n²)`, space `O(1)`. With `10^5` lines that is 5 billion pairs.

## Optimal: shrink from the shorter side

1. `left = 0`, `right = n - 1`, `best = 0`.
2. While `left < right`:
   1. `area = (right - left) * min(height[left], height[right])`; update `best`.
   2. If `height[left] < height[right]`, move `left` inward. Otherwise move `right` inward.
3. Return `best`.

**Why moving the shorter line is safe.** Say the left line is shorter. Pair it with any other line `k` between the pointers: the width `k - left` is smaller than `right - left`, and the level is at most `height[left]`, because the shorter line still caps it. So every remaining container that uses the left line is no better than the one just measured. The left line is finished, and dropping it loses nothing. Moving the **taller** line instead could discard a better container.

When the heights are equal, moving either one is safe: by the same argument, neither line can do better with a narrower partner.

## Walkthrough

`height = [1, 8, 6, 2, 5, 4, 8, 3, 7]`

| left (h) | right (h) | width | level | area | best | move |
| --- | --- | --- | --- | --- | --- | --- |
| 0 (1) | 8 (7) | 8 | 1 | 8 | 8 | left |
| 1 (8) | 8 (7) | 7 | 7 | 49 | 49 | right |
| 1 (8) | 7 (3) | 6 | 3 | 18 | 49 | right |
| 1 (8) | 6 (8) | 5 | 8 | 40 | 49 | right |
| 1 (8) | 5 (4) | 4 | 4 | 16 | 49 | right |
| 1 (8) | 4 (5) | 3 | 5 | 15 | 49 | right |
| 1 (8) | 3 (2) | 2 | 2 | 4 | 49 | right |
| 1 (8) | 2 (6) | 1 | 6 | 6 | 49 | right |

Answer `49`, between the lines at index 1 and 8.

## Complexity

- Brute force: time `O(n²)`, space `O(1)`.
- Two pointers: time `O(n)`, each step moves one pointer inward. Space `O(1)`.

## Edge cases

- Two lines: one container, measured once.
- A zero-height line: its containers have area 0, and it is always the shorter side, so it is dropped immediately.
- All heights equal: the widest container wins, measured first.
- Strictly increasing heights: the left pointer moves every time.

## Common mistakes

- Moving the taller line, which can skip the best container.
- Using the taller line's height as the water level.
- Confusing this with Trapping Rain Water: here only two lines hold water, and the lines in between don't matter.

## In the interview

- Give the brute force, then explain the "shorter line is finished" argument before coding. The proof is what's being tested.
- Likely follow-ups:
  - *Return the pair of indices?* Track them alongside `best`.
  - *Water trapped across all bars, not just two?* That is Trapping Rain Water: two pointers with running left and right maxima.
  - *Can you prune?* After moving, keep moving past lines no taller than the one you just dropped, since they can't help. Same complexity, fewer steps.
