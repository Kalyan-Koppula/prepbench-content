**Key insight:** the characters you keep at the start form the longest **palindromic prefix** `P` of `s`. Everything after it (`rest`) must be mirrored in front: the answer is `reverse(rest) + s`. Finding `P` is a string-matching problem: it's the longest prefix of `s` that equals a suffix of `reverse(s)`.

## Approach

1. Build `t = s + '#' + reverse(s)`. The `#` stops a match from spanning both halves.
2. Compute the KMP prefix function (`lps`) of `t`. `lps[t.length - 1]` is the length `k` of the longest prefix of `s` that is also a suffix of `reverse(s)` — i.e. the longest palindromic prefix.
3. Return `reverse(s.slice(k)) + s`.

Example: `s = "race"`. The longest palindromic prefix is `"r"`, so prepend `reverse("ace") = "eca"` → `"ecarace"`.

## Complexity

- Time `O(n)` — building `t` and its prefix function are linear.
- Space `O(n)` — `t` and the `lps` array.

## Alternatives to mention

- Brute force: for `k` from `n` down to `0`, test whether `s[0..k)` is a palindrome — `O(n²)`. Easy to state; too slow for `5 · 10^4` adversarial inputs like `"aaaa…ab…"`.
- Rolling hash: maintain forward and backward hashes of each prefix and record the longest prefix whose hashes agree. `O(n)` expected; needs care with collisions.
- Manacher's algorithm also finds palindromic prefixes in `O(n)`, but it's heavier to write in an interview.

## Pitfalls

- Without the separator, `lps` can exceed `n` for strings like `"aaa"`.
- Empty input returns `""`.
