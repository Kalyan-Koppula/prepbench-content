**Key idea:** you may only add characters in front, so the original string must end the palindrome. The best you can do is keep the **longest palindromic prefix** of `s` as the centre and mirror the rest in front of it. To find that prefix in linear time, build `s + '#' + reverse(s)` and compute the KMP `lps` value of the whole string: the longest prefix of `s` that matches a suffix of `reverse(s)` is exactly the longest palindromic prefix.

## Recognising the pattern

"Longest prefix that equals a suffix of something" is what the KMP failure function computes, from the [Strings](/problems/patterns/strings) sheet. This problem is a clever application: a prefix of `s` that reads the same reversed is a prefix of `s` that equals a suffix of `reverse(s)`.

## Brute force

Check prefixes from longest to shortest until one is a palindrome, then prepend the reverse of the remaining suffix. That is the reference brute force below. `O(n²)` in the worst case (for example `"aaaa…ab"`).

## KMP on the combined string

1. `reversed = reverse(s)`.
2. `combined = s + '#' + reversed`. The `#` is a character that doesn't occur in `s`; it stops a border from crossing the middle.
3. Compute `lps` for `combined`.
4. `k = lps[last]`: the length of the longest palindromic prefix.
5. Return `reversed[0 .. n − k) + s`.

**Why `reversed[0 .. n − k)`.** The first `n − k` characters of `reversed` are the last `n − k` characters of `s`, in reverse. Putting them in front mirrors the part of `s` that isn't already palindromic.

**Why the separator.** Without it, for `s = "aa"` the combined string `"aaaa"` would have a border of length 3, longer than `s`.

## Walkthrough

`s = "aabba"`, `reversed = "abbaa"`, `combined = "aabba#abbaa"`.

The longest prefix of `combined` that is also its suffix is `"aa"` (`lps[last] = 2`): the prefix `aa` of `s` equals the suffix `aa` of `reversed`, and `"aab"` doesn't match `"baa"`.

| piece | value |
| --- | --- |
| palindromic prefix of s | "aa" |
| rest of s | "bba" |
| reversed rest, prepended | "abb" |
| answer | "abb" + "aabba" = **"abbaabba"** |

## Complexity

- Check prefixes from the longest: `O(n²)` worst case.
- KMP on the combined string: `O(n)` time and space.
- A rolling hash comparing prefix hashes forward and backward also gives `O(n)` expected.

## Edge cases

- Already a palindrome: returned unchanged (`k = n`).
- Empty string: empty.
- No palindromic prefix longer than one character: mirror everything after the first character (`"race"` → `"ecarace"`).

## Common mistakes

- Forgetting the separator.
- Prepending the reverse of the whole string instead of the remainder.
- Computing `lps` on `s` alone, which finds borders of `s`, not palindromes.

## In the interview

- Explain why the answer keeps the longest palindromic prefix; then show how KMP finds it.
- Likely follow-ups:
  - *Add characters at the end instead?* Find the longest palindromic **suffix**: the same trick with `reverse(s) + '#' + s`.
  - *Fewest insertions anywhere?* A 2-D DP: `n −` the longest palindromic subsequence.
