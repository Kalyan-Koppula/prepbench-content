**Key insight:** the last coin you add is some `c`, and what's left (`x - c`) must itself be made optimally — so `fewest[x] = 1 + min(fewest[x - c])`. It's unbounded knapsack / shortest path on amounts.

## Approach

- **State:** `fewest[x]` = minimum coins summing to exactly `x`.
- **Recurrence:** `fewest[x] = 1 + min over coins c ≤ x of fewest[x - c]`.
- **Base cases:** `fewest[0] = 0`; every other entry starts at `Infinity` (unreachable).
- **Order:** `x = 1 … amount`, so every smaller amount is final before it's read.
- **Answer:** `fewest[amount]`, or `-1` if it's still `Infinity`.
- **Space:** the table is needed — `fewest[x]` reads arbitrary earlier entries — so no rolling-variable trick here.

Progression: try-every-coin recursion is exponential in `amount / min(coin)`; memoising on the remaining amount gives `O(amount · k)`; the bottom-up loop above is the same work without recursion depth.

## Complexity

- Time `O(amount · k)` for `k` coins.
- Space `O(amount)`.

## Alternatives to mention

- **BFS** from `amount` subtracting coins: the first level that reaches `0` is the answer. Same complexity; a nice way to explain why it's a shortest-path problem.
- Greedy works only for "canonical" coin systems (like real currency); `[1, 4, 6]` for `8` breaks it.

## Pitfalls

- Initialising the table with `0` (or `amount + 1` and forgetting to check it) instead of an "impossible" marker.
- `amount = 0` must return `0`, not `-1`.
- Swapping the loops (coins outer, amounts inner) still works for the **minimum**; it matters only when counting combinations (Coin Change II).
