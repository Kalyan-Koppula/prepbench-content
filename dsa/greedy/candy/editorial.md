**Key insight:** each child's minimum is the length of the strictly increasing run that ends at them from the left, or from the right — whichever is longer. Two passes compute both.

## Approach

1. Start everyone at `1`.
2. Left to right: if `ratings[i] > ratings[i - 1]`, set `given[i] = given[i - 1] + 1`. Now every left-neighbour rule holds.
3. Right to left: if `ratings[i] > ratings[i + 1]`, set `given[i] = max(given[i], given[i + 1] + 1)`. Taking the `max` keeps the left rule satisfied while adding the right one.
4. Sum the array.

Why it's minimal: after pass 2, `given[i]` equals `max(L[i], R[i])`, where `L[i]` / `R[i]` are the lengths of the increasing runs ending at `i` from each side. Any valid assignment must give child `i` at least that many — the run forces `1, 2, 3, …` up to `i`.

## Complexity

- Time `O(n)` — two passes.
- Space `O(n)` for the candy array.

## Alternatives to mention

- `O(1)` space: walk once, counting lengths of the current up-slope and down-slope; when a down-slope grows longer than the preceding up-slope, the peak gains one more candy. Fiddly — mention it, write it only if asked.
- Repeatedly fixing violations until stable: correct but `O(n²)`.

## Pitfalls

- Equal neighbours impose **no** constraint — `[2, 2, 2]` needs only 3 candies.
- In pass 2, overwriting with `given[i + 1] + 1` instead of taking the `max` breaks peaks whose left slope was longer.
