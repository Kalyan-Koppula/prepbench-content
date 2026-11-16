**Key insight:** each letter turns into an interval `[first, last]`; a piece must cover every interval it touches, so close a piece the moment the scan reaches the farthest `last` of everything seen in it.

## Approach

1. One pass to record the last index of every letter.
2. Scan again with `start` (current piece's start) and `end` (farthest last-index needed so far).
3. At each `i`, `end = max(end, last[s[i]])`. When `i === end`, nothing in `[start, i]` appears later — emit `i - start + 1` and start a new piece at `i + 1`.

Why it gives the most pieces: you cut at the earliest legal point every time. Cutting earlier would split some letter's occurrences; cutting later only merges pieces that could have stood alone.

## Complexity

- Time `O(n)` — two passes.
- Space `O(1)` — at most 26 entries in the map.

## Alternatives to mention

- Build each letter's `[first, last]` interval and merge overlapping intervals (as in Merge Intervals); the merged lengths are the answer. Same result, more code.
- Brute force: for each start, try every end and test disjointness with the rest — `O(n²)`-ish.

## Pitfalls

- Using `s.lastIndexOf(ch)` inside the loop makes it `O(n²)`; precompute.
