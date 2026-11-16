**Key insight:** a window can be made uniform iff `windowLength - maxFrequency <= k` — keep the most common letter and replace the rest. Slide a window that satisfies this.

## Approach

1. Keep a 26-slot count of letters in the window and `maxFreq`, the highest count seen.
2. Extend `right`. If `length - maxFreq > k`, drop `s[left]` and advance `left` by one.
3. Track the largest window length.

**Why `maxFreq` never decreases:** the answer only improves when some letter reaches a higher frequency than before. While `maxFreq` is stale, the window just slides at constant size — it can't produce a wrong larger answer, and it doesn't need to shrink below the best size already found.

## Complexity

- Time `O(n)` — each index enters and leaves once.
- Space `O(26)`.

## Alternatives to mention

- Recompute the true max over 26 counts each step and shrink with a `while`: `O(26·n)`, easier to justify if the interviewer is uneasy about the stale max.
- Per-letter pass: for each target letter, find the longest window with at most `k` non-target letters — `O(26·n)`.

## Pitfalls

- Assuming the current window is always valid in the `if` version — it only keeps the best size; if you need the actual substring, track it when `best` improves.
- `k` may be `0` or equal to `s.length`.
