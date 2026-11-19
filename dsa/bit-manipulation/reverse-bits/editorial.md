**Key idea:** treat the number as 32 bits in a queue. Take bits off the low end of `n` one at a time, and append each to the low end of `result`, pushing earlier bits up. After 32 steps, the first bit taken (`n`'s lowest) has been pushed to the top: the bits are reversed.

## Recognising the pattern

Rearranging the bits of a fixed-width integer is bit-by-bit processing with shifts, from the [Bit Manipulation](/problems/patterns/bit-manipulation) sheet. The two operations are "read the lowest bit" (`n & 1`, then shift `n` right) and "append a bit" (shift `result` left, then add the bit).

## Alternative: through an array of bits (shown below)

Write the 32 bits into an array, lowest first, using `% 2` and division by 2. That array, read from the start, is the reversed order, so rebuild the number from it with `result · 2 + bit`. That is the reference brute force below. Same `O(32)` work, with an array in the middle.

## Shift and append

1. `result = 0`.
2. Repeat 32 times:
   1. `result = result · 2 + (n & 1)`: shift left and append `n`'s lowest bit.
   2. `n = n >>> 1`: unsigned shift right, so the next bit is lowest.
3. Return `result`.

**Unsigned versus signed.** The answer can have bit 31 set (2147483648 for `n = 1`). In Java the method returns an `int`, so that value shows up as negative; in C++ it is a `uint32_t`. Here `result · 2` (instead of `<<`) keeps the value as an unsigned number. The unsigned right shift `>>>` (same in Java) stops a set top bit in the input from being copied in.

## Walkthrough

`n = 6` (binary `…0110`)

| step | n & 1 | result (binary) | n after |
| --- | --- | --- | --- |
| 1 | 0 | 0 | 3 |
| 2 | 1 | 1 | 1 |
| 3 | 1 | 11 | 0 |
| 4–32 | 0 | 11 followed by 29 zeros | 0 |

`11` followed by 29 zeros is `2^30 + 2^29 = 1610612736`.

## Complexity

- Both versions: 32 iterations, `O(1)`.
- Reversing by swapping halves with masks (16-bit halves, then bytes, nibbles, pairs, single bits) takes 5 steps; useful when called very often.

## Edge cases

- `n = 0`: 0.
- `n = 1`: `2^31`, which needs unsigned handling.
- All bits set except bit 0: all bits set except bit 31.

## Common mistakes

- Stopping when `n` becomes 0 instead of after exactly 32 steps, which loses the trailing zeros' shifts.
- An arithmetic right shift on a value with the top bit set, which keeps feeding 1s.
- Shifting `result` after the last bit, giving one shift too many.

## In the interview

- State that exactly 32 iterations are needed regardless of `n`.
- Likely follow-ups:
  - *Called millions of times?* Precompute reversed bytes in a 256-entry table and combine four lookups, or use the mask-and-swap method.
  - *Reverse only the significant bits?* Loop while `n > 0` instead of 32 times.
