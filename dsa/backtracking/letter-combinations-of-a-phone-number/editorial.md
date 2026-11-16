**Key insight:** the digits are independent choices, so the answer is the cartesian product of their letter sets. Backtracking over the digit index generates it directly.

## Approach

1. Handle `digits === ""` up front — return `[]`, not `[""]`.
2. `backtrack(i)`: if `i === digits.length`, record the current string. Otherwise, for each letter mapped to `digits[i]`, append it, recurse with `i + 1`, remove it.

### Iterative variant

Start from `[""]`; for each digit, replace the list with every existing string extended by each of the digit's letters. Same output, no recursion.

## Complexity

- Time `O(n · 4^n)`: up to `4^n` strings (digits `7` and `9` have four letters), each of length `n`.
- Space `O(n)` recursion depth, excluding the output.

## Pitfalls

- Returning `[""]` for empty input — the expected answer is an empty list.
- Building the string with `+=` on a shared variable and forgetting to undo it; a `path` array (or passing `prefix + ch` down as an argument) avoids that.
