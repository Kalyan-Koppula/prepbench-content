**Key insight:** XOR together every number from `0` to `n` and every element of `nums`. Each present value appears twice and cancels; the missing value appears once and survives.

## Approach

1. Seed `acc = n` (the one index value the loop won't produce).
2. For each `i`, `acc ^= i ^ nums[i]`.
3. Return `acc`.

## Complexity

- Time `O(n)`, space `O(1)`.

## Alternatives to mention

- **Gauss sum:** `n * (n + 1) / 2 - sum(nums)`. Equally `O(1)` space; in fixed-width languages the sum can overflow for large `n` (XOR can't). With `n <= 10^4` it's safe in JS.
- Hash set of values, then scan `0..n`: `O(n)` space.
- Sort and find the first `i` with `nums[i] !== i`: `O(n log n)`.
- Cyclic sort (place each value at its index) — `O(n)` time, `O(1)` space, but mutates the input.

## Pitfalls

- Forgetting the seed `n`: if the missing value is `n` itself, the loop alone returns `0`.
