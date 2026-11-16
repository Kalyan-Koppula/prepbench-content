**Key insight:** expand the right edge until the window covers `t`, then shrink the left edge as far as it stays covering. Each "just covering" window is a candidate; a single `missing` counter makes the coverage check O(1).

## Approach

1. `need[c]` starts as the count of `c` in `t`; `missing = t.length`.
2. Move `right`: if `s[right]` is in `t`, decrement `need`; if the count was positive before, this character was actually required, so `missing--`.
3. While `missing === 0`, the window covers `t`: record it if it is strictly shorter than the best, then remove `s[left]` — increment its `need`, and if that makes it positive, `missing++`. Advance `left`.
4. Return the best window or `""`.

`need` can go negative — that just means the window has surplus copies, which is why shrinking past them doesn't break coverage.

**Leftmost tie-break:** windows of equal length are ordered the same by start and end, and they're discovered in order of their right edge. Updating only on a *strictly* shorter window keeps the first, i.e. leftmost, one.

## Complexity

- Time `O(m + n)` — each pointer crosses `s` once, plus building `need` from `t`.
- Space `O(k)` for the distinct characters of `t`.

## Alternatives to mention

- Brute force: test every substring for coverage — `O(m² · (m + n))` or `O(m²)` with incremental counts.
- Filtered `s`: pre-collect only positions whose character is in `t` and slide over those. Helps when `s` is long and mostly irrelevant.

## Pitfalls

- Treating `t` as a set — duplicates in `t` must be matched with multiplicity.
- Comparing whole count maps on every step (correct but `O(52·m)`); the `missing` counter avoids that.
- Returning `s.slice(bestStart, bestLen)` — `slice` takes an end index, not a length.
