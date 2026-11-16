**Key insight:** put one pointer at each end; skip non-alphanumerics, compare the lowercased characters, and move both inward. No cleaned copy needed.

## Approach

1. `l = 0`, `r = s.length - 1`.
2. While `l < r`: advance `l` past non-alphanumerics, retreat `r` likewise (keeping `l < r`).
3. If `lower(s[l]) !== lower(s[r])`, return `false`; otherwise move both inward.
4. Return `true`.

## Complexity

- Time `O(n)` — each index is visited at most once by one of the pointers.
- Space `O(1)`.

## Alternatives to mention

- Build the filtered lowercase string and compare it with its reverse: `O(n)` time but `O(n)` extra space. Fine as a first pass; the two-pointer version is what's expected.

## Pitfalls

- Digits count — `"0P"` is **not** a palindrome.
- A regex like `/[a-z0-9]/i` per character is readable; a char-code check is faster. Either is fine — just don't forget digits.
- Inner skip loops need their own `l < r` guard or they run off the end on strings like `"!!!"`.
