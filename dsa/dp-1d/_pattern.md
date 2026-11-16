---
title: 1-D Dynamic Programming
order: 14
summary: Name the subproblem by one index, write how it depends on smaller ones, then fill a table (or two variables).
---

## Recognise it

- "Count the ways", "minimum cost", "maximum value", "is it possible" — over a sequence or a single number.
- A greedy choice looks tempting but a counterexample breaks it.
- The brute-force recursion branches on a choice at each position and recomputes the same suffixes / prefixes many times.
- The answer for position `i` only needs answers for a few earlier positions (or all earlier ones, for O(n²) variants).

## The recipe

1. **State** — say it in one sentence: "`dp[i]` = best answer for the first `i` items" (or "for the suffix starting at `i`").
2. **Recurrence** — what is the last decision? Enumerate its options and combine smaller states.
3. **Base cases** — the empty prefix, `i = 0`, `i = 1`. Pick values that make the recurrence work without special cases.
4. **Order** — fill so every state you read is already computed (left to right for prefix states).
5. **Answer** — usually `dp[n]`, sometimes `max(dp)`.

## Templates

```ts
// Top-down: plain recursion + memo. Easiest to derive from the brute force.
const memo = new Map<number, number>()
function best(i: number): number {
  if (i <= 1) return base(i)
  if (memo.has(i)) return memo.get(i)!
  const v = Math.max(best(i - 1), best(i - 2) + gain(i))
  memo.set(i, v)
  return v
}

// Bottom-up with rolling variables when dp[i] reads only dp[i-1], dp[i-2].
let prev2 = base0, prev1 = base1
for (let i = 2; i <= n; i++) {
  const cur = Math.max(prev1, prev2 + gain(i))
  prev2 = prev1
  prev1 = cur
}
```

## Interview notes

- Narrate the progression: brute recursion (exponential) → memoise the repeated calls → tabulate bottom-up → shrink the table to the few cells you actually read.
- Top-down is quicker to get right and only visits reachable states; bottom-up avoids recursion depth limits (JS stacks overflow around ~10k frames).
- Unbounded choices (coins, squares, words) give `dp[i] = best over options of dp[i - option]` — an O(n · options) loop.
- "Subarray ending at `i`" states (Kadane-style) answer contiguous problems; take the max over all `i` at the end.
- Subset-sum feasibility over a target is a 1-D boolean array iterated **right to left** so each item is used once.

## Pitfalls

- Off-by-one between "first `i` items" (size `n + 1`) and "item `i`" (size `n`) states — pick one and say it out loud.
- Initialising a min-DP with `0` instead of `Infinity` (or a max-DP with `0` when values can be negative).
- Rolling variables updated in the wrong order overwrite a value you still need.
- Forgetting the "impossible" sentinel when converting to the final answer (e.g. return `-1`).
