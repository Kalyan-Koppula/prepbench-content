**Key insight:** binary exponentiation — write `n` in binary; `x^n` is the product of `x^(2^k)` over the set bits, and each `x^(2^k)` is the previous one squared. That's `O(log n)` multiplications instead of `n`.

## Approach

1. Work with `exp = |n|`, `base = x`, `result = 1`.
2. While `exp > 0`: if the low bit is set, `result *= base`; then `base *= base` and halve `exp`.
3. If `n` was negative, return `1 / result`.

Recursive version: `pow(x, n) = half * half * (n odd ? x : 1)` where `half = pow(x, floor(n / 2))` — `O(log n)` stack.

## Complexity

- Time `O(log |n|)` — one iteration per bit of `n`, at most 32.
- Space `O(1)` iterative, `O(log |n|)` recursive.

## Pitfalls

- **`n = -2^31`**: in Java/C++ `-n` overflows a 32-bit int. In JS numbers are doubles, so `Math.abs` is safe — say this out loud, it's a classic probe.
- Don't use `exp >>= 1` or `exp & 1` in JS: bitwise ops coerce to signed 32-bit and `2^31` becomes negative. Use `% 2` and `Math.floor(/ 2)` (or `>>>`).
- The naive loop multiplying `n` times is `O(n)` — up to two billion iterations.
- `x = 0` with negative `n` is excluded by the constraints (it would be division by zero).
