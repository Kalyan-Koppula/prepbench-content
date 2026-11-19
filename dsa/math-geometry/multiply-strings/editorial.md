**Key idea:** long multiplication, done directly into one array of `m + n` digits. The digit `num1[i]` times the digit `num2[j]` contributes to position `i + j + 1` (its ones digit) and carries into position `i + j`. Process digits from the right, add each product into place, and the array ends up holding the product's digits.

## Recognising the pattern

Arithmetic on numbers too long for built-in integers is digit simulation from the [Math & Geometry](/problems/patterns/math-geometry) sheet. The only real insight is the position formula: where each digit-by-digit product lands.

## Alternative: partial products, then add (shown below)

Do it exactly as on paper: for each digit of `num2`, build the shifted partial product `num1 × digit`, then add it to a running total with a separate addition routine. That is the reference brute force below. Same `O(m · n)` time, more code and more temporary arrays.

Converting the strings to built-in numbers fails: inputs can have 200 digits.

## Position-indexed long multiplication

1. If either number is `"0"`, return `"0"`.
2. `digits` = `m + n` zeros (the product has at most `m + n` digits).
3. For `i` from `m − 1` down to 0, for `j` from `n − 1` down to 0:
   1. `sum = digits[i + j + 1] + num1[i] · num2[j]`.
   2. `digits[i + j + 1] = sum % 10`.
   3. `digits[i + j] += sum / 10` (integer division).
4. Skip a leading zero and join the digits.

**Why `i + j + 1`.** Counting from the right, `num1[i]` has place value `10^(m − 1 − i)` and `num2[j]` has `10^(n − 1 − j)`. Their product has place `10^(m + n − 2 − i − j)`, which is array index `i + j + 1` in an array of length `m + n` read left to right.

**Why `digits[i + j]` may exceed 9 temporarily.** It will be normalised when a later step (smaller `i + j`) adds into it and takes `% 10`, or it is the leading position.

## Walkthrough

`num1 = "12"`, `num2 = "34"`: `digits = [0, 0, 0, 0]`.

| i, j | product | position i+j+1 | digits after |
| --- | --- | --- | --- |
| 1, 1 | 2 · 4 = 8 | 3 | [0, 0, 0, 8] |
| 1, 0 | 2 · 3 = 6 | 2 | [0, 0, 6, 8] |
| 0, 1 | 1 · 4 = 4 | 2: 6 + 4 = 10 | [0, 1, 0, 8] |
| 0, 0 | 1 · 3 = 3 | 1: 1 + 3 = 4 | [0, 4, 0, 8] |

Skip the leading 0: `"408"`.

## Complexity

- Both approaches: `O(m · n)` time. Position-indexed: `O(m + n)` space.
- Karatsuba multiplication reaches about `O(n^1.58)`; worth naming, not coding.

## Edge cases

- Either input `"0"`: `"0"` (otherwise the result would have leading zeros).
- `"999" × "999"`: all `m + n = 6` digits used.
- Single digits: at most two result digits.

## Common mistakes

- Converting to built-in numbers.
- Wrong position formula (`i + j` for the ones digit).
- Leaving leading zeros in the result.

## In the interview

- Derive `i + j + 1` from place values on a tiny example.
- Likely follow-ups:
  - *Add Strings?* The adder from the brute force.
  - *Negative numbers?* Handle the signs separately and multiply the magnitudes.
