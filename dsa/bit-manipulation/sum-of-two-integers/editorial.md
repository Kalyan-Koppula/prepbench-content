**Key idea:** binary addition without `+`. For each bit position, XOR gives the sum bit **ignoring carries**, and AND gives the positions that **produce a carry**, which then moves one place left. So `a + b = (a ^ b) + ((a & b) << 1)`. Repeat with those two values until there are no carries left.

## Recognising the pattern

"Add without `+`" is the hardware adder, from the [Bit Manipulation](/problems/patterns/bit-manipulation) sheet. It shows why XOR is "addition without carry" and AND is "carry".

## Alternative: a ripple-carry adder (shown below)

Add bit by bit from position 0 to 31, keeping a carry bit: each position's total is `bitA + bitB + carry`, its low bit goes into the result, and its high bit is the next carry. That is the reference brute force below. Always 32 steps.

## XOR and carry loop

1. While `b ≠ 0`:
   1. `carry = (a & b) << 1`.
   2. `a = a ^ b`.
   3. `b = carry`.
2. Return `a`.

**Why it terminates.** Each round, the carries move at least one position left. With 32-bit integers, after at most 32 rounds the carry shifts out entirely and becomes 0.

**Negative numbers.** Two's complement addition is the same bit operation as unsigned addition, so negatives need no special case in languages with fixed-width integers. In Python, whose integers are unbounded, you would mask to 32 bits each round.

## Walkthrough

`a = 3` (`011`), `b = 5` (`101`)

| round | a | b | a & b | carry | a ^ b |
| --- | --- | --- | --- | --- | --- |
| 1 | 0011 | 0101 | 0001 | 0010 | 0110 |
| 2 | 0110 | 0010 | 0010 | 0100 | 0100 |
| 3 | 0100 | 0100 | 0100 | 1000 | 0000 |
| 4 | 0000 | 1000 | 0000 | 0000 | 1000 |

`b = 0`, answer `1000₂ = 8`. The carry ripples through every bit, as the sample notes.

## Complexity

- Both versions: at most 32 iterations, `O(1)`.

## Edge cases

- `b = 0`: returns `a` immediately.
- Opposite numbers (`7 + −7`): carries ripple off the top and the result is 0.
- Negative sums: correct in two's complement.

## Common mistakes

- Updating `a` before computing the carry from the old `a`.
- Forgetting the shift on the carry.
- In unbounded-integer languages, looping forever on negative inputs because the carry never shifts out.

## In the interview

- Explain XOR as "sum without carry" and AND as "where carries come from".
- Likely follow-ups:
  - *Subtraction?* `a − b = a + (~b + 1)`, using the same adder.
  - *Multiplication without `*`?* Shift-and-add: for each set bit `k` of `b`, add `a << k`.
