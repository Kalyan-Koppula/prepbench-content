**Key insight:** `a ^ a = 0` and `a ^ 0 = a`, and XOR's order doesn't matter — XOR the whole array and every duplicate cancels, leaving the single value.

## Approach

Fold the array with `^`, starting from `0`. Return the accumulator.

Negative numbers are fine: XOR works on their two's-complement bits, and JS's 32-bit coercion is lossless for these magnitudes.

## Complexity

- Time `O(n)`, space `O(1)`.

## Alternatives to mention

- Hash map of counts: `O(n)` time, `O(n)` space.
- Hash set — add on first sight, delete on second; the leftover is the answer. `O(n)` space.
- `2 * sum(set(nums)) - sum(nums)`: `O(n)` space, and in other languages risks overflow.
- Sort and scan pairs: `O(n log n)`.

## Follow-ups

- Every other value appears **three** times: count each bit position mod 3 (or the `ones`/`twos` bitmask trick).
- **Two** values appear once: see Single Number III — split by a differing bit.
