**Key insight:** take jobs in decreasing order of profit and park each one in the **latest** free slot before its deadline — that leaves the early slots for jobs that need them.

## Approach

1. Sort job indices by profit, descending.
2. For each job, find the latest free slot `t <= deadline`. If one exists, occupy it and add the profit; otherwise skip the job.
3. Return the count and the sum.

Exchange argument: suppose an optimal schedule skips the most profitable job `j`. Its slots up to `deadline[j]` can't all be empty, so swap `j` in for whichever job sits in the latest of them — profit doesn't drop. Placing `j` as late as possible keeps every other job's options as wide as they can be.

Finding the slot: the textbook version scans `t = deadline, deadline - 1, …, 1` for an empty slot, which is `O(n · maxDeadline)`. A union-find over slots makes it near-constant: `find(t)` returns the latest free slot `<= t`, and occupying `t` links it to `t - 1`.

## Complexity

- Time `O(n log n)` for the sort; the union-find lookups are near `O(1)` amortised.
- Space `O(n)` for the slot array and index order.

## Alternatives to mention

- Linear scan for a free slot: `O(n²)` worst case, but simple and usually what interviewers expect first.
- Process jobs by deadline with a min-heap of accepted profits: when the heap size exceeds the current deadline, drop the smallest profit. Also `O(n log n)`.

## Pitfalls

- Placing a job in the *earliest* free slot can block a later job with a tight deadline.
- Sorting by deadline alone ignores profit and is wrong.
