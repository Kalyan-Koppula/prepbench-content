**Key insight:** every maximal rectangle has some bar as its shortest. For bar `i`, the rectangle extends until the nearest shorter bar on each side, so its area is `heights[i] × (nextSmaller - prevSmaller - 1)`. A single increasing stack finds both boundaries.

## Approach

1. Keep a stack of indices with increasing heights.
2. At index `i` (with a height-`0` sentinel at `i = n`), pop while the top's height is `>= heights[i]`. For each popped bar:
   - `i` is its right boundary (first bar to its right that's not taller).
   - The new stack top is its left boundary (previous strictly shorter bar), or `-1` if the stack is empty.
   - Area = `height × (i - left - 1)`.
3. Push `i`. The sentinel guarantees every bar is popped and measured.

Popping on `>=` means equal bars are measured by the rightmost of the run, whose width correctly spans the whole run — the earlier ones get underestimates, which is harmless for a maximum.

## Complexity

- Time `O(n)` — each index is pushed and popped once.
- Space `O(n)` for the stack.

## Alternatives to mention

- Brute force: every pair `(i, j)` with a running minimum — `O(n²)`.
- Two passes computing `prevSmaller[]` and `nextSmaller[]` arrays, then one pass for areas — same complexity, easier to explain step by step.
- Divide and conquer around the minimum bar: `O(n log n)` average, `O(n²)` on sorted input.

## Follow-ups

- **Maximal Rectangle** in a 0/1 matrix: build a histogram per row (heights of consecutive 1s) and run this on each row — `O(rows × cols)`.
