**Key idea:** a permutation of `s1` has exactly the same letter counts as `s1`, and the same length. Slide a window of length `s1.length` across `s2`, keep its letter counts, and keep a single number `matches` saying how many of the 26 letters currently agree. The answer is yes as soon as all 26 agree.

## Recognising the pattern

"Some contiguous substring that is a rearrangement of `s1`" fixes the window length to `s1.length`. That is the fixed-size template from the [Sliding Window](/problems/patterns/sliding-window) sheet, combined with the frequency-count idea from Valid Anagram. The only question is how to compare the counts cheaply at every step.

## Brute force

For each start position, count the letters of the next `m` characters from scratch and compare all 26 counts with those of `s1`. That is the reference brute force below.

Correct because every window of length `m` is checked. Time `O((n − m + 1) · (m + 26))`, roughly `O(n · m)`. Space `O(1)`. (Sorting each window instead is `O(n · m log m)`.)

## Better: slide the counts, compare all 26

Neighbouring windows share all but two characters. Keep one count array for the window: add the character that enters, remove the one that leaves, then compare 26 counts. Time `O(26 · n)`, space `O(1)`. This is already linear and a good answer.

## Optimal: track the number of matching letters

Comparing 26 counts after every slide is wasteful: only two letters changed. Keep `matches`, the number of letters whose counts are equal in `need` (from `s1`) and `have` (from the window).

1. If `m > s2.length`, return `false`.
2. Count `s1` into `need` and the first `m` characters of `s2` into `have`. Compute `matches` by comparing all 26 once.
3. For each `right` from `m` to `s2.length - 1`:
   1. If `matches == 26`, return `true`.
   2. Add `s2[right]`: if its count was equal before the change, `matches--`; increment; if it is equal after, `matches++`.
   3. Remove `s2[right - m]` the same way, with a decrement.
4. Return `matches == 26` for the last window.

Updating `matches` "before and after" each change keeps it exact: a letter that moves away from equality loses its match, and one that reaches equality gains it.

## Walkthrough

`s1 = "ab"`, `s2 = "eidbaooo"`, `m = 2`. Only letters a, b, d, e, i, o are shown; all others always match.

| window | have (non-zero) | letters not matching | matches |
| --- | --- | --- | --- |
| "ei" | e1 i1 | a, b, e, i | 22 |
| "id" | i1 d1 | a, b, i, d | 22 |
| "db" | d1 b1 | a, d | 24 |
| "ba" | b1 a1 | none | 26 → `true` |

## Complexity

- Brute force: time `O(n · m)`, space `O(1)`.
- Slide and compare 26: time `O(26 · n)`, space `O(1)`.
- Slide with `matches`: time `O(n + 26)`, constant work per slide. Space `O(1)`.

## Edge cases

- `s1` longer than `s2`: return `false` immediately.
- `s1` and `s2` of equal length: only one window, checked by the final `matches == 26`.
- Repeated letters in `s1`, like `"aab"`: counts, not a set, so multiplicity is respected.
- The match is the very first window: caught at the first check inside the loop.

## Common mistakes

- Forgetting to check the **last** window after the loop.
- Comparing count arrays with `===`, which compares references.
- Updating `matches` only when a count becomes equal, and not when it stops being equal.
- Using a set of letters, which ignores repeats.

## In the interview

- Point out that the window length is fixed by `s1`, so it's a fixed-size window.
- Give the 26-comparison version first; mention `matches` as the constant-time refinement.
- Likely follow-ups:
  - *Return all starting indices of anagrams of `p` in `s`?* Same loop, record `right - m + 1` whenever `matches == 26` (Find All Anagrams).
  - *Any characters, not just lowercase letters?* Use maps and count distinct keys that match instead of 26.
