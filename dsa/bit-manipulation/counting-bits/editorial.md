**Key insight:** every number's bit count is a smaller number's count plus at most one, so fill the table in order — a tiny DP.

## Approach

`bits[0] = 0`, then for `i = 1 … n`: `bits[i] = bits[i >> 1] + (i & 1)`.

`i >> 1` drops the lowest bit (always smaller than `i`, so it's already filled), and `i & 1` adds that bit back if it was `1`.

Two other recurrences work just as well — know one, mention another:

- `bits[i] = bits[i & (i - 1)] + 1` — remove the lowest set bit.
- `bits[i] = bits[i - offset] + 1` where `offset` is the largest power of two `<= i`.

## Complexity

- Time `O(n)` — constant work per entry.
- Space `O(1)` beyond the output array.

## Alternatives to mention

- Popcount each `i` independently (Kernighan loop): `O(n log n)` time — the baseline the follow-up asks you to beat.

## Pitfalls

- The output has `n + 1` entries, including `0`.
