**Key idea:** keep a window with no repeated characters. When the next character already appears inside the window, move the left edge to just past its previous occurrence. Remembering the last index of every character lets the left edge jump there in one step.

## Recognising the pattern

"Longest **substring**" means a contiguous range, and "no character appears more than once" is a condition you can maintain as the range changes. It is also monotone: if a window has no repeats, every smaller window inside it has none either. That is the "longest valid window" template from the [Sliding Window](/problems/patterns/sliding-window) sheet: always advance `right`, and advance `left` only when the window breaks.

Checking every substring is cubic if you test each one from scratch, and still quadratic if you extend smartly. With `5 * 10^4` characters, the linear scan is the one to aim for.

## Brute force

For each start index, extend the end one character at a time and keep a set of the characters seen so far. The moment the next character is already in the set, the substring from this start can't grow any further, so stop and move to the next start. Track the longest length reached.

It is correct because every valid substring is the prefix of the run that some start index extends, and each run is extended until it breaks. Time `O(n · min(n, a))` where `a` is the alphabet size, since a run can't be longer than the number of distinct characters. In the worst case think of it as `O(n²)`. Space `O(min(n, a))` for the set.

## Optimal: a window that jumps past the duplicate

The brute force restarts from scratch at every start index, rebuilding a set it had a moment ago. But look at what happens when the run from `start` breaks at `end` because `s[end]` repeats some earlier `s[p]`. Every start between `start` and `p` hits the same duplicate pair at or before `end`, so none of them can beat the run we already measured. The first start worth trying is `p + 1`, and the characters from `p + 1` to `end - 1` are already known to be distinct. There is nothing to rebuild.

That is the sliding window. Its state:

- `left`: the start of the current window. `[left, right]` never contains a repeat.
- `lastSeen[c]`: the latest index where character `c` appeared, or `-1`. The input is ASCII, so a 128-entry array works.

The algorithm:

1. Set `left = 0`, `best = 0`, and every `lastSeen` entry to `-1`.
2. For each `right` from `0` to `n - 1`, with `c = s[right]`:
   1. If `lastSeen[c] >= left`, the previous copy of `c` is inside the window. Move `left` to `lastSeen[c] + 1`.
   2. Set `lastSeen[c] = right`.
   3. The window `[left, right]` is now valid. Update `best` with `right - left + 1`.
3. Return `best`.

The invariant after step 2.1: `[left, right]` is the **longest** window ending at `right` with no repeats. Any start further left would include the previous `c`.

The check `lastSeen[c] >= left` matters. `lastSeen` is never cleared, so it can point to an index the window has already moved past. That copy of `c` is no longer in the window and must be ignored, otherwise `left` would jump **backwards**.

The pattern sheet solves the same problem with a count per character and a `while` loop that removes characters one at a time. Both are `O(n)`. The jump version is shorter and moves `left` once per duplicate instead of once per removed character.

## Walkthrough

`s = "dvdfabd"`.

| right | char | lastSeen[char] before | left after | window | best |
| --- | --- | --- | --- | --- | --- |
| 0 | d | -1 | 0 | `d` | 1 |
| 1 | v | -1 | 0 | `dv` | 2 |
| 2 | d | 0 (inside) | 1 | `vd` | 2 |
| 3 | f | -1 | 1 | `vdf` | 3 |
| 4 | a | -1 | 1 | `vdfa` | 4 |
| 5 | b | -1 | 1 | `vdfab` | 5 |
| 6 | d | 2 (inside) | 3 | `fabd` | 5 |

Answer `5`, from `"vdfab"`. At `right = 2` the duplicate `d` is at index 0, so `left` jumps to 1. At `right = 6` the latest `d` is at index 2, so `left` jumps to 3. The `d` at index 0 is irrelevant by then, which is why `lastSeen` stores only the most recent index.

## Complexity

- Brute force: time `O(n · min(n, a))`, up to `O(n²)`, because each start scans until its first repeat. Space `O(min(n, a))` for the set.
- Optimal: time `O(n)`, one pass with constant work per character. Space `O(1)`: 128 entries regardless of `n`. With a `Map` instead of an array it is `O(min(n, a))`.

## Edge cases

- Empty string: the loop never runs and the answer is `0`.
- One character, or all characters the same like `"zzzz"`: every step jumps `left` to `right`, so the answer is `1`.
- No repeats at all: `left` stays at `0` and the answer is `n`.
- A stale index, as in `"abba"`: at the final `a`, `lastSeen['a'] = 0` but `left = 2`. The `>= left` check ignores it, giving `2`, not `1`.
- Spaces and symbols count as characters like any other.

## Common mistakes

- Setting `left = lastSeen[c] + 1` without checking that the old index is inside the window. On `"abba"` that moves `left` back to 1 and reports `3`.
- Using `>` instead of `>=` in that check. A previous copy exactly at `left` is still inside the window.
- Updating `best` before moving `left`, which counts a window that contains a duplicate.
- In the count-based version, removing a single character when a duplicate arrives. The window has to keep dropping characters from the left until the earlier copy is gone, as in `"abcb"`, where `a` and `b` both leave.
- Returning the substring length as `right - left`.

## In the interview

- Clarify the character set (ASCII, Unicode, only lowercase?) because it decides between an array and a `Map`. Confirm that "substring" means contiguous.
- Give the brute force in one sentence, then: "When the next character is already in my window, no start before its previous copy can do better, so I jump `left` just past it. Each index is visited once."
- Likely follow-ups:
  - *Return the substring itself?* Remember `left` whenever `best` improves and slice at the end.
  - *At most `k` distinct characters instead of all distinct?* Counts per character plus a `distinct` counter, shrinking with a `while` loop.
  - *At most two repeats of each character?* The same window, shrinking while the added character's count is above 2.
  - *Full Unicode, or a stream too long to store?* Use a `Map`, and note that only `lastSeen` and two indices are kept, so the window works on a stream.
