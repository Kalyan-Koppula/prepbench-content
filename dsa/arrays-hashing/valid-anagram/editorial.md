**Key idea:** two strings are anagrams exactly when every letter appears the same number of times in both. Count the letters of one string, subtract the letters of the other, and check that every count is back to zero.

## Recognising the pattern

Order doesn't matter, only **how many** of each letter. That is a frequency-count problem, one of the basic tools in the [Arrays & Hashing](/problems/patterns/arrays-hashing) sheet. Because the alphabet is fixed (26 lowercase letters), the "hash map" can be a plain array of 26 counters.

## Brute force

For each letter of `s`, find an unused copy of the same letter in `t` and mark it used. If some letter can't be matched, return `false`. With equal lengths, matching every letter of `s` also uses up all of `t`.

It is correct because it builds an explicit one-to-one pairing between the letters. Time `O(n²)` (a scan of `t` for each letter of `s`), space `O(n)` for the used flags.

## Better: sort both strings

Sort the characters of both strings and compare them. Anagrams sort to the same string. Time `O(n log n)`, space `O(n)` for the sorted copies. Short to write, and a fine first answer.

## Optimal: one count array

The sorted version does more work than needed: it orders the letters, when you only need their counts.

1. If the lengths differ, return `false` immediately.
2. Make an array `count` of 26 zeros.
3. For each index `i`: add 1 for `s[i]` and subtract 1 for `t[i]`. The index of a letter is `charCode - 97`.
4. If any entry of `count` is not zero, return `false`. Otherwise return `true`.

After step 3, `count[c]` equals (copies of `c` in `s`) minus (copies of `c` in `t`). All zeros means every letter balances. Doing both strings in one loop works because the lengths are equal.

## Walkthrough

`s = "rat"`, `t = "tar"` (showing only the letters involved)

| i | `s[i]` | `t[i]` | a | r | t |
| --- | --- | --- | --- | --- | --- |
| 0 | r | t | 0 | 1 | −1 |
| 1 | a | a | 0 | 1 | −1 |
| 2 | t | r | 0 | 0 | 0 |

All counts are zero, so the answer is `true`. For `s = "rat"`, `t = "car"`, the final counts would be `t: 1` and `c: −1`, so the answer is `false`.

## Complexity

- Brute force: time `O(n²)`, space `O(n)`.
- Sorting: time `O(n log n)`, space `O(n)`.
- Count array: time `O(n)` for the loop plus `O(26)` for the check. Space `O(1)`: the array has 26 entries no matter how long the strings are.

## Edge cases

- Different lengths: they can never be anagrams, and the early check also keeps the one-loop trick safe.
- Identical strings: trivially anagrams.
- One letter repeated, like `"aaa"` and `"aaa"`: counts handle multiplicity naturally.
- Same letters, different counts, like `"aab"` and `"abb"`: caught because `a` ends at 1 and `b` at −1.

## Common mistakes

- Using a set instead of counts, which says `"aab"` and `"abb"` are anagrams.
- Forgetting the length check and then reading past the end of the shorter string.
- Using `charCodeAt(i)` directly as the index (97 to 122) with an array of 26.

## In the interview

- Clarify the alphabet: only lowercase letters, or any Unicode? That decides between a 26-entry array and a hash map.
- Mention sorting as the quick solution, then the counting one as linear.
- Likely follow-ups:
  - *Unicode input?* Use a map from character to count, and iterate by code point so characters outside the basic plane aren't split in two.
  - *Group a list of words into anagram sets?* Use a canonical key per word (sorted letters or the 26 counts) as the key of a map. That is Group Anagrams.
  - *Find all anagram substrings of `p` inside `s`?* Slide a window of length `p.length` and keep the counts updated as it moves.
