**Key insight:** the hard part is not the commas, it is rounding. `toFixed` and `Math.round(x * 100) / 100` both round the *binary* value, so `1.005` (really `1.00499999999999989…`) rounds down. Shifting the decimal point in the string with exponent notation (`'1.005e2'`) gives an exact `100.5` to round.

## Approach

**`formatNumber`**

1. Work on `abs = Math.abs(value)`.
2. If `decimals` is given: `rounded = Number(Math.round(Number(abs + 'e' + d)) + 'e-' + d)`, then `text = rounded.toFixed(d)` (safe now, because `rounded` already has at most `d` decimals). Otherwise `text = String(abs)`.
3. Split on `.`, group the integer part with `/\B(?=(\d{3})+(?!\d))/g`.
4. Prefix `-` only if `value < 0` and `rounded !== 0`.

**`formatBytes`**

1. Move up units while `abs >= 1024 ** (unit + 1)`, capped at PB.
2. Round `abs / 1024 ** unit` with the same helper. If the result is `>= 1024` and a bigger unit exists, move up and round again.
3. Format the rounded number with `formatNumber(rounded)`; with no padding, `1.0` prints as `1`.

## Walkthrough

`formatBytes(1536)` and `formatNumber(1234567.891, 2)`:

| Call | Steps | Result |
| --- | --- | --- |
| `formatBytes(1536)` | 1536 ≥ 1024 → divide: 1.5 KB; below 1024, stop | `'1.5 KB'` |
| `formatNumber(1234567.891, 2)` | round half away from zero → 1234567.89; group the whole part in threes | `'1,234,567.89'` |

Rounding uses exponent notation (`Math.round(Number('1.005e2'))`) to avoid floating-point surprises like `(1.005).toFixed(2) === '1.00'`.

## Complexity

`O(digits)`.

## Edge cases to test

- 0 bytes, exact powers of 1024, the largest unit.
- Negative numbers and a negative result that rounds to 0 (no `-0`).
- Rounding at `.5` boundaries.
- Thousands grouping for 3, 4, 7 digits.
- Decimals omitted versus fixed.

## Pitfalls

- `toFixed` for rounding: `(1.005).toFixed(2) === '1.00'` and `(1.255).toFixed(2) === '1.25'`. `Math.round(x * 100) / 100` fails on `1.255` too.
- `Math.round` alone on negatives rounds half *up* (`Math.round(-2.5) === -2`); round the absolute value instead.
- Grouping before rounding: `999.5` must become `1,000`, so round first, then group.
- `Math.floor(Math.log(bytes) / Math.log(1024))` for the unit: it works for powers of two, but the same trick for decimal units breaks (`Math.log(1000) / Math.log(10)` is `2.9999999999999996`), and `log(0)` is `-Infinity`.
- Emitting `-0.00`: check the sign after rounding.
- Forgetting the 1024 carry and printing `1024 KB`.

## Follow-ups interviewers add

- **Use `Intl.NumberFormat`:** locale-aware separators (`1.234.567,5` in German) and compact notation (`1.2M`).
- **SI units:** 1 kB = 1000 B, with `KiB`/`MiB` for the binary ones; which does your OS show?
- **Exponent inputs:** support `1e21` and `1e-7` by expanding `String(value)` into plain digits first.
- **Banker's rounding** (half to even) for financial reports.

## In the interview

Mention `Intl.NumberFormat` (`new Intl.NumberFormat('en', { notation: 'compact' })`, `style: 'unit', unit: 'kilobyte'`), which handles locales; hand-written formatting is for when you can't use it or need exact control.
