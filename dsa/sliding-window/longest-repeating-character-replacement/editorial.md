**Key idea:** a window can be turned into one repeated letter when the letters that are **not** its most common letter number at most `k`: `windowLength - maxCount <= k`. Slide a window, keep letter counts and the best `maxCount` seen, and shift the window by one whenever it breaks the rule.

## Recognising the pattern

Longest **contiguous** substring under a condition that gets easier as the window shrinks: the "longest valid window" template from the [Sliding Window](/problems/patterns/sliding-window) sheet. The work is writing the validity rule as arithmetic on the window's counts. Keep the most common letter and replace everything else, so the window needs `length - maxCount` replacements.

## Brute force

For each start, grow the end, keeping the 26 letter counts and the largest count up to date. The substring is valid while `length - maxCount <= k`; once it isn't, longer substrings from this start can't be valid either, so you can stop. That is the reference brute force below.

Correct because it tries every substring. Time `O(n²)`, space `O(1)` for 26 counters.

## Optimal: sliding window that never shrinks

1. `count` = 26 zeros, `left = 0`, `maxCount = 0`, `best = 0`.
2. For each `right`:
   1. Increment `count[s[right]]` and update `maxCount` if that count is now the largest.
   2. If `(right - left + 1) - maxCount > k`, decrement `count[s[left]]` and move `left` one step.
   3. Update `best` with the window length.
3. Return `best`.

**Two shortcuts, and why they are safe.**

- *An `if` instead of a `while`.* When the window breaks, it moves right by one instead of shrinking. Its length never decreases, so it stays at the best length found so far until a longer valid window appears.
- *`maxCount` is never decreased.* After removing a letter from the left, the true maximum count inside the window may drop, but we keep the old value. That can make a slightly-too-long window look valid, but such a window is never **longer** than one we have already counted, because the window only grows when a letter's count beats the stored `maxCount`. A new best length therefore always comes with a real `maxCount`, and the answer is exact.

If those shortcuts feel too clever, the plain version (a `while` loop and recomputing the max of the 26 counts) is also `O(26 · n)` and perfectly acceptable.

## Walkthrough

`s = "AABABBA"`, `k = 1`

| right | char | counts (A, B) | maxCount | length − maxCount | action | window | best |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | A | 1, 0 | 1 | 0 | – | A | 1 |
| 1 | A | 2, 0 | 2 | 0 | – | AA | 2 |
| 2 | B | 2, 1 | 2 | 1 | – | AAB | 3 |
| 3 | A | 3, 1 | 3 | 1 | – | AABA | 4 |
| 4 | B | 3, 2 | 3 | 2 | drop A | ABAB | 4 |
| 5 | B | 2, 3 | 3 | 2 | drop A | BABB | 4 |
| 6 | A | 2, 3 | 3 | 2 | drop B | ABBA | 4 |

Answer `4`, for example `"AABA"` with the `B` replaced.

## Complexity

- Brute force: time `O(n²)`, space `O(1)`.
- Sliding window: time `O(n)`, each character enters the window once and leaves at most once. Space `O(1)` for 26 counters.

## Edge cases

- `k = 0`: the answer is the longest run of one letter.
- `k >= s.length`: the whole string can be changed, so the answer is `n`.
- One distinct letter: the window never breaks.
- A single character: the answer is 1.

## Common mistakes

- Writing the rule as `count of some fixed letter + k` instead of using the window's most common letter.
- Recomputing `maxCount` wrongly after shrinking, for example by decrementing it every time a letter leaves.
- Off-by-one in the window length.

## In the interview

- Derive the validity rule out loud: "keep the majority letter, replace the rest, so I need `length - maxCount` changes."
- Present the `while` version first; offer the never-shrinking optimisation as a refinement and explain why it stays correct.
- Likely follow-ups:
  - *Return the substring?* Remember `left` when `best` improves.
  - *Binary string, flip at most `k` zeros?* The same idea with zeros as the "letters to replace" (Max Consecutive Ones III).
  - *Lowercase or any characters?* Use a map instead of a 26-entry array; the logic is unchanged.
