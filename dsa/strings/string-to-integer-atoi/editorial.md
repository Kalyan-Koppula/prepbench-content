**Key insight:** it's a linear scan through three phases — spaces, optional sign, digits — that stops at the first unexpected character. The only subtle part is overflow: clamp as soon as the magnitude exceeds the limit for the current sign.

## Approach

1. Skip spaces with an index `i`.
2. If `s[i]` is `+` or `-`, record the sign and advance once.
3. While `s[i]` is a digit: `value = value * 10 + digit`. If `value` exceeds `2^31 - 1` (positive) or `2^31` (negative), return the clamped bound immediately.
4. Return `sign * value`.

## Complexity

- Time `O(n)`, space `O(1)`.

## Pitfalls

- `"+-12"` → `0`: only one sign is allowed, and `-` is not a digit.
- `"  -0012a42"` → `-12`: leading zeros are fine, parsing stops at `a`.
- `"words 42"` → `0`: the first non-space character isn't a sign or digit.
- `" + 4"` → `0`: no spaces allowed between the sign and the digits.
- Clamp is asymmetric: `-2147483648` is representable, `2147483648` is not.
- In Java/C++, check overflow *before* the multiply (`value > (MAX - digit) / 10`). JS numbers are exact to `2^53`, so checking after each step is safe — but mention the fixed-width version; interviewers ask.
