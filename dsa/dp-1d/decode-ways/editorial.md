**Key insight:** the final letter of any reading consumes the last one or two digits, so the count for a prefix is the sum of the counts for the two shorter prefixes — when those last digits form a valid code.

## Approach

- **State:** `ways[i]` = number of readings of the prefix `s[0 … i-1]`.
- **Recurrence:**
  - if `s[i-1] !== '0'`, add `ways[i - 1]` (last letter is a single digit 1–9);
  - if `s[i-2 … i-1]` is `10`–`26`, add `ways[i - 2]` (last letter is two digits).
- **Base cases:** `ways[0] = 1` (empty prefix has one reading — the empty one), `ways[1] = s[0] === '0' ? 0 : 1`.
- **Order:** `i = 2 … n`; answer `ways[n]`.
- **Space optimisation:** only `ways[i-1]` and `ways[i-2]` are read — roll two variables.

Progression: the recursion `count(i) = count(i+1) + count(i+2)` (when valid) is Fibonacci-exponential on strings like `"1111…"`; memoise on `i`, tabulate, then roll.

## Complexity

- Time `O(n)`.
- Space `O(1)`.

## Pitfalls

- Zeros are the whole problem: `"0"` alone is never valid, `"10"`/`"20"` are, `"30"`…`"90"` and `"00"` kill every reading.
- Two-digit check must exclude leading zeros: `"06"` is not 6.
- `ways[0] = 1` feels odd but is what makes `"12"` count `1-2` **and** `12`.
- You may return `0` early once two consecutive `ways` values are `0` — nothing later can recover.
