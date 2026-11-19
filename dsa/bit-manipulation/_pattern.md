---
title: Bit Manipulation
order: 19
summary: XOR cancels pairs, n & (n - 1) drops a bit, masks pick bits — working directly on the binary form of integers.
---

## The idea

Integers are stored as fixed-width strings of bits. Bit manipulation works on those bits directly, with operators that run in a single machine instruction. A handful of identities, each easy to check on a small example, solve a surprising number of problems in `O(1)` extra space.

The operators:

| Operator | Meaning | Example (4-bit) |
| --- | --- | --- |
| `a & b` | 1 where both are 1 | `1100 & 1010 = 1000` |
| `a \| b` | 1 where either is 1 | `1100 \| 1010 = 1110` |
| `a ^ b` | 1 where they differ | `1100 ^ 1010 = 0110` |
| `~a` | flip every bit | `~1100 = 0011` |
| `a << k` | shift left, fill with 0 (× 2^k) | `0011 << 2 = 1100` |
| `a >> k` | shift right, copy the sign bit | `1100 >> 1 = 1110` (signed) |
| `a >>> k` | shift right, fill with 0 (unsigned) | `1100 >>> 1 = 0110` |

The identities you will use again and again:

```
x ^ x = 0        x ^ 0 = x        XOR is order-independent   → pairs cancel
x & (x - 1)      clears the lowest set bit                   → count bits, test powers of 2
x & -x           keeps only the lowest set bit               → pick a distinguishing bit
(x >> k) & 1     reads bit k
x | (1 << k)     sets bit k
x & ~(1 << k)    clears bit k
```

**Two's complement.** Negative numbers are stored so that addition works the same for all values: `−x = ~x + 1`. In 32 bits, `−1` is all ones and the range is `−2^31` to `2^31 − 1`. The top bit is the sign. That is why `>>` (which copies the sign bit) and `>>>` (which fills with zeros) differ for negative numbers, and why `−(−2^31)` overflows.

## When to reach for it

- "Every element appears twice except…": XOR.
- "Without extra space" with integers, or "without `+`, `−`, `*`".
- Counting set bits, powers of two, reversing or rotating bits.
- Subsets of a small set (`n ≤ 20`): each subset is an integer mask.
- Flags packed into one integer (states in BFS, visited sets in bitmask DP).

Look-alikes:

| Statement says | What to use instead |
| --- | --- |
| Count occurrences of many different values | A hash map ([Arrays & Hashing](/problems/patterns/arrays-hashing)) |
| Digit operations in base 10 | [Math & Geometry](/problems/patterns/math-geometry) |
| Maximum XOR of two numbers | A bit trie ([Tries](/problems/patterns/tries)) |
| All subsets with pruning | [Backtracking](/problems/patterns/backtracking) |

## How it works

**XOR cancelling.** `[5, −2, 5, 9, 9]`: XOR everything. Because XOR works per bit and is addition modulo 2, the order doesn't matter, so the expression is `(5 ^ 5) ^ (9 ^ 9) ^ −2 = 0 ^ 0 ^ −2 = −2`.

**Clearing the lowest set bit.** Subtracting 1 turns the lowest 1 into 0 and every 0 below it into 1; ANDing with the original clears them all:

| n | n − 1 | n & (n − 1) |
| --- | --- | --- |
| 1011 | 1010 | 1010 |
| 1010 | 1001 | 1000 |
| 1000 | 0111 | 0000 |

Three steps, three set bits. The **invariant**: after `k` steps, `n` has lost exactly its `k` lowest set bits.

**Adding with bits.** `a ^ b` is the sum without carries; `(a & b) << 1` is the carries. Repeat until there are no carries. For `3 + 5`: `011 + 101` → `110` with carry `010` → `100` with carry `100` → `000` with carry `1000` → `1000` = 8.

## Templates

### XOR all values

```ts
function xorAll(nums: number[]): number {
  let result = 0
  for (let i = 0; i < nums.length; i++) {
    result ^= nums[i]
  }
  return result
}
```

### Count set bits

```ts
function countSetBits(n: number): number {
  let count = 0
  while (n !== 0) {
    n = n & (n - 1)
    count++
  }
  return count
}
```

- Terminates for negative numbers too, unlike a shift loop with `>>`.

### Walk the bits of a 32-bit value

```ts
function bitsLowestFirst(n: number): number[] {
  const bits: number[] = []
  for (let i = 0; i < 32; i++) {
    bits.push((n >> i) & 1)
  }
  return bits
}
```

### Split by a distinguishing bit

