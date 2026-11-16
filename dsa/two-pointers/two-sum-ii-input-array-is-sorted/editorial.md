**Key insight:** with `l` at the smallest and `r` at the largest value, a sum that's too small means `numbers[l]` can't pair with anything (it's already paired with the max), so drop it; too large means `numbers[r]` can't pair with anything, so drop it.

## Approach

1. `l = 0`, `r = n - 1`.
2. While `l < r`: compute `sum`. Equal → return `[l + 1, r + 1]`. Less → `l++`. Greater → `r--`.

Each step discards one value that provably can't be in the answer, so the loop never skips the solution.

## Complexity

- Time `O(n)` — each pointer moves at most `n` times.
- Space `O(1)`.

## Alternatives to mention

- Hash map as in the unsorted Two Sum: `O(n)` time but `O(n)` space — ignores the sorted order and breaks the space requirement.
- For each element, binary-search its complement: `O(n log n)` time, `O(1)` space.

## Pitfalls

- Indices are 1-based.
- Duplicates are fine: `[2, 2]` with target `4` → `[1, 2]`.
