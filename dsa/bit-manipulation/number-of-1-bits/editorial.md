**Key idea:** `n & (n − 1)` clears the **lowest set bit** of `n`. Subtracting 1 flips the lowest 1 to 0 and every 0 below it to 1; ANDing with the original wipes all of those. Repeat until `n` is 0 and count the steps: the loop runs once per set bit, not once per bit position.

## Recognising the pattern

Counting or removing set bits one at a time is the `n & (n − 1)` trick from the [Bit Manipulation](/problems/patterns/bit-manipulation) sheet. It also tests for powers of two (`n > 0` and `n & (n − 1) = 0`).

## Brute force

Check each of the 32 positions: `(n >> i) & 1`. That is the reference brute force below. Always 32 iterations, `O(1)` but with a constant of 32.

## Clear the lowest set bit

1. `count = 0`.
2. While `n ≠ 0`: `n = n & (n − 1)`, `count++`.
3. Return `count`.

**Why it works.** Write `n = …x1000` (the lowest 1 followed by zeros). Then `n − 1 = …x0111`. ANDing keeps the `…x` prefix and clears the rest, removing exactly one set bit.

## Walkthrough

`n = 11` (binary `1011`)

| n | n − 1 | n & (n − 1) | count |
| --- | --- | --- | --- |
| 1011 | 1010 | 1010 | 1 |
| 1010 | 1001 | 1000 | 2 |
| 1000 | 0111 | 0000 | 3 |

Answer `3`.

## Complexity

- Check every position: 32 iterations.
- Clear the lowest bit: one iteration per set bit, at most 32.
- Both `O(1)` for fixed-width integers; the second is faster for sparse bit patterns.

## Edge cases

- `n = 0`: 0.
- A power of two: 1, in a single iteration.
- All 31 low bits set: 31 iterations.

## Common mistakes

- In languages with signed integers, shifting a negative number right with an arithmetic shift (`>>`) fills with 1s and never reaches 0. Use the unsigned shift, or the `n & (n − 1)` loop, which always terminates.
- Converting to a binary string and counting characters: fine in practice, but it misses what the question is testing.

## In the interview

- Explain the `n − 1` borrow on a small example.
- Likely follow-ups:
  - *Is `n` a power of two?* `n > 0 && (n & (n − 1)) === 0`.
  - *Bits for every number from 0 to n?* [Counting Bits](/problems/counting-bits), in `O(n)` total.
  - *Many queries?* A lookup table for 8- or 16-bit chunks, adding the chunk counts.
