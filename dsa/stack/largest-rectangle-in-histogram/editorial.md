**Key idea:** the best rectangle uses some bar as its height and stretches left and right until it hits a lower bar. Keep a stack of bar indices with increasing heights. When a lower bar arrives, every taller bar on the stack has found its right limit; its left limit is the bar just below it on the stack. Pop it and measure its rectangle.

## Recognising the pattern

For each bar you need the nearest lower bar on each side: "previous smaller" and "next smaller". Both come from one monotonic stack, the most important advanced tool in the [Stack](/problems/patterns/stack) sheet. This problem is the classic showcase, and it reappears inside Maximal Rectangle.

## Brute force

For each start bar, widen to the right while keeping the lowest bar seen, and compute `min × width` at each step. That is the reference brute force below.

Correct because every rectangle is "some range of bars at the height of its lowest bar". Time `O(n²)`, space `O(1)`.

## Optimal: increasing stack with a sentinel

1. Empty stack of indices, `best = 0`.
2. For `i` from 0 to `n` (one past the end), with `h = heights[i]`, or 0 at `i = n`:
   1. While the bar on top of the stack is at least as tall as `h`:
      - Pop it; call its height `height`.
      - The new top (or −1 if the stack is empty) is the nearest lower bar on the left.
      - `width = i − leftBound − 1`; update `best` with `height × width`.
   2. Push `i`.
3. Return `best`.

**Why the bounds are right.** The stack is increasing, so the element under a popped bar is the nearest bar to its left that is strictly lower: anything taller between them was popped earlier. The bar at `i` is the first bar to its right that is not taller, since the popped bar survived every earlier step.

**The sentinel.** A height-0 bar at `i = n` is lower than everything, so it pops every remaining bar and measures it. Without it you'd need a second loop after the scan.

## Walkthrough

`heights = [2, 1, 5, 6, 2, 3]`

| i | h | popped (height, width = i − left − 1) | area | best | stack after (indices) |
| --- | --- | --- | --- | --- | --- |
| 0 | 2 | – | | 0 | [0] |
| 1 | 1 | 2 (left −1, width 1) | 2 | 2 | [1] |
| 2 | 5 | – | | 2 | [1, 2] |
| 3 | 6 | – | | 2 | [1, 2, 3] |
| 4 | 2 | 6 (left 2, width 1); 5 (left 1, width 2) | 6, 10 | 10 | [1, 4] |
| 5 | 3 | – | | 10 | [1, 4, 5] |
| 6 | 0 | 3 (left 4, width 1); 2 (left 1, width 4); 1 (left −1, width 6) | 3, 8, 6 | 10 | [6] |

Answer `10`: height 5 over bars 2 and 3.

## Complexity

- Brute force: time `O(n²)`, space `O(1)`.
- Monotonic stack: time `O(n)`, each index pushed and popped once. Space `O(n)`.

## Edge cases

- A single bar: its own height.
- Increasing heights: nothing pops until the sentinel.
- Equal heights: popping on `>=` merges them; the last copy measures the full width.
- Zero-height bars: they split the histogram and pop everything before them.

## Common mistakes

- Using the popped bar's index as the left bound instead of the index below it on the stack.
- Forgetting the bars left on the stack at the end (no sentinel, no cleanup loop).
- Width `i − leftBound` instead of `i − leftBound − 1`.

## In the interview

- Start from "each rectangle is limited by its lowest bar", then: "for each bar I need the nearest lower bar on both sides".
- Draw the stack on the example; this problem is much easier to explain with a picture.
- Likely follow-ups:
  - *Largest rectangle of 1s in a binary matrix (Maximal Rectangle)?* Treat each row as the base of a histogram of consecutive 1s above it and run this algorithm per row: `O(rows · cols)`.
  - *Two-pass version?* Compute previous-smaller and next-smaller arrays separately, then take the max of `height × (right − left − 1)`.
