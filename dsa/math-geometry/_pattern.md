---
title: Math & Geometry
order: 18
summary: Matrix index tricks, digit arithmetic and fast exponentiation — plus knowing where built-in numbers stop being exact.
---

## The idea

This pattern is a toolbox rather than a single technique. The problems look unrelated (rotating an image, multiplying huge numbers, counting squares), but they share one theme: **work out the arithmetic or the index mapping on paper first, then the code is short.** Most bugs here are off-by-one errors and overflow, not algorithmic mistakes.

Four tools cover the problems in this set:

1. **Index mappings for matrices.** Write down where cell `(r, c)` goes. A clockwise rotation of an `n × n` matrix sends it to `(c, n − 1 − r)`:

```
  before            after (clockwise)
  1  2  3            7  4  1
  4  5  6     →      8  5  2
  7  8  9            9  6  3

(0,0)=1 → (0,2)      (2,0)=7 → (0,0)
```

   Then split the mapping into simple steps (transpose, then reverse rows) or walk boundaries (spiral order).

2. **Digit arithmetic.** Numbers longer than a 64-bit integer are stored as digit arrays or strings. Add, subtract and multiply them the way you would on paper, with a carry. Extract digits of an ordinary integer with `x % 10` and `x / 10` (integer division).

3. **Fast exponentiation.** `x^n` in `O(log n)` multiplications by squaring the base and using the binary digits of `n`.

4. **Cycle detection on number sequences.** A sequence where each value depends only on the previous one, over finitely many values, must repeat. Floyd's two pointers find the repeat in `O(1)` space.

Know your number limits. A 32-bit signed integer holds up to about `2.1 · 10^9`; a 64-bit one about `9.2 · 10^18`. Double-precision floating point represents integers exactly only up to `2^53 ≈ 9 · 10^15`. Negating the smallest 32-bit integer overflows. When the inputs can exceed these, simulate with digits.

## When to reach for it

- A matrix must be rotated, transposed, flipped or traversed in a geometric order.
- Numbers are given as strings or digit arrays, or are too large for built-in integers.
- "Compute `x^n`", "modulo `10^9 + 7`", "last digit", "number of trailing zeros".
- A process repeatedly transforms a number and you must decide whether it ends or loops.
- Points on a grid, and the question counts shapes (squares, rectangles, lines).

Look-alikes:

| Statement says | What to use instead |
| --- | --- |
| Shortest path or flood fill on a grid | BFS or DFS ([Graphs](/problems/patterns/graphs)) |
| Count paths or minimise cost through a grid | Grid DP ([2-D Dynamic Programming](/problems/patterns/dp-2d)) |
| Operate on individual bits | [Bit Manipulation](/problems/patterns/bit-manipulation) |
| Overlapping ranges on a number line | [Intervals](/problems/patterns/intervals) |

## How it works

**Long multiplication by position.** Multiply `"12"` by `"34"` into an array of `m + n = 4` digits. The digit `num1[i]` times `num2[j]` belongs at index `i + j + 1`, carrying into `i + j`:

| i, j | product | lands at | digits |
| --- | --- | --- | --- |
| 1, 1 | 2 · 4 = 8 | 3 | 0 0 0 8 |
| 1, 0 | 2 · 3 = 6 | 2 | 0 0 6 8 |
| 0, 1 | 1 · 4 = 4 | 2 (6 + 4 = 10: write 0, carry 1) | 0 1 0 8 |
| 0, 0 | 1 · 3 = 3 | 1 (1 + 3 = 4) | 0 4 0 8 |

Drop the leading zero: `408`. The **invariant**: after each step, the array, read as a number, equals the sum of all partial products processed so far.

**Binary exponentiation.** For `2^10` (binary 1010), keep `result · base^exponent = 2^10` true at every step:

| exponent | result | base |
| --- | --- | --- |
| 10 | 1 | 2 |
| 5 | 1 | 4 |
| 2 | 4 | 16 |
| 1 | 4 | 256 |
| 0 | 1024 | – |

## Templates

### Rotate a square matrix clockwise in place

```ts
function rotateClockwise(matrix: number[][]): void {
  const n = matrix.length
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) { // transpose: only above the diagonal
      const temp = matrix[i][j]
      matrix[i][j] = matrix[j][i]
      matrix[j][i] = temp
    }
  }
  for (let i = 0; i < n; i++) { // reverse each row
    let left = 0
    let right = n - 1
    while (left < right) {
      const temp = matrix[i][left]
      matrix[i][left] = matrix[i][right]
      matrix[i][right] = temp
      left++
      right--
    }
  }
}
```

### Boundaries for layer-by-layer traversal

```ts
// top, bottom, left, right shrink inward after each side is read.
// Guard the third and fourth sides with top <= bottom and left <= right,
// so a single remaining row or column isn't read twice.
```

### Digits of an integer

