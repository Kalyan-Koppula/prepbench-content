**Key idea:** build the string one character at a time and only make moves that keep it valid. You may add `(` while fewer than `n` are used, and `)` while there are more open than closed. Every complete string built this way is well-formed, and nothing invalid is ever generated.

## Recognising the pattern

"Return every string that satisfies a rule" means enumeration, which is backtracking. The rule here is a running balance, the same "never close more than you've opened" check that a [Stack](/problems/patterns/stack) of brackets enforces. With one bracket type, the stack collapses into two counters.

## Brute force

Generate all `2^(2n)` strings of length `2n` made of `(` and `)`, and keep the balanced ones: scan with a running balance that must never go negative and must end at 0. That is the reference brute force below.

Correct because it tests every possible string. Time `O(2^(2n) · n)`. For `n = 8` that is 65,536 strings, fine here but wasteful: most candidates are invalid long before they are complete.

## Optimal: backtracking with open and close counts

Track `open` (how many `(` placed) and `close` (how many `)` placed).

1. If the string has length `2n`, record it.
2. If `open < n`, recurse with `(` added.
3. If `close < open`, recurse with `)` added.
4. Start from the empty string with `open = close = 0`.

**Why every result is valid.** The rule `close < open` before adding `)` means no prefix ever has more closers than openers. Reaching length `2n` with `open ≤ n` and `close ≤ open` forces `open = close = n`. And every valid string is produced, because at each step the algorithm allows every character a valid string could have there.

## Walkthrough

`n = 2`. Each branch is `(string, open, close)`.

| step | state | options |
| --- | --- | --- |
| 1 | ("", 0, 0) | only `(` (close < open is false) |
| 2 | ("(", 1, 0) | `(` or `)` |
| 3a | ("((", 2, 0) | only `)` |
| 4a | ("(()", 2, 1) | only `)` → "(())" recorded |
| 3b | ("()", 1, 1) | only `(` |
| 4b | ("()(", 2, 1) | only `)` → "()()" recorded |

Answer `["(())", "()()"]`.

## Complexity

- Brute force: time `O(2^(2n) · n)`, space `O(n)` recursion depth plus the output.
- Backtracking: the number of results is the `n`-th Catalan number, about `4^n / (n^1.5)`. Each result costs `O(n)` to build, so time is `O(4^n / √n)`. Space `O(n)` recursion depth, plus the output.

## Edge cases

- `n = 1`: just `"()"`.
- The output grows fast: `n = 8` already gives 1,430 strings.

## Common mistakes

- Allowing `)` when `close < n` instead of `close < open`, which produces invalid strings like `")("`.
- Generating all strings and filtering, which explores far more than needed.
- Building strings with shared mutable state and forgetting to undo a character after recursing (not an issue when passing new strings, as here).

## In the interview

- State the two rules for adding each character, and why they guarantee validity.
- Mention that the count is a Catalan number. It shows you can analyse the output size.
- Likely follow-ups:
  - *Validate a given string?* One counter (Valid Parentheses with a single type).
  - *Several bracket types?* Use a stack of open types instead of a counter, and only close the type on top.
  - *Count them without listing?* Catalan numbers via DP: `C(0) = 1`, `C(n) = sum of C(i) · C(n − 1 − i)`.
