---
title: 0.1 + 0.2
difficulty: Easy
order: 8
tags: [numbers, precision]
frequency: high
expected: |
  0.30000000000000004
  false
  0.30 string
  true
  true
  true
---

```js
const sum = 0.1 + 0.2

console.log(sum)
console.log(sum === 0.3)
console.log(sum.toFixed(2), typeof sum.toFixed(2))
console.log(Math.abs(sum - 0.3) < Number.EPSILON)
console.log(0.5 + 0.25 === 0.75)
console.log(9007199254740992 === 9007199254740993)
```

## Explanation

Numbers are 64-bit binary floating point.

1. `0.1` and `0.2` have no exact binary representation, so their sum is the nearest double to 0.3 plus a little: `0.30000000000000004`.
2. That's not the same double as `0.3`: `false`.
3. `toFixed(2)` rounds for display and returns a **string**: `0.30 string`.
4. The usual comparison is "close enough": the difference is smaller than `Number.EPSILON`, so `true`.
5. `0.5` and `0.25` are powers of two, which binary represents exactly, so this sum is exact: `true`.
6. Above `Number.MAX_SAFE_INTEGER` (2^53 − 1), not every integer is representable. `9007199254740993` rounds to `9007199254740992` when parsed: `true`.

Rule to remember: compare decimals with a tolerance (or work in integer cents), and use `BigInt` beyond 2^53.
