---
title: Strings
order: 20
summary: Careful scanning, parsing and matching — plus the KMP prefix function that turns O(n·m) searches into O(n + m).
---

## The idea

Most string problems are not about clever algorithms. They are about **scanning carefully**: keeping one or two indices, knowing exactly where a word or number starts and ends, handling the empty string, the single character and the run of spaces. The rest are about **matching**: finding a pattern in a text, comparing prefixes and suffixes, without re-reading characters you have already seen.

This sheet covers both. Many other sheets also work on strings ([Sliding Window](/problems/patterns/sliding-window) for substrings with a property, [Two Pointers](/problems/patterns/two-pointers) for palindromes, [Tries](/problems/patterns/tries) for prefix queries, [2-D Dynamic Programming](/problems/patterns/dp-2d) for comparing two strings); here the focus is the scanning and matching tools themselves.

Three ideas carry the problems in this set:

1. **Scan with explicit boundaries.** Track `start` and `end` of the current token, skip separators in a loop, and decide at each character which stage of the parse you are in.
2. **Process in stages with guards.** Parsing numbers or notations means checking each rule in order (spaces, sign, digits) and guarding against overflow before it happens.
3. **The prefix function (KMP).** For each position of a string, the length of the longest proper prefix that is also a suffix ending there. It powers linear-time pattern search and several "prefix equals suffix" tricks.

```
needle:  a  b  c  a  b  d
lps:     0  0  0  1  2  0
                   ↑  ↑
           "a" is both a prefix and a suffix of "abca"
           "ab" is both a prefix and a suffix of "abcab"
```

## When to reach for it

- Parse, tokenise or convert: words, numbers, Roman numerals, version strings.
- "Find the first occurrence", "does the pattern appear", "how many times".
- Prefix and suffix questions: common prefixes, palindromic prefixes, repeated patterns.
- Constraints like `n, m ≤ 10^5` for a pattern search, which rule out `O(n · m)`.

Look-alikes:

| Statement says | What to use instead |
| --- | --- |
| Longest substring with some property | [Sliding Window](/problems/patterns/sliding-window) |
| Is it a palindrome, or a pair-sum on characters | [Two Pointers](/problems/patterns/two-pointers) |
| Many words, prefix queries | [Tries](/problems/patterns/tries) |
| Edit distance, LCS, matching with wildcards | [2-D Dynamic Programming](/problems/patterns/dp-2d) |
| Group anagrams, count characters | [Arrays & Hashing](/problems/patterns/arrays-hashing) |

## How it works

**Naive search versus KMP.** Search for `abcabd` in `abcabcabd`. The naive search matches `abcab` at position 0, fails on `c` versus `d`, and restarts at position 1, re-reading characters it has already seen.

KMP knows that the matched part `abcab` ends with `ab`, which is also how the needle starts (`lps[4] = 2`). So after the mismatch it keeps those two characters as already matched and compares the same haystack character again with `needle[2]`:

| haystack index | char | matched before | action | matched after |
| --- | --- | --- | --- | --- |
| 0–4 | a b c a b | 0 → 4 | match | 5 |
| 5 | c | 5 | mismatch with `d`; fall back to `lps[4] = 2`; `c` matches `needle[2]` | 3 |
| 6–8 | a b d | 3 → 5 | match | 6 = full match |

The match starts at `8 − 6 + 1 = 3`. The **invariant**: after reading haystack index `i`, `matched` is the length of the longest prefix of the needle that ends at `i`. The haystack pointer never moves back, which is what makes it linear.

## Templates

### Tokenise by hand

```ts
function words(s: string): string[] {
  const result: string[] = []
  let i = 0
  while (i < s.length) {
    while (i < s.length && s[i] === ' ') {
      i++ // skip separators
    }
    const start = i
    while (i < s.length && s[i] !== ' ') {
      i++ // move over the token
    }
    if (i > start) {
      result.push(s.substring(start, i))
    }
  }
  return result
}
```

### Parse an integer with an overflow guard

```ts
function parseDigits(s: string, from: number): number {
  const INT_MAX = 2147483647
  let value = 0
  let i = from
  while (i < s.length && s[i] >= '0' && s[i] <= '9') {
    const digit = s.charCodeAt(i) - 48
    if (value > Math.floor((INT_MAX - digit) / 10)) {
      return INT_MAX // value * 10 + digit would not fit
    }
    value = value * 10 + digit
    i++
  }
  return value
}
```

### Prefix function (KMP failure table)