```ts
function twoSingles(nums: number[]): number[] {
  let both = 0
  for (let i = 0; i < nums.length; i++) {
    both ^= nums[i]
  }
  const diff = both & -both // lowest bit where the two singles differ
  let a = 0
  let b = 0
  for (let i = 0; i < nums.length; i++) {
    if ((nums[i] & diff) !== 0) {
      a ^= nums[i]
    } else {
      b ^= nums[i]
    }
  }
  return [a, b]
}
```

### Enumerate subsets with masks

```ts
function allSubsets(items: number[]): number[][] {
  const n = items.length
  const result: number[][] = []
  for (let mask = 0; mask < (1 << n); mask++) {
    const subset: number[] = []
    for (let i = 0; i < n; i++) {
      if (((mask >> i) & 1) === 1) {
        subset.push(items[i])
      }
    }
    result.push(subset)
  }
  return result
}
```

### Choosing a template

- Pairs cancel, one or two values left: **XOR all**, then **split** if two.
- How many 1s, or is it a power of two: **clear the lowest set bit**.
- Reverse, rotate or inspect positions: **walk the bits** with shifts and `& 1`.
- Small sets: **masks** as subsets or as DP states.

## Choosing the trick

| Problem | Trick | Why it works |
| --- | --- | --- |
| Single Number | XOR everything | Pairs cancel |
| Number of 1 Bits | `n & (n − 1)` | Removes one set bit per step |
| Counting Bits | `bits[i] = bits[i >> 1] + (i & 1)` | Shifting drops exactly the last bit |
| Reverse Bits | Read low bit, append to result, 32 times | Bits leave `n` in the reverse of the order they enter `result` |
| Missing Number | XOR indices and values | Every present number appears twice |
| Single Number III | XOR, then split by `x & −x` | The singles differ in that bit; pairs don't |
| Sum of Two Integers | XOR plus shifted AND, repeat | Sum without carry, plus carries |
| Reverse Integer | Pop and push digits with an overflow guard | Check before multiplying |

## Worked problems

**Single Number.** XOR all values; the result is the one without a partner. `O(n)` time, `O(1)` space.

**Counting Bits.** `i >> 1` is `i` without its last bit and is smaller, so its count is known: add `i & 1`. One pass, `O(n)`.

**Single Number III.** XOR gives `a ^ b`; its lowest set bit separates `a` from `b`. XOR each side of the split separately.

**Sum of Two Integers.** Loop `carry = (a & b) << 1; a = a ^ b; b = carry` until `b` is 0. With 32-bit integers it stops within 32 rounds.

## Variations and tricks

- **Power of two:** `n > 0 && (n & (n − 1)) === 0`. Power of four: also check the bit is in an even position (`n & 0x55555555`).
- **Bit counting per position:** for "every other number appears three times", count each bit modulo 3.
- **Gray code:** `i ^ (i >> 1)` gives sequences where neighbours differ in one bit.
- **Bitmask DP:** states like `dp[mask][i]` for travelling-salesman style problems with `n ≤ 20`.
- **Swapping without a temporary** (`a ^= b; b ^= a; a ^= b`) is a curiosity; a temporary variable is clearer.
- **Language differences:** Java has `>>>` and fixed 32/64-bit types; C++ has unsigned types; Python integers are unbounded, so mask with `& 0xFFFFFFFF` to emulate 32 bits; JavaScript's bitwise operators work on 32-bit signed integers.

## Complexity

- Each operator is `O(1)`.
- Loops over bit positions: `O(w)` for word size `w` (32 or 64), usually treated as `O(1)`.
- Mask enumeration: `O(2^n · n)`.

## Pitfalls

- Operator precedence: in most C-family languages `&`, `^` and `|` bind more loosely than `===` and `==`. Write `(x & mask) !== 0` with parentheses.
- Signed right shift on negative numbers, which never reaches zero in a "shift until 0" loop.
- Overflow at `−2^31` when negating or taking an absolute value.
- Testing a bit with `=== 1` after masking a bit other than bit 0 (`x & 4` is 4, not 1).
- Assuming results are unsigned when the language returns signed integers (and the reverse).

## Practice ladder

1. [Single Number](/problems/single-number): XOR cancels pairs.
2. [Number of 1 Bits](/problems/number-of-1-bits): clearing the lowest set bit.
3. [Counting Bits](/problems/counting-bits): a DP from shifts.
4. [Reverse Bits](/problems/reverse-bits): reading and writing bits one at a time.
5. [Missing Number](/problems/missing-number): XOR indices with values.
6. [Single Number III](/problems/single-number-iii): splitting by the lowest differing bit.
7. [Sum of Two Integers](/problems/sum-of-two-integers): an adder from XOR and AND.
8. [Reverse Integer](/problems/reverse-integer): digit reversal with an overflow guard.
