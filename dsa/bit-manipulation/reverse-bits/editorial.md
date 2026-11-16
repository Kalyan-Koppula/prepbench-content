**Key insight:** shift bits out of the bottom of `n` and into the bottom of `result`; after 32 steps the first bit you moved has travelled to the top.

## Approach

1. `result = 0`.
2. Repeat 32 times: `result = (result << 1) | (n & 1)`, then `n >>>= 1`.
3. Return `result >>> 0`.

You must loop all 32 times, even once `n` is `0` — the remaining shifts move earlier bits into their final high positions.

## JS details

- `<<` and `|` produce **signed** 32-bit results, so after bit 31 is set `result` is negative. `>>> 0` reinterprets those same bits as unsigned.
- Shift `n` with `>>>`, not `>>`: inputs at or above `2^31` behave as negatives under `>>`, which would copy the sign bit in.

## Complexity

- Time `O(1)` — exactly 32 iterations. Space `O(1)`.

## Alternatives to mention

- Divide and conquer with masks: swap 16-bit halves, then 8-bit groups, 4, 2, 1 — five steps (`n = (n >>> 16) | (n << 16)`, then `((n & 0xff00ff00) >>> 8) | ((n & 0x00ff00ff) << 8)`, …).
- For the "called many times" follow-up: precompute the reversal of every byte (256 entries) and combine four lookups.
- String route (`toString(2).padStart(32, '0')`, reverse, `parseInt`) is a quick correctness check, not the expected answer.
