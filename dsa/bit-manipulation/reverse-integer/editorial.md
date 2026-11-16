**Key insight:** build the reversed number digit by digit, and guard each `rev * 10 + digit` step by comparing `rev` with `limit / 10` *before* multiplying — that's how you detect 32-bit overflow without a wider type.

## Approach

1. Pop: `digit = x % 10`, `x = Math.trunc(x / 10)`. In JS, `%` keeps the sign of `x`, and `Math.trunc` rounds toward zero, so negatives just work.
2. Guard: with `MAX = 2147483647`, the push overflows iff `rev > 214748364`, or `rev === 214748364` and `digit > 7`. Symmetrically for `MIN = -2147483648`: `rev < -214748364`, or equal and `digit < -8`.
3. Push: `rev = rev * 10 + digit`.

In practice the "equal and digit > 7" branch can't trigger for valid inputs (the last pushed digit is the input's first digit, at most `2`), but writing the full check is what interviewers want to see.

## Complexity

- Time `O(log |x|)` — one iteration per digit (at most 10). Space `O(1)`.

## Alternatives to mention

- JS doubles hold the full reversed value exactly (it's at most ~`10^10`), so `reverse then range-check` would pass here — say so, then explain why it's off-limits in a strict 32-bit setting.
- String reversal (`String(Math.abs(x))`, reverse, re-sign): fine for a first sketch, same caveat.

## Pitfalls

- `Math.floor(x / 10)` on negatives rounds the wrong way (`Math.floor(-12 / 10) === -2`).
- `x | 0` or `~~x` to truncate works for 32-bit values but is a habit that breaks on larger numbers.
