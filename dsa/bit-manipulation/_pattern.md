---
title: Bit Manipulation
order: 19
summary: XOR cancels pairs, n & (n - 1) drops a bit, masks pick bits — and JS quietly works in 32-bit signed ints.
---

## Recognise it

- "Every element appears twice except …", "find the missing / duplicate" with `O(1)` space.
- Counting set bits, powers of two, reversing or packing bits.
- "Without using `+` / `*` / `/`" — build arithmetic from `^`, `&`, `<<`.
- Subsets of a small set (`n <= 20`): a bitmask is the subset.

## Core identities

| Expression | Meaning |
|---|---|
| `a ^ a === 0`, `a ^ 0 === a` | XOR cancels pairs; order doesn't matter |
| `n & (n - 1)` | clears the lowest set bit |
| `n & -n` | isolates the lowest set bit |
| `(n >> i) & 1` | reads bit `i` |
| `n \| (1 << i)`, `n & ~(1 << i)` | sets / clears bit `i` |
| `n > 0 && (n & (n - 1)) === 0` | `n` is a power of two |

## Templates

```ts
// Count set bits (Kernighan): one iteration per 1-bit
let count = 0
while (n !== 0) {
  n &= n - 1
  count++
}
```

```ts
// Enumerate all subsets of k items
for (let mask = 0; mask < 1 << k; mask++) {
  for (let i = 0; i < k; i++) if (mask & (1 << i)) { /* item i is in */ }
}
```

## JS specifics

- `& | ^ ~ << >>` convert operands to **32-bit signed** integers. `2 ** 31 | 0 === -2147483648`; values above `2^32` lose high bits.
- `>>>` is the only unsigned operator: `x >>> 0` reinterprets the 32 bits as `0 … 2^32 - 1`. Use it to return unsigned results.
- `>>` is arithmetic (copies the sign bit); `>>>` shifts in zeros. On negative numbers, a `while (n !== 0) n >>= 1` loop never ends — use `>>>`.
- Shift counts are taken mod 32: `1 << 32 === 1`.
- For more than 32 bits use `BigInt` (`1n << 40n`) — bitwise ops work on `BigInt` too.

## Interview notes

- XOR solutions are `O(n)` time, `O(1)` space — the usual upgrade from a hash map; say both.
- When you split elements by a bit (single number III), explain why that bit separates the two answers.
- State the integer width you assume; interviewers probe negative inputs and overflow.

## Pitfalls

- Precedence: `a & b === 0` parses as `a & (b === 0)`. Always parenthesise.
- `n & 1` on a negative number still reads the low bit correctly, but `n % 2` returns `-1`.
- Forgetting `>>> 0` when a result has bit 31 set returns a negative number.
