**Key idea:** put one pointer at each end of the string. Skip anything that isn't a letter or digit, compare the two characters case-insensitively, and step both pointers inward. Any mismatch means it isn't a palindrome.

## Recognising the pattern

A palindrome is defined by **mirror positions**: the first character must match the last, the second must match the second-to-last, and so on. Comparing mirror positions is the "opposite ends moving inward" variant from the [Two Pointers](/problems/patterns/two-pointers) sheet. The filtering rule (ignore punctuation, ignore case) just means each pointer may need to skip ahead before comparing.

## Brute force

Build a cleaned copy: keep only letters and digits, lower-cased. Then compare it with its reverse. That is the reference brute force below.

Correct and linear: time `O(n)`, space `O(n)` for the cleaned copy. It is a fine first answer; the two-pointer version removes the extra memory.

## Optimal: two pointers that skip

1. Set `left = 0`, `right = s.length - 1`.
2. While `left < right`:
   1. Move `left` forward while it points at a non-alphanumeric character (and `left < right`).
   2. Move `right` backward the same way.
   3. Compare the two characters after lower-casing. If they differ, return `false`.
   4. Move both pointers inward by one.
3. Return `true`.

The invariant: everything outside `[left, right]` has been checked, and the cleaned characters there form matching mirror pairs.

**Why the extra `left < right` in the skip loops?** On a string like `".,"`, the skip loops would otherwise run past each other and compare out-of-range positions. With the guard, they stop when they meet, and a single character in the middle needs no partner.

Lower-casing by character code (`code + 32` for `A`–`Z`) avoids creating new strings, and the same rule handles digits, which have no case.

## Walkthrough

`s = "Race, car!"`, cleaned it reads `racecar`.

| step | left (char) | right (char) | compare | result |
| --- | --- | --- | --- | --- |
| 1 | 0 (R) | 9 (!) → skip → 8 (r) | r = r | match |
| 2 | 1 (a) | 7 (a) | a = a | match |
| 3 | 2 (c) | 6 (c) | c = c | match |
| 4 | 3 (e) | 5 (space) → skip → 4 (,) → skip → stops at 3 | e = e (same cell) | match, pointers cross |

Return `true`.

## Complexity

- Cleaned copy: time `O(n)`, space `O(n)`.
- Two pointers: time `O(n)`, since each pointer moves only inward and each character is looked at a constant number of times. Space `O(1)`.

## Edge cases

- No letters or digits at all, like `"?!"`: the pointers meet without a comparison, so the answer is `true`.
- A single character: trivially a palindrome.
- Digits mixed with letters, like `"0P"`: `0` and `p` differ, so `false`. Digits must be compared, not skipped.
- Upper and lower case of the same letter: equal after lower-casing.

## Common mistakes

- Skipping digits along with punctuation.
- Comparing without normalising case.
- Leaving out the `left < right` guard in the skip loops, so the pointers cross.
- Using a regular expression on every character inside the loop, which works but is slow and hides the logic.

## In the interview

- Clarify exactly which characters count: letters and digits only? Is the comparison case-insensitive?
- Mention the cleaned-copy version, then the in-place two pointers.
- Likely follow-ups:
  - *Allow deleting at most one character?* On the first mismatch, check whether skipping the left or the right character makes the rest a palindrome (Valid Palindrome II).
  - *Unicode letters?* Use proper letter and case tests from the language rather than ASCII arithmetic.
  - *Longest palindromic substring?* A different technique: expand around each centre.
