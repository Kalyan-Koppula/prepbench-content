**Key idea:** pop digits off the end of `x` with `% 10` and push them onto `reversed` with `reversed · 10 + digit`. The only difficulty is the 32-bit limit: you may not store anything larger, so check **before** each push whether `reversed · 10 + digit` would leave the range, and return 0 if it would.

## Recognising the pattern

Digit-by-digit number manipulation with an overflow guard is a recurring interview check from the [Math & Geometry](/problems/patterns/math-geometry) and [Bit Manipulation](/problems/patterns/bit-manipulation) sheets. The same guard appears in String to Integer (atoi).

## Alternative: reverse in a wider type (shown below)

Reverse the digits into a 64-bit integer, which can't overflow for a reversed 32-bit value, then compare with the 32-bit range once at the end. That is the reference brute force below. Simple and correct, but the problem says to assume no 64-bit storage, which is why the guard exists.

## Pop, check, push

1. `reversed = 0`.
2. While `x ≠ 0`:
   1. `digit = x % 10` (negative when `x` is negative, in languages where `%` follows the dividend's sign).
   2. `x = x / 10`, rounding toward zero.
   3. If `reversed > MAX / 10`, or `reversed = MAX / 10` and `digit > 7`: return 0.
   4. If `reversed < MIN / 10`, or `reversed = MIN / 10` and `digit < −8`: return 0.
   5. `reversed = reversed · 10 + digit`.
3. Return `reversed`.

**Where 7 and −8 come from.** `MAX = 2147483647` ends in 7 and `MIN = −2147483648` ends in 8. If `reversed` equals `214748364`, the next digit decides whether the result fits.

**Signs come for free.** With truncating division and a sign-following `%`, digits of a negative `x` are negative, so `reversed` stays negative without special handling.

## Walkthrough

`x = 2048`

| digit | x after | reversed |
| --- | --- | --- |
| 8 | 204 | 8 |
| 4 | 20 | 84 |
| 0 | 2 | 840 |
| 2 | 0 | 8402 |

Answer `8402`. For `1999999999`, after nine digits `reversed = 999999999`, which is greater than `214748364`, so pushing the last digit would overflow: return `0`.

## Complexity

- Both versions: `O(log |x|)` time (one step per digit), `O(1)` space.

## Edge cases

- Trailing zeros: `−450` becomes `−54`.
- `x = 0`: 0.
- `−2147483648`: its reverse overflows, so 0.
- Results just inside the range, like `1463847412`, are allowed.

## Common mistakes

- Checking for overflow **after** the multiplication, when the value has already wrapped around.
- Using floor division for negatives, which gives wrong digits (`−7 / 10` must be 0, not −1).
- Taking the absolute value of `−2^31`, which overflows in 32 bits.

## In the interview

- Write the guard first and explain the 7 and 8.
- Likely follow-ups:
  - *String to Integer (atoi)?* The same guard while parsing characters, plus signs and whitespace.
  - *Palindrome Number?* Reverse half of the digits and compare, which avoids overflow entirely.
