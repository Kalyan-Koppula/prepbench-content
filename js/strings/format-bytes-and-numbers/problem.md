---
title: Format numbers and byte sizes
difficulty: Medium
order: 10
tags: [strings, numbers, rounding, formatting]
frequency: medium
exports: [formatNumber, formatBytes]
hints:
  - "`(1.005).toFixed(2)` is `'1.00'` because 1.005 is stored as 1.00499999…. Shift the decimal point in the string instead: `Number(Math.round(Number(abs + 'e' + d)) + 'e-' + d)`."
  - Round the absolute value, then format it, then add the sign back only if the rounded value isn't zero.
  - "For bytes, pick the unit by dividing by 1024 until the value is below 1024. After rounding, check whether it reached 1024 and move up one unit if so."
---

Implement two formatting helpers without `Intl` or `toLocaleString`.

### `formatNumber(value, decimals?)`

- Groups the integer part in threes with commas: `1234567.5` gives `'1,234,567.5'`.
- Without `decimals`, keeps the digits of `String(value)` after the point as they are.
- With `decimals` (an integer from 0 to 10), rounds to exactly that many places and pads with zeros: `formatNumber(1234.5, 2)` gives `'1,234.50'`.
- **Rounding** is half away from zero, applied to the number **as it is written in decimal** (its shortest `String(value)` form), not to its binary approximation. So `formatNumber(1.005, 2)` is `'1.01'`, `formatNumber(2.5, 0)` is `'3'` and `formatNumber(-2.5, 0)` is `'-3'`.
- The result never shows a minus sign for zero: `formatNumber(-0.004, 2)` is `'0.00'`.

### `formatBytes(bytes, decimals = 1)`

- Uses binary units: 1 KB = 1024 B. Units are `B`, `KB`, `MB`, `GB`, `TB`, `PB`.
- Picks the **largest unit in which the value is at least 1** (anything below 1024 bytes stays in `B`; values beyond PB stay in PB).
- Rounds the value to `decimals` places with the same rule as `formatNumber`, then formats it with `formatNumber` **without** padding, so trailing zeros disappear: `'1 KB'`, `'1.5 KB'`.
- If rounding produces 1024 (or more) of a unit, use the next unit instead: 1,048,575 bytes is `'1 MB'`, not `'1024 KB'`.
- Negative sizes keep their sign: `-1536` gives `'-1.5 KB'`.

```js
formatNumber(9876543.219, 2) // '9,876,543.22'
formatBytes(1234567)         // '1.2 MB'
formatBytes(1234567, 2)      // '1.18 MB'
formatBytes(512)             // '512 B'
```

## Notes

- Inputs are finite. For `formatNumber`, `value` is 0 or has a magnitude between `1e-6` and `1e15`, so `String(value)` never uses exponent notation. `bytes` is an integer.
