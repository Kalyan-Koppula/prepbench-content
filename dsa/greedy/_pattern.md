---
title: Greedy
order: 16
summary: Commit to the locally best choice — but only after you can argue it never hurts.
---

## Recognise it

- "Maximum / minimum number of …" where one pass over sorted (or ordered) input feels sufficient.
- Intervals, deadlines, schedules, reachability ("can you get to the end?").
- A choice made now never needs to be revisited: no "but what if I had picked the other one" branching.
- Constraints up to `10^5` that rule out an `O(n²)` DP.

## Templates

```ts
// Sort-then-scan: order by the key that makes the greedy choice obvious
items.sort((a, b) => a.end - b.end)
let lastEnd = -Infinity
let count = 0
for (const it of items) {
  if (it.start >= lastEnd) {
    count++
    lastEnd = it.end
  }
}
```

```ts
// Running state with a reset (Kadane, gas station)
let cur = 0
let best = -Infinity
for (const x of nums) {
  cur = Math.max(x, cur + x) // drop a negative prefix
  best = Math.max(best, cur)
}
```

## Justifying the choice

- **Exchange argument:** take any optimal answer that disagrees with the greedy's first choice; swap in the greedy choice and show the answer is no worse. Repeat → greedy is optimal.
- **Stays ahead:** show that after every step the greedy's partial solution is at least as good as any other (e.g. "reaches at least as far", "finishes no later").
- **Invariant on a range:** track the set of feasible states as a `[lo, hi]` window instead of enumerating them (wildcard parentheses, jump-game levels).
- If you can't sketch one of these in a sentence, suspect greedy is wrong.

## Interview notes

- Say the greedy rule *and* why it's safe before coding. Interviewers care more about the justification than the loop.
- Sorting is usually the `O(n log n)` bottleneck; the scan is `O(n)`.
- Two-pass greedy (left-to-right, then right-to-left) handles constraints that look at both neighbours (candy, trapping-style problems).
- Try a small counterexample in your head before committing: coins `{1, 3, 4}` for amount `6` breaks "largest coin first".

## When greedy fails → DP

- 0/1 knapsack (can't take fractions), coin change with arbitrary denominations, weighted interval scheduling.
- Signal: the best choice now depends on what's still available later, and you can find a small input where the greedy pick is wrong.
- Fallback: define the state the greedy was implicitly ignoring and write the recurrence.

## Pitfalls

- Sorting by the wrong key (start vs end time; value vs value/weight ratio).
- Ties: check that equal keys can't break the argument (e.g. arrival equal to departure).
- Proving on "typical" inputs only — test all-negative, single element, and already-saturated cases.
