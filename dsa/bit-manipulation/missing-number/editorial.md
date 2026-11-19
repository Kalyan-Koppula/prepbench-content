**Key idea:** the array holds `n` distinct numbers from `0..n`, so exactly one is missing. XOR every index `0..n` together with every value. Each number that is present appears twice (once as an index, once as a value) and cancels; the missing number appears only as an index and is what remains.

## Recognising the pattern

"Find the one value missing from a complete range" is the XOR pairing trick from the [Bit Manipulation](/problems/patterns/bit-manipulation) sheet: make every present value appear an even number of times. The arithmetic alternative is `n(n + 1)/2 − sum`.

## Brute force

Mark which values are present in a boolean array of size `n + 1`, then return the unmarked one. That is the reference brute force below. `O(n)` time, `O(n)` space. Sorting and scanning for the first gap costs `O(n log n)`.

## XOR indices with values

1. `result = n` (the index that has no array position).
2. For each `i` from 0 to `n − 1`: `result ^= i`, `result ^= nums[i]`.
3. Return `result`.

**The sum formula.** `n(n + 1)/2 − sum(nums)` works too and is easy to explain. In 32-bit languages, the sum can overflow for large `n`; XOR never does.

## Walkthrough

`nums = [0, 2, 3]`, `n = 3`

| i | XOR in | result |
| --- | --- | --- |
| start | 3 | 3 |
| 0 | 0 and 0 | 3 |
| 1 | 1 and 2 | 3 ^ 1 ^ 2 = 0 |
| 2 | 2 and 3 | 0 ^ 2 ^ 3 = 1 |

Answer `1`. Overall the expression is `3 ^ 0 ^ 0 ^ 1 ^ 2 ^ 2 ^ 3`, where the 0s, 2s and 3s cancel.

## Complexity

- Boolean array: `O(n)` time and space.
- Sort and scan: `O(n log n)`.
- XOR or sum formula: `O(n)` time, `O(1)` space.

## Edge cases

- The missing number is `n` (all of `0..n − 1` present): the seed `n` survives.
- The missing number is 0.
- One element: `[1]` gives 0; `[0]` gives 1.

## Common mistakes

- Forgetting to include `n` itself in the XOR, which breaks the case where `n` is missing.
- Integer overflow with the sum formula in fixed-width types.
- Assuming the array is sorted.

## In the interview

- Offer the sum formula and XOR, and mention the overflow difference.
- Likely follow-ups:
  - *Two missing numbers?* XOR gives `a ^ b`; split by a differing bit like [Single Number III](/problems/single-number-iii).
  - *One duplicate and one missing (Set Mismatch)?* XOR or sums of values and squares, or mark visited indices by negating.
