**Key idea:** record the last position of every letter. Walk the string, keeping `end` = the farthest last position of any letter in the current piece. When the index reaches `end`, every letter in the piece has appeared for the last time, so cut there. Each piece is as short as possible, which gives the most pieces.

## Recognising the pattern

"Split into as many parts as possible, with a constraint that stretches each part" is the interval-merging greedy from the [Greedy](/problems/patterns/greedy) sheet. Each letter covers the interval from its first to its last appearance; overlapping intervals must share a piece, and the pieces are the merged intervals.

## Brute force

From each piece's start, try ends in order and check whether any letter of the piece appears after it. Cut at the first end that passes. That is the reference brute force below. `O(n²)` time.

## Greedy with last positions

1. `last[c]` = last index of each letter.
2. `start = 0`, `end = 0`.
3. For each `i`:
   1. `end = max(end, last[s[i]])`: the piece must stretch to cover this letter's last appearance.
   2. If `i = end`: cut. Record `end − start + 1`, set `start = i + 1`.

**Why cutting as early as possible is optimal.** At the moment `i = end`, no letter in the piece appears later, so the cut is valid. No earlier cut is valid, because some letter in the piece appears at or after `end`. Cutting at the earliest valid point leaves the most room for later cuts.

## Walkthrough

`s = "abacdcef"`. Last positions: `a: 2, b: 1, c: 5, d: 4, e: 6, f: 7`.

| i | letter | end | cut? | sizes |
| --- | --- | --- | --- | --- |
| 0 | a | 2 | – | |
| 1 | b | 2 | – | |
| 2 | a | 2 | yes | 3 |
| 3 | c | 5 | – | 3 |
| 4 | d | 5 | – | 3 |
| 5 | c | 5 | yes | 3, 3 |
| 6 | e | 6 | yes | 3, 3, 1 |
| 7 | f | 7 | yes | 3, 3, 1, 1 |

Answer `[3, 3, 1, 1]`: `"aba"`, `"cdc"`, `"e"`, `"f"`.

## Complexity

- Check the rest for each candidate end: `O(n²)`.
- Last positions plus one pass: `O(n)` time, `O(1)` space (26 letters).

## Edge cases

- All letters distinct: every piece has size 1.
- First and last letters equal: one piece, the whole string.
- One character: `[1]`.

## Common mistakes

- Updating `end` only from the first occurrence of a letter.
- Returning the cut positions instead of the sizes.
- Using a map where a 26-slot array is simpler.

## In the interview

- Mention the interval view; it connects the problem to Merge Intervals.
- Likely follow-ups:
  - *Return the pieces themselves?* Slice at the recorded boundaries.
  - *Fewest pieces instead?* One piece is always valid; the problem is only interesting for the most pieces.
