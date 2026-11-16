**Key insight:** schoolbook multiplication with a fixed result array — the product of `num1[i]` and `num2[j]` contributes to positions `i + j` (carry) and `i + j + 1` (ones digit) of an `m + n`-slot array.

## Approach

1. Handle `"0"` up front so you never have to strip an all-zero result.
2. Allocate `digits` of length `m + n`, all zeros.
3. For `i` from the right of `num1` and `j` from the right of `num2`: add `a * b` to `digits[i + j + 1]`, keep its last digit there and push the carry into `digits[i + j]`.
4. The result has `m + n` or `m + n - 1` digits; drop a single leading zero and join.

Carries in `digits[i + j]` may temporarily exceed `9`; they get normalised when that slot becomes `i + j + 1` for a later `j`, or (for the leftmost slot) never exceed `9` because the product fits in `m + n` digits.

## Complexity

- Time `O(m · n)` — one multiply-add per digit pair.
- Space `O(m + n)` for the result.

## Alternatives to mention

- Multiply `num1` by each digit of `num2`, shift, and add the partial strings — same `O(m · n)` but more string handling.
- Karatsuba (`O(n^1.585)`) exists for huge inputs; mention, don't implement.
- `BigInt(num1) * BigInt(num2)` is the one-liner the problem forbids.

## Pitfalls

- `parseInt` on 200-digit strings silently loses precision past `2^53`.
- Stripping leading zeros with a regex on `"0"` products returns an empty string — the early return avoids that.
