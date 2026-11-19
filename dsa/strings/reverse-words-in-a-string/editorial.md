**Key idea:** scan from the **end** of the string. Skip spaces, then read a word backwards to its first character, and append it to the result with a single space between words. Starting from the end produces the words in reversed order directly, and skipping runs of spaces handles leading, trailing and repeated spaces in one place.

## Recognising the pattern

Tokenising a string by hand (finding word boundaries with two indices) is a core scanning skill from the [Strings](/problems/patterns/strings) sheet. Built-in `split` and `trim` exist in every language, but the interview usually wants the boundaries handled explicitly.

## Alternative: collect words, then reverse (shown below)

Scan left to right, building the current word and pushing it into a list at each space (ignoring empty words). Then join the list from the last word to the first. That is the reference brute force below. `O(n)` time and `O(n)` space for the list.

## Right-to-left scan

1. `i = n − 1`, `result = ""`.
2. While `i ≥ 0`:
   1. Skip spaces: `while s[i] = ' '`, `i--`. Stop if `i < 0`.
   2. `end = i + 1`; move left over the word: `while s[i] ≠ ' '`, `i--`.
   3. Append a space if `result` isn't empty, then `s[i + 1 .. end)`.
3. Return `result`.

**In-place version.** In languages with mutable strings (a character array), reverse the whole array, then reverse each word, then compact the spaces. That uses `O(1)` extra space.

## Walkthrough

`s = "  coffee  before   code "`

| step | skipped spaces | word found | result |
| --- | --- | --- | --- |
| 1 | 1 | code | "code" |
| 2 | 3 | before | "code before" |
| 3 | 2 | coffee | "code before coffee" |
| 4 | 2 (leading) | – | done |

Answer `"code before coffee"`.

## Complexity

- Both versions: `O(n)` time. The output takes `O(n)` space; the list version also stores the words.
- Note that repeated string concatenation is `O(n)` amortised in most languages with string builders; use a `StringBuilder` in Java.

## Edge cases

- One word: unchanged (without surrounding spaces).
- Only spaces: the empty string.
- Multiple spaces between words: collapse to one.

## Common mistakes

- Splitting on a single space and producing empty words.
- Leaving a trailing or leading space in the result.
- Reversing the characters of the whole string and forgetting to reverse each word back.

## In the interview

- Ask whether the string is mutable; it decides between the scan and the in-place reversal trick.
- Likely follow-ups:
  - *`O(1)` extra space with a character array?* Reverse all, reverse each word, compact spaces.
  - *Reverse the characters in each word but keep the word order?* Find each word's boundaries and reverse inside them.
