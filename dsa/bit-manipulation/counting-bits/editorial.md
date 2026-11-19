**Key idea:** reuse answers you already have. Shifting `i` right by one (`i >> 1`) drops its lowest bit and gives a smaller number whose count is already computed. So `bits[i] = bits[i >> 1] + (i & 1)`: the count of `i` without its last bit, plus that last bit.

## Recognising the pattern

"An answer for every number from 0 to n" invites a DP where each number builds on a smaller one, from the [1-D Dynamic Programming](/problems/patterns/dp-1d) sheet, with the relation coming from the [Bit Manipulation](/problems/patterns/bit-manipulation) sheet.

## Brute force

Count the bits of each number separately with the `x & (x − 1)` loop. That is the reference brute force below. `O(n log n)` time in the worst case (each number has up to `log n` set bits).

## DP on the shifted number

1. `bits[0] = 0`.
2. For `i` from 1 to `n`: `bits[i] = bits[i >> 1] + (i & 1)`.
3. Return `bits`.

**Another relation.** `bits[i] = bits[i & (i − 1)] + 1`: removing the lowest set bit gives a smaller number with one fewer set bit. Both relations are `O(1)` per number.

## Walkthrough

`n = 6`

| i | binary | i >> 1 | i & 1 | bits[i] |
| --- | --- | --- | --- | --- |
| 0 | 0 | – | – | 0 |
| 1 | 1 | 0 | 1 | 0 + 1 = 1 |
| 2 | 10 | 1 | 0 | 1 + 0 = 1 |
| 3 | 11 | 1 | 1 | 1 + 1 = 2 |
| 4 | 100 | 2 | 0 | 1 + 0 = 1 |
| 5 | 101 | 2 | 1 | 1 + 1 = 2 |
| 6 | 110 | 3 | 0 | 2 + 0 = 2 |

Answer `[0, 1, 1, 2, 1, 2, 2]`.

## Complexity

- Count each separately: `O(n log n)` time.
- DP: `O(n)` time, `O(n)` space for the output (no extra space beyond it).

## Edge cases

- `n = 0`: `[0]`.
- Powers of two: always 1.
- `2^k − 1`: always `k`.

## Common mistakes

- Using `i / 2` without integer division in languages where `/` is floating point; `i >> 1` avoids it.
- Allocating `n` instead of `n + 1` entries.

## In the interview

- Give the relation, then justify it with binary: shifting right removes exactly the last bit.
- Likely follow-ups:
  - *Without the DP?* Mention a built-in population count; interviewers usually want the relation.
  - *Total number of set bits from 1 to n, for huge n?* Count per bit position with a formula based on cycles of length `2^(k+1)`.
