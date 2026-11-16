**Key insight:** maintain a window with all-distinct characters. When the incoming character already sits inside the window, move the left edge just past its previous occurrence.

## Approach

1. `lastSeen` maps each character to the last index it appeared at.
2. Scan `right` from `0`. If `s[right]` was last seen at index `>= left`, set `left = lastSeen + 1`.
3. Record `lastSeen[s[right]] = right` and update `best` with `right - left + 1`.

The `>= left` guard matters: an old occurrence to the left of the window must not drag `left` backwards.

## Complexity

- Time `O(n)` — `right` visits each index once and `left` only moves forward.
- Space `O(min(n, k))` for alphabet size `k`.

## Alternatives to mention

- Set-based window: on a duplicate, delete `s[left++]` until the duplicate leaves. Same `O(n)` amortised, a bit slower in practice.
- Brute force: check every start and extend until a repeat — `O(n²)` with a set.

## Pitfalls

- Moving `left` backwards with `left = lastSeen + 1` when the old index is outside the window (e.g. `"abba"`).
- Forgetting the empty string returns `0`.
- Spaces and symbols count as characters too.
