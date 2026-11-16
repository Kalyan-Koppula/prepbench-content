**Key insight:** every palindromic substring is "some centre, expanded some distance", so counting successful expansions over all `2n - 1` centres counts each palindrome exactly once.

## Approach 1 — interval DP

- **State:** `pal[i][j]` = `s[i..j]` is a palindrome.
- **Recurrence:** `pal[i][j] = s[i] === s[j] && (j - i < 2 || pal[i + 1][j - 1])`.
- **Base cases:** length-1 substrings are palindromes; length-2 ones are if both characters match (folded into `j - i < 2`).
- **Order:** by increasing length, or `i` from `n - 1` down to `0` with `j` from `i` up — so `pal[i+1][j-1]` is ready.
- **Answer:** the number of `true` cells. `O(n²)` time and space.

## Approach 2 — expand around centres (space-optimised)

1. For each index, expand the odd centre `(i, i)` and the even centre `(i, i + 1)`.
2. Each iteration where `s[lo] === s[hi]` is one more palindrome — increment and widen.
3. Stop at the first mismatch: a wider window around the same centre can't be a palindrome if this one isn't.

The DP only ever reads along diagonals radiating from a centre, which the expansion walks directly — so the table disappears.

## Complexity

- Time `O(n²)` worst case (all-equal strings); typical strings stop expanding quickly.
- Space `O(1)`.

## Alternatives to mention

- Brute force: test all `n(n+1)/2` substrings in `O(n)` each — `O(n³)`.
- Manacher's algorithm gives the radius at every centre in `O(n)`, and the count follows directly from the radii.

## Pitfalls

- Missing even-length centres undercounts `"abba"` (no `bb`, no `abba`).
- Counting distinct palindromes is a different problem — here duplicates at different positions all count.
