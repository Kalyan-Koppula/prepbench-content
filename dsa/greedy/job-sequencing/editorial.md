**Key idea:** consider jobs from the most profitable down. Each job takes one unit of time and must finish by its deadline. Put each job in the **latest** free time slot at or before its deadline; if there is none, skip it. Taking the most profitable jobs first, and placing each as late as possible, keeps the early slots free for jobs with tight deadlines.

## Recognising the pattern

Scheduling unit-length tasks with deadlines and rewards is a classic exchange-argument greedy from the [Greedy](/problems/patterns/greedy) sheet: sort by the reward, then fit each item in the least harmful place.

## Alternative: DP over feasible sets (shown below)

A set of jobs can all be scheduled exactly when, sorted by deadline, the `k`-th one has a deadline of at least `k`. So sort by deadline and let `best[k]` be the most profit from a feasible set of `k` jobs; each job can become the `k`-th one if its deadline allows. That is the reference brute force below. `O(n²)`, and an independent check of the greedy.

## Greedy with time slots

1. Sort job indices by profit, highest first.
2. `taken[1..n] = false`.
3. For each job: start at `slot = min(deadline, n)` and move down while the slot is taken. If a free slot `≥ 1` is found, take it, count the job and add its profit.
4. Return `[jobs done, total profit]`.

**Why the latest free slot.** Placing a job early could block a later job whose deadline is earlier. Placing it as late as possible never blocks anything that an early placement wouldn't.

**Why profit order is safe.** Suppose an optimal schedule skips a high-profit job the greedy takes. Swap it in for a lower-profit job occupying a slot that suits it; the profit doesn't go down. Repeating this turns any optimal schedule into the greedy one.

## Walkthrough

`deadline = [2, 1, 2, 3]`, `profit = [50, 10, 20, 30]`. By profit: job 0 (50, d 2), job 3 (30, d 3), job 2 (20, d 2), job 1 (10, d 1).

| job | deadline | slots tried | placed in | profit so far |
| --- | --- | --- | --- | --- |
| 0 | 2 | 2 | 2 | 50 |
| 3 | 3 | 3 | 3 | 80 |
| 2 | 2 | 2 (taken), 1 | 1 | 100 |
| 1 | 1 | 1 (taken) | – | 100 |

Answer `[3, 100]`.

## Complexity

- DP over feasible sets: `O(n²)`.
- Greedy with a slot scan: `O(n log n)` to sort plus `O(n²)` scanning in the worst case.
- Greedy with union-find over slots ("next free slot at or before `t`"): `O(n log n)` overall, dominated by the sort.

## Edge cases

- Deadlines larger than `n`: cap them at `n`, since there are only `n` jobs.
- All deadlines 1: only the single most profitable job runs.
- Equal profits: any order among them gives the same total.

## Common mistakes

- Placing each job in the **earliest** free slot.
- Sorting by deadline and taking greedily by deadline, which ignores profit.
- Forgetting to cap deadlines, which wastes time scanning or overflows an array.

## In the interview

- Explain "latest free slot" with a small counter-example where the earliest slot fails.
- Likely follow-ups:
  - *Faster slot search?* Union-find where each slot points to the next free slot below it.
  - *Jobs with different lengths?* That becomes a weighted scheduling problem: DP over jobs sorted by end time, with binary search.
