**Key insight:** if capacity `c` ships everything in time, any larger capacity does too. Binary search the capacity between `max(weights)` and `sum(weights)`, using a greedy day count as the yes/no test.

## Approach

1. `lo = max(weights)` (anything smaller can't carry the heaviest package), `hi = sum(weights)` (one day).
2. `daysNeeded(c)`: walk the belt, adding weights to the current load; when the next package would overflow, start a new day.
3. First `c` with `daysNeeded(c) <= days`: if `mid` works, `hi = mid`, else `lo = mid + 1`.

Greedy is optimal for a fixed capacity: delaying a package to the next day never frees up room later.

## Complexity

- Time `O(n log S)` where `S = sum(weights)`.
- Space `O(1)`.

## Alternatives to mention

- Try every capacity from `max` to `sum`: `O(n · S)`.
- This is the same problem as Split Array Largest Sum: "split into at most `days` contiguous groups, minimise the largest group sum".

## Pitfalls

- Starting `lo` at `1`: the greedy check then has to handle packages heavier than the ship (or loops forever). Starting at `max(weights)` removes that case.
- Counting days: start at `1`, not `0`, since the first load is a day too.