```ts
function digitSum(x: number): number {
  let sum = 0
  while (x > 0) {
    sum += x % 10 // the last digit
    x = Math.floor(x / 10) // drop it
  }
  return sum
}
```

### Add two numbers stored as digit arrays (most significant first)

```ts
function addDigits(a: number[], b: number[]): number[] {
  const reversed: number[] = []
  let i = a.length - 1
  let j = b.length - 1
  let carry = 0
  while (i >= 0 || j >= 0 || carry > 0) {
    let sum = carry
    if (i >= 0) {
      sum += a[i]
      i--
    }
    if (j >= 0) {
      sum += b[j]
      j--
    }
    reversed.push(sum % 10)
    carry = Math.floor(sum / 10)
  }
  const result: number[] = []
  for (let k = reversed.length - 1; k >= 0; k--) {
    result.push(reversed[k])
  }
  return result
}
```

### Fast exponentiation (optionally modulo m)

```ts
function power(x: number, n: number): number {
  let result = 1
  let base = x
  let exponent = n
  while (exponent > 0) {
    if (exponent % 2 === 1) {
      result = result * base // add "% m" here for modular powers
    }
    base = base * base // and here
    exponent = Math.floor(exponent / 2)
  }
  return result
}
```

- With a modulus, keep values below `m` after every multiplication so products stay within 64 bits (or use a wider type when `m²` can overflow).

### Choosing a template

- Move cells of a matrix: write the **index mapping**, then decompose it.
- Visit a matrix in a geometric order: **boundaries**, or a direction array with a visited grid.
- Numbers longer than built-in types: **digit arrays with a carry**.
- Large powers: **fast exponentiation**.
- A repeated transformation of a number: **cycle detection**.

## Choosing the approach

| Problem | Tool | Key detail |
| --- | --- | --- |
| Plus One | Digit carry from the right | All 9s grow the array |
| Happy Number | Cycle detection | The sequence must repeat; Floyd or a set |
| Rotate Image | Index mapping | Transpose, then reverse rows |
| Spiral Matrix | Boundaries | Guard against a single remaining row or column |
| Pow(x, n) | Fast exponentiation | Widen before negating `n` |
| Multiply Strings | Positional long multiplication | `num1[i] · num2[j]` lands at `i + j + 1` |
| Detect Squares | Counting with a hash map | The diagonal corner fixes the square |

## Worked problems

**Rotate Image.** `(r, c) → (c, n − 1 − r)` is a transpose followed by a row reversal. Both are swaps, so the rotation is in place.

**Spiral Matrix.** Read the outer ring with four loops and shrink the boundaries; repeat. The two guards stop a leftover middle row or column being read twice.

**Pow(x, n).** Binary exponentiation in `O(log n)`. For negative `n`, use `|n|` (as a 64-bit value) and take the reciprocal.

**Happy Number.** The digit-square sum shrinks any large number, so the sequence enters a cycle. Floyd's tortoise and hare decide whether that cycle is `1 → 1`.

## Variations and tricks

- **GCD** by Euclid: `gcd(a, b) = gcd(b, a % b)`, `O(log min(a, b))`. LCM is `a / gcd(a, b) · b` (divide first to avoid overflow).
- **Primes up to n**: the Sieve of Eratosthenes in `O(n log log n)`.
- **Modular arithmetic**: take `% m` after every addition and multiplication; for subtraction add `m` before taking `% m`.
- **Trailing zeros of n!**: count factors of 5: `n/5 + n/25 + n/125 + …`.
- **Matrix exponentiation**: linear recurrences like Fibonacci in `O(log n)` by raising a small matrix to a power.
- **Geometry with integers**: compare squared distances, and use cross products instead of slopes, to avoid floating point.

## Complexity

- Matrix transformations and traversals: `O(m · n)`, usually `O(1)` extra space.
- Digit arithmetic: `O(digits)` for addition, `O(m · n)` for schoolbook multiplication.
- Fast exponentiation: `O(log n)` multiplications.
- Cycle detection: proportional to the length of the tail plus the cycle.

## Pitfalls

- Overflow: negating `−2^31`, multiplying two large ints before taking a modulus.
- Floating-point equality checks; compare integers, or allow a tolerance.
- Off-by-one in boundary loops and index mappings; test with `1 × 1`, `1 × n` and `n × 1`.
- Leading zeros in digit results ("0408", or "0" × anything).
- Transposing with `j` starting at 0, which swaps everything back.

## Practice ladder

1. [Plus One](/problems/plus-one): carrying through a digit array.
2. [Happy Number](/problems/happy-number): cycle detection on a number sequence.
3. [Rotate Image](/problems/rotate-image): an index mapping as two reflections.
4. [Spiral Matrix](/problems/spiral-matrix): shrinking boundaries.
5. [Pow(x, n)](/problems/pow-x-n): binary exponentiation.
6. [Multiply Strings](/problems/multiply-strings): long multiplication by position.
7. [Detect Squares](/problems/detect-squares): counting shapes with a hash map.
