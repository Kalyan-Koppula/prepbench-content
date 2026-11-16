---
title: Job Sequencing
difficulty: Medium
order: 9
lists: [striver]
tags: [greedy, sorting, union-find]
function: jobSequencing
params:
  - { name: deadline, type: "number[]" }
  - { name: profit, type: "number[]" }
returns: "number[]"
hints:
  - Consider jobs from most to least profitable. When you accept a job, which time slot should it take?
  - "Put each accepted job in the latest free slot at or before its deadline, keeping earlier slots open for jobs with tighter deadlines."
  - "Finding \"latest free slot <= d\" quickly is a union-find trick: when slot `t` is used, link it to `t - 1`."
complexity: { time: "O(n log n)", space: "O(n)" }
---

There are `n` jobs. Job `i` takes exactly one unit of time, earns `profit[i]` if it is finished by time `deadline[i]`, and earns nothing otherwise. Time starts at `0`, only one job can run at a time, so the time slots are `1, 2, 3, …` and job `i` may occupy any slot `t` with `t <= deadline[i]`.

Choose which jobs to run to maximise total profit. Return `[jobsDone, maxProfit]`: the number of jobs in an optimal schedule and the profit it earns.

## Constraints

- `1 <= n <= 10^5`, `deadline.length === profit.length === n`
- `1 <= deadline[i] <= n`
- `1 <= profit[i] <= 500`

Because every profit is positive, all optimal schedules run the same number of jobs, so `jobsDone` is well defined.