```ts
function prefixFunction(p: string): number[] {
  const lps = new Array(p.length).fill(0)
  let length = 0 // length of the current border
  for (let i = 1; i < p.length; i++) {
    while (length > 0 && p[i] !== p[length]) {
      length = lps[length - 1] // try the next shorter border
    }
    if (p[i] === p[length]) {
      length++
    }
    lps[i] = length
  }
  return lps
}
```

### KMP search

```ts
function findFirst(text: string, p: string): number {
  const lps = prefixFunction(p)
  let matched = 0
  for (let i = 0; i < text.length; i++) {
    while (matched > 0 && text[i] !== p[matched]) {
      matched = lps[matched - 1]
    }
    if (text[i] === p[matched]) {
      matched++
    }
    if (matched === p.length) {
      return i - p.length + 1 // for all matches: record, then matched = lps[matched - 1]
    }
  }
  return -1
}
```

### Choosing a template

- Words or fields separated by delimiters: **tokenise by hand**.
- Numbers inside strings: **parse with a guard**.
- Pattern in a text, linear time: **KMP search**.
- Prefix that equals a suffix (of the string or of a combination): **prefix function** on a cleverly built string.

## Choosing the approach

| Problem | Approach | Key detail |
| --- | --- | --- |
| Longest Common Prefix | Vertical scan | Stop at the first differing column or the shortest string |
| Roman to Integer | One pass with look-ahead | Smaller before larger is subtracted |
| Reverse Words in a String | Scan from the right | Skip runs of spaces; join with single spaces |
| String to Integer (atoi) | Staged parse with a guard | Check overflow before multiplying |
| Find the Index of the First Occurrence | KMP | Never move the text pointer back |
| Shortest Palindrome | Prefix function of `s + '#' + reverse(s)` | Gives the longest palindromic prefix |

## Worked problems

**Roman to Integer.** Add each symbol's value unless the next symbol is larger, in which case subtract it. `IV` becomes `−1 + 5`.

**String to Integer (atoi).** Spaces, then an optional sign, then digits until a non-digit. Before each `value · 10 + digit`, check `value > (INT_MAX − digit) / 10` and clamp if so.

**Find the Index of the First Occurrence.** Build `lps` for the needle, then scan the haystack once, falling back through `lps` on mismatches. `O(n + m)`.

**Shortest Palindrome.** The answer keeps the longest palindromic prefix of `s` and mirrors the rest in front. That prefix is the last `lps` value of `s + '#' + reverse(s)`.

## Variations and tricks

- **Repeated Substring Pattern:** with `p = n − lps[n − 1]`, the string is a repetition when `lps[n − 1] > 0` and `n % p = 0`.
- **Z-function:** for each position, the length of the longest substring starting there that matches a prefix. An alternative to KMP with the same power.
- **Rabin-Karp:** compare rolling hashes of windows instead of characters; handles multiple patterns of the same length.
- **String builders:** repeated `+=` on immutable strings can be `O(n²)` in some languages; use a `StringBuilder` (Java) or collect pieces and join.
- **Character arithmetic:** `c − '0'` for digits and `c − 'a'` for letter indices, instead of lookups.
- **Separators in combined strings:** a character that can't appear in the input keeps matches from crossing the boundary.

## Complexity

- Scanning and parsing: `O(n)` time, `O(1)` extra space (plus the output).
- Naive pattern search: `O(n · m)` worst case.
- KMP: `O(m)` to build `lps`, `O(n)` to search, `O(m)` space.
- Rabin-Karp: `O(n + m)` expected.

## Pitfalls

- Off-by-one at token boundaries (`substring(start, end)` excludes `end`).
- Forgetting the empty string, a string of only separators, or a single character.
- Overflow checked after the multiplication instead of before.
- Starting the `lps` loop at index 0, or moving the text pointer back after a mismatch.
- Assuming `split` handles repeated separators the way you expect; in many languages it yields empty strings.

## Practice ladder

1. [Longest Common Prefix](/problems/longest-common-prefix): a vertical scan with early exit.
2. [Roman to Integer](/problems/roman-to-integer): one pass with a look-ahead rule.
3. [Reverse Words in a String](/problems/reverse-words-in-a-string): tokenising with explicit boundaries.
4. [String to Integer (atoi)](/problems/string-to-integer-atoi): staged parsing and an overflow guard.
5. [Find the Index of the First Occurrence in a String](/problems/find-the-index-of-the-first-occurrence-in-a-string): KMP pattern search.
6. [Shortest Palindrome](/problems/shortest-palindrome): the prefix function on a combined string.
