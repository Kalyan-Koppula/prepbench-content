**Key idea:** add 1 the way you would on paper, starting from the last digit. A digit below 9 just goes up by one and you are done. A 9 becomes 0 and passes a carry to the left. If the carry runs off the front (every digit was 9), the answer is a 1 followed by zeros.

## Recognising the pattern

Arithmetic on numbers stored as digit arrays or strings, too long for built-in integers, is digit-by-digit simulation with a carry, from the [Math & Geometry](/problems/patterns/math-geometry) sheet. [Multiply Strings](/problems/multiply-strings) uses the same idea with more bookkeeping.

## Alternative: general addition (shown below)

Write a full schoolbook adder for two digit arrays and use it to add `[1]`. Walk both arrays from the right, add the digits and the carry, write `sum % 10`, carry `sum / 10`, then reverse the result. That is the reference brute force below. Correct and `O(n)`, just more general than needed.

Converting the digits to a built-in number and back fails for long inputs: 100 digits overflow 64-bit integers, and floating-point numbers lose exactness past about 16 digits.

## Carry from the right

1. Copy the digits.
2. For `i` from the last index down to 0:
   - If `digits[i] < 9`: increment it and return.
   - Otherwise set it to 0 and continue (the carry moves left).
3. If the loop finishes, every digit was 9: return `[1, 0, 0, …, 0]` with one more digit than the input.

**Why the early return.** Once a digit absorbs the carry without overflowing, nothing to its left changes.

## Walkthrough

`digits = [1, 2, 9]`

| i | digit | action | digits after |
| --- | --- | --- | --- |
| 2 | 9 | becomes 0, carry | [1, 2, 0] |
| 1 | 2 | becomes 3, stop | [1, 3, 0] |

Answer `[1, 3, 0]`. For `[9, 9]`, both digits become 0 and the result grows to `[1, 0, 0]`.

## Complexity

- `O(n)` time in the worst case (all 9s), `O(1)` on average. `O(n)` space for the result.

## Edge cases

- `[0]`: `[1]`.
- All 9s: the array grows by one.
- A single 9: `[1, 0]`.

## Common mistakes

- Converting to a number and back, which overflows.
- Forgetting the all-9s case, returning `[0, 0]` for `[9, 9]`.
- Continuing the loop after the carry has been absorbed.

## In the interview

- Mention the overflow problem with conversion; it is why the problem exists.
- Likely follow-ups:
  - *Add two digit arrays?* The general adder shown in the brute force.
  - *Digits stored in a linked list?* Reverse it, add, reverse back; or recurse to the end and return the carry.
  - *Subtract one?* The mirror image: borrow from the left past every 0, then drop a leading zero.
