**Key insight:** every path to step `n` ends with a 1-step from `n - 1` or a 2-step from `n - 2`, so `ways(n) = ways(n - 1) + ways(n - 2)` — Fibonacci.

## Approach

- **State:** `ways(i)` = number of move sequences that land exactly on step `i`.
- **Recurrence:** `ways(i) = ways(i - 1) + ways(i - 2)` — split on the last move; the two groups don't overlap.
- **Base cases:** `ways(0) = 1` (the empty sequence) and `ways(1) = 1`.
- **Order:** increasing `i`, since each state reads the two before it.
- **Space optimisation:** only two previous values are ever read, so keep two rolling variables instead of an array.

Progression to narrate: the plain recursion recomputes the same steps and is `O(φⁿ)`; memoising it makes it `O(n)`; a bottom-up table drops the recursion; two variables drop the table.

## Complexity

- Time `O(n)` — one pass.
- Space `O(1)` — two counters.

## Alternatives to mention

- Combinatorics: with `k` two-steps there are `n - k` moves, giving `Σ C(n - k, k)`.
- Matrix exponentiation of `[[1,1],[1,0]]` computes Fibonacci in `O(log n)` — overkill for `n ≤ 45` but a good follow-up answer.

## Follow-ups

- Allowed step sizes from a set `S`: `ways(i) = Σ ways(i - s)` over `s ∈ S` — the same 1-D table.
- Large `n` with a modulus: same recurrence, apply `% MOD` each step.
