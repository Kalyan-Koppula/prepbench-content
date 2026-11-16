**Key insight:** binary addition splits into "sum without carry" (`a ^ b`) and "carry" (`(a & b) << 1`). Add those two the same way, repeatedly, until there's no carry left.

## Approach

1. While `b !== 0`:
   - `carry = (a & b) << 1`
   - `a = a ^ b`
   - `b = carry`
2. Return `a`.

Each round, the carry's lowest set bit moves at least one position left, so after at most 32 rounds it falls off the top of a 32-bit integer.

## Negative numbers

- In two's complement, the same bit-level adder handles negatives. JS bitwise ops work on 32-bit signed ints, so `-1 & 1`, shifts and XOR behave exactly as in C — and the loop terminates because carries eventually shift out of bit 31.
- In Python (unbounded ints) you'd need a `0xffffffff` mask and a final sign conversion; worth mentioning if asked about other languages.

## Complexity

- Time `O(1)` — bounded by the 32-bit width. Space `O(1)`.

## Alternatives to mention

- Recursive form: `getSum(a ^ b, (a & b) << 1)` with base case `b === 0`.
- Subtraction comes free: `a - b = getSum(a, getSum(~b, 1))`.
