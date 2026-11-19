**Key idea:** grow the window to the right until it contains everything `t` needs, then shrink it from the left for as long as it still does. Every "can't shrink any further" window is a candidate. A single `missing` counter tells you in `O(1)` whether the window currently covers `t`.

## Recognising the pattern

The answer is a **contiguous** substring, and you want the **shortest** one that satisfies a condition. The condition is monotone: if a window covers `t`, any larger window around it also covers `t`. That is the "shortest window" template from the [Sliding Window](/problems/patterns/sliding-window) sheet: advance `right` to make the window valid, then advance `left` while it stays valid.

The difficulty is the check. "Does this window contain every character of `t`, with duplicates?" sounds like comparing two count tables on every step. The trick below makes it a single integer comparison.

## Brute force

For each start index, extend the end until the window covers `t`. The first end that works gives the shortest window starting there, so stop and move to the next start. Track counts incrementally as the end grows, so each start costs `O(m)`.

Time `O(m²)` for `s` of length `m` (plus `O(n)` to count `t`), space `O(1)` for the fixed-size count array. Correct, but with `m = 10^5` that is up to 10 billion steps.

## Optimal: shortest-window sliding window with a `missing` counter

The brute force throws away all its counts when it moves to the next start. But the window for start `i + 1` overlaps heavily with the one for start `i`. If you keep the counts and just remove `s[i]`, you save all that rebuilding. And once a window `[left, right]` covers `t`, the window for the next `left` can only end at `right` or later. So `right` never needs to move backwards either.

The state:

- `need[c]`: how many more copies of character `c` the window still needs. It starts as the count of `c` in `t`. When the window holds surplus copies, it goes **negative**, which is fine.
- `missing`: how many required characters are still absent. It starts at `t.length`. The window covers `t` exactly when `missing === 0`.

The algorithm:

1. Count `t` into `need`. Set `missing = t.length`, `left = 0`.
2. For each `right`:
   1. Let `c = s[right]`. If `need[c] > 0`, this copy was still required, so `missing--`. Then `need[c]--` either way.
   2. While `missing === 0`:
      1. Record `[left, right]` if it is **strictly** shorter than the best so far.
      2. Remove `s[left]`: `need[s[left]]++`. If that makes it positive, the window just lost a copy it needed, so `missing++`.
      3. `left++`.
3. Return the best window, or `""` if none was found.

Why is `need[c] > 0` the right test? A positive value means the window still lacks copies of `c`, so the copy being added fills a real gap. A value of zero or below means `t`'s requirement for `c` is already met, and this copy is surplus. Removing a surplus copy can't break coverage, which is why the window can shrink past it.

**The leftmost tie-break.** Windows are found in order of their right edge, and among equal-length windows a smaller right edge means a smaller left edge. Updating only on a strictly shorter window keeps the first one found, which is the leftmost.

## Walkthrough

`s = "CABDBAC"`, `t = "ABC"`. Initially `need = {A:1, B:1, C:1}`, `missing = 3`.

| right | add | missing after add | shrink steps | best |
| --- | --- | --- | --- | --- |
| 0 | C | 2 | – | – |
| 1 | A | 1 | – | – |
| 2 | B | 0 | record `CAB` (3); drop `C` → missing 1, left = 1 | `CAB` |
| 3 | D | 1 | – | `CAB` |
| 4 | B | 1 (surplus B) | – | `CAB` |
| 5 | A | 1 (surplus A) | – | `CAB` |
| 6 | C | 0 | `ABDBAC` (6) no; drop `A` (surplus) → still 0; `BDBAC` (5) no; drop `B` (surplus); `DBAC` (4) no; drop `D`; `BAC` (3) not strictly shorter; drop `B` → missing 1 | `CAB` |

Answer `"CAB"`. `"BAC"` has the same length but starts later, so the strict comparison correctly keeps `"CAB"`.

## Complexity

- Brute force: time `O(m² + n)`, space `O(1)` (128 counters).
- Optimal: time `O(m + n)`. `right` visits each index once, `left` visits each index at most once, and each step is `O(1)`. Space `O(1)`: the 128-entry array doesn't grow with the input. With a `Map` keyed by character, it would be `O(k)` for the `k` distinct characters of `t`.

## Edge cases

- `t` longer than `s`: `missing` can never reach 0, so return `""`.
- `t` has duplicates, like `t = "aa"`: `need['a']` starts at 2, so a single `a` doesn't cover it.
- Characters of `s` that aren't in `t`: their `need` goes negative and they never affect `missing`.
- The whole of `s` is the answer: the loop records it on the last `right`.
- Upper and lower case are different characters, which the per-code array handles for free.

## Common mistakes

- Treating `t` as a set and ignoring duplicate letters.
- Comparing the full count tables at every step. It is correct but costs `O(52)` per step and is easy to get wrong. The `missing` counter avoids it.
- Recording the answer after the `while` loop instead of inside it. By then the window no longer covers `t`.
- Using `<=` when comparing lengths, which returns the rightmost of equally short windows.
- Calling `substring(bestStart, bestLength)`. The second argument is an end index, not a length.

## In the interview

- Clarify: are duplicates in `t` required with multiplicity? Is matching case-sensitive? Which window do you want on a tie? What should be returned when there is none?
- Describe the brute force in one sentence, then: "Once a window covers `t`, I shrink from the left while it still does. Each index enters and leaves the window once, so it's linear." Then introduce `missing` as the `O(1)` coverage check.
- Likely follow-ups:
  - *Return just the length?* Same loop, keep only `bestLength`.
  - *`s` is huge and most of it is irrelevant?* Pre-collect the positions whose character appears in `t` and slide over that shorter list.
  - *Characters must appear in `t`'s order (a subsequence, not a multiset)?* A different problem: two-pointer matching forward and backward, or DP.
  - *Count all windows that cover `t`?* When the window first covers `t` at `right`, every extension to the right also covers it, which leads to a counting formula on the same scan.
