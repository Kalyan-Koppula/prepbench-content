**Key insight:** hours needed is a non-increasing function of speed, so "does speed `k` work?" flips from no to yes exactly once. Binary search the speed instead of the array.

## Approach

1. Bounds: speed `1` is the slowest possible; speed `max(piles)` always works because each pile then takes exactly one hour and `h >= piles.length`.
2. `hours(k) = Σ ceil(pile / k)`.
3. Find the first `k` in `[1, max]` with `hours(k) <= h`: if `mid` works, `hi = mid`; otherwise `lo = mid + 1`.
4. Return `lo`.

## Complexity

- Time `O(n log M)` where `M = max(piles)` — about 30 feasibility checks of `O(n)` each.
- Space `O(1)`.

## Alternatives to mention

- Try every speed from 1 upward: `O(n · M)`, hopeless for `M = 10^9`.
- Tighter lower bound `ceil(sum / h)` — nice to mention, doesn't change the complexity.

## Pitfalls

- `Math.ceil(p / k)` is fine in JS; in integer languages use `(p + k - 1) / k`.
- The hour sum can reach `10^13` — fine for JS numbers, but overflows 32-bit ints elsewhere.
- Starting `lo` at `0` leads to division by zero.
