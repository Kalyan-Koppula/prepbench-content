---
title: Math & Geometry
order: 18
summary: Matrix index tricks, digit arithmetic and fast exponentiation — plus knowing where JS numbers stop being exact.
---

## Recognise it

- 2D grid you must rotate, transpose or walk in a fixed shape (spiral, diagonal).
- Numbers given as digit arrays or strings, or "without converting to an integer".
- Powers, modular arithmetic, cycles in a sequence of numbers.
- Points on a grid: squares, lines, distances — usually hashing coordinates.

## Templates

```ts
// Rotate n x n clockwise in place: transpose, then reverse each row
for (let i = 0; i < n; i++)
  for (let j = i + 1; j < n; j++) [m[i][j], m[j][i]] = [m[j][i], m[i][j]]
for (const row of m) row.reverse()
```

```ts
// Fast exponentiation: O(log n) multiplications
function power(x: number, n: number): number {
  let result = 1
  for (let e = Math.abs(n); e > 0; e = Math.floor(e / 2)) {
    if (e % 2 === 1) result *= x
    x *= x
  }
  return n < 0 ? 1 / result : result
}
```

```ts
// Digits, least significant first
while (n > 0) {
  const d = n % 10
  n = Math.floor(n / 10)
}
```

## Matrix tricks

- Clockwise = transpose + reverse rows. Counter-clockwise = transpose + reverse columns (or reverse rows first, then transpose).
- Spiral / layer walks: keep four boundaries `top, bottom, left, right` and shrink one after each edge.
- Cell `(r, c)` in a flattened `rows x cols` grid is index `r * cols + c`.

## JS number notes

- `Number` is a 64-bit float: integers are exact only up to `2^53 - 1` (`Number.MAX_SAFE_INTEGER`). Products of two 9-digit numbers already exceed it.
- Use `BigInt` (`123n`) for exact big-integer arithmetic; it can't mix with `Number` without explicit conversion.
- Integer division: `Math.trunc(a / b)` rounds toward zero (C-style); `Math.floor` rounds toward −∞ and differs for negatives.
- `%` keeps the sign of the dividend: `-7 % 3 === -1`. For a positive modulo use `((a % m) + m) % m`.
- Bitwise operators truncate to 32-bit signed ints — don't use `x | 0` or `>> 1` on large values.

## Interview notes

- For "simulate digit arithmetic" problems, write the schoolbook algorithm; mention `BigInt` as the shortcut you're *not* allowed.
- Cycle detection on number sequences: a `Set` of seen values, or Floyd's fast/slow pointers for `O(1)` space.

## Pitfalls

- Off-by-one on spiral boundaries for single-row or single-column matrices.
- `n = -2^31` in power problems: negating overflows in 32-bit languages (fine in JS, say so).
- Floating-point results: compare with tolerance, don't round early.
