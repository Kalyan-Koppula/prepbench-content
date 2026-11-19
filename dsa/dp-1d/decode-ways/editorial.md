**Key idea:** look at how a reading of the first `i` digits ends. Its last letter used either the last digit alone (valid if it isn't `0`) or the last two digits together (valid if they form 10 to 26). So `ways(i) = (last digit valid ? ways(i − 1) : 0) + (last two valid ? ways(i − 2) : 0)`.

## Recognising the pattern

Counting the ways to split a string into valid pieces, where each piece has one or two characters, is the Climbing Stairs recurrence with validity conditions, from the [1-D Dynamic Programming](/problems/patterns/dp-1d) sheet. The zeros are the whole difficulty.

## Brute force

Recursively cut a valid one- or two-digit code off the front and count the readings of the rest. That is the reference brute force below. Without memoisation it recomputes suffixes repeatedly and is exponential for long strings of 1s and 2s.

## Bottom-up with two variables

1. `twoBack = 1` (the empty prefix has one reading), `oneBack = 1` if `s[0]` isn't `0`, else 0.
2. For `i` from 2 to `n`:
   1. `current = 0`.
   2. If `s[i − 1]` isn't `0`, add `oneBack`.
   3. If the two digits `s[i − 2..i − 1]` form a number from 10 to 26, add `twoBack`.
   4. Shift the variables.
3. Return `oneBack`.

Requiring the pair to be **at least 10** rules out codes with a leading zero like `"06"`.

## Walkthrough

`s = "226"`

| i | last digit | one-digit? | last two | two-digit? | ways |
| --- | --- | --- | --- | --- | --- |
| 0 | – | – | – | – | 1 |
| 1 | 2 | – | – | – | 1 |
| 2 | 2 | yes (+1) | 22 | yes (+1) | 2 |
| 3 | 6 | yes (+2) | 26 | yes (+1) | 3 |

Answer `3`: `2 2 6` (BBF), `22 6` (VF), `2 26` (BZ).

## Complexity

- Plain recursion: exponential.
- Bottom-up: time `O(n)`, space `O(1)`.

## Edge cases

- Starts with `0`: no reading, 0.
- `"10"`: only `J`, 1 way; `"100"`: the second 0 can't be read, 0 ways.
- `"30"`: `0` alone is invalid and `30` is too big, so 0.
- Long strings of `1`s: the count grows like Fibonacci.

## Common mistakes

- Allowing `0` as a single-digit code.
- Accepting pairs like `"05"`.
- Initialising the empty prefix with 0 ways instead of 1.

## In the interview

- List the zero cases (`"0"`, `"10"`, `"30"`, `"100"`) before coding; they are where the bugs hide.
- Likely follow-ups:
  - *A `*` wildcard for any digit (Decode Ways II)?* The same recurrence with counts per case and a modulus.
  - *Return all decodings?* Backtracking; the count can be exponential.
