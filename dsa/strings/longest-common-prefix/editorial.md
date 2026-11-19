**Key idea:** compare the strings **column by column**. Take the first string as the reference; for each position `i`, check that every other string has a character at `i` and that it matches. The first mismatch, or the end of the shortest string, ends the common prefix.

## Recognising the pattern

Careful scanning with an early stop is the bread and butter of the [Strings](/problems/patterns/strings) sheet. Nothing clever is needed; the skill is stopping at the right moment and handling strings of different lengths.

## Alternative: horizontal scan (shown below)

Start with the whole first string as the prefix. For each other string, shrink the prefix to the part it shares with that string. That is the reference brute force below. Same `O(S)` worst case for `S` total characters, but it may compare characters of the first string many times before discovering a short string later in the list.

## Vertical scan

1. `first = strs[0]`.
2. For each `i` in `first`:
   - For each other string: if it is too short or `strs[k][i] ≠ first[i]`, return `first[0..i)`.
3. Return `first`.

**Why vertical can stop sooner.** It never looks past the shortest string, and it stops at the first column where anything differs. Horizontal scanning compares whole prefixes string by string, even when a later short string would end the search early.

## Walkthrough

`strs = ["interview", "internet", "interval"]`

| i | first[i] | internet | interval | all match? |
| --- | --- | --- | --- | --- |
| 0–4 | i, n, t, e, r | same | same | yes |
| 5 | v | n | v | **no** |

Answer `"inter"`.

## Complexity

- Both scans: `O(S)` time in the worst case, where `S` is the total length; vertical scan is `O(n · L)` for `n` strings and a common prefix of length `L`. `O(1)` extra space.
- Sorting the strings and comparing only the first and last also works: `O(S log n)`.

## Edge cases

- One string: the whole string.
- An empty string in the list: `""`.
- No common first letter: `""`.

## Common mistakes

- Reading past the end of a shorter string.
- Building the prefix with repeated string concatenation inside the loop; slicing once at the end is cleaner.
- Forgetting the single-string case.

## In the interview

- Mention both scans and say why vertical stops sooner.
- Likely follow-ups:
  - *Many queries against a fixed list?* Build a trie and walk down while a node has exactly one child and isn't the end of a word.
  - *Very long strings?* Binary search on the prefix length, checking each candidate in `O(S)`.
