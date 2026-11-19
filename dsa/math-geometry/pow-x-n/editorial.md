**Key idea:** binary exponentiation. Write `n` in binary; `x^n` is the product of `x^(2^k)` for every bit `k` that is set. Square the base each step (`x, x², x⁴, x⁸, …`) and multiply it into the result when the current bit of `n` is 1. That takes `O(log n)` multiplications instead of `n`. For negative `n`, compute `x^|n|` and take the reciprocal.

## Recognising the pattern

"Compute a power, with `n` up to `2^31`" rules out multiplying `n` times. Halving the exponent each step is the fast exponentiation trick from the [Math & Geometry](/problems/patterns/math-geometry) sheet. It also powers modular exponentiation and matrix powers.

## Alternative: recursive halving (shown below)

`x^n = (x^(n/2))²`, times one more `x` when `n` is odd. Compute the half once and square it. That is the reference brute force below: the same `O(log n)` multiplications, written top-down with `O(log n)` recursion depth.

Multiplying `x` by itself `n` times is `O(n)`: about two billion multiplications for the largest inputs.

## Iterative binary exponentiation

1. `exponent = |n|` (in a 64-bit integer: `−(−2^31)` doesn't fit in 32 bits).
2. `base = x`, `result = 1`.
3. While `exponent > 0`:
   - If `exponent` is odd: `result *= base`.
   - `base *= base`; `exponent = exponent / 2` (integer division).
4. Return `result`, or `1 / result` if `n < 0`.

**Why it works.** At every step, `result · base^exponent` equals the original `x^|n|`. An odd exponent moves one factor of `base` into `result`; squaring the base while halving the exponent keeps the product the same. When the exponent reaches 0, `result` holds everything.

## Walkthrough

`x = 2`, `n = 10` (binary 1010).

| exponent | odd? | result | base after squaring |
| --- | --- | --- | --- |
| 10 | no | 1 | 4 |
| 5 | yes | 4 | 16 |
| 2 | no | 4 | 256 |
| 1 | yes | 4 · 256 = 1024 | – |

Answer `1024`, with 4 squarings instead of 9 multiplications.

## Complexity

- Repeated multiplication: `O(n)`.
- Binary exponentiation, recursive or iterative: `O(log n)` time. Iterative uses `O(1)` space; recursive uses `O(log n)` stack.

## Edge cases

- `n = 0`: 1.
- Negative `n`: reciprocal (`0.5^−3 = 8`).
- `n = −2^31`: negating it overflows a 32-bit integer; widen first.
- `x = 0` with negative `n` is undefined; the problem's constraints exclude it.

## Common mistakes

- Overflow when negating the smallest 32-bit integer.
- Recursing twice per level (`pow(x, n/2) * pow(x, n/2)`), which is back to `O(n)`.
- Using a built-in power function in an interview that asks you to implement it.

## In the interview

- State the invariant `result · base^exponent = x^n`; it is the proof in one line.
- Likely follow-ups:
  - *`x^n mod m` for huge `n`?* The same loop with `% m` after each multiplication.
  - *Fibonacci in `O(log n)`?* Raise the matrix `[[1, 1], [1, 0]]` to the `n`th power with the same loop.
