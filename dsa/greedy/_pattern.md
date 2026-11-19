---
title: Greedy
order: 16
summary: Commit to the locally best choice — but only after you can argue it never hurts.
---

## The idea

A greedy algorithm builds an answer one step at a time and, at each step, takes the choice that looks best **right now**, without ever going back. No table of subproblems, no search tree: one pass (often after a sort) and done.

That makes greedy the fastest and simplest tool on this site, and also the most dangerous. For many problems the locally best choice leads to a worse overall answer. The skill is not writing the loop; it is knowing **why** the local choice is safe.

Compare two coin systems, making 6 with the fewest coins:

```
coins 1, 2, 5:   take 5, then 1           → 2 coins   (optimal)
coins 1, 3, 4:   take 4, then 1, then 1   → 3 coins   (3 + 3 is better: 2 coins)
```

Same greedy rule, "take the largest coin that fits". It is correct for the first set and wrong for the second. Nothing in the code tells you which; only an argument does. When the argument fails, the problem needs [1-D Dynamic Programming](/problems/patterns/dp-1d) instead.

Two arguments cover almost every greedy you will meet:

1. **Exchange argument.** Take any optimal answer that differs from the greedy one. Show you can swap one of its choices for the greedy choice without making it worse. Repeating the swap turns the optimal answer into the greedy answer, so the greedy answer is optimal too.
2. **Stays ahead.** Show that after every step, the greedy partial answer is at least as good as any other partial answer of the same size (reaches at least as far, finishes at least as early). Then it is still ahead at the end.

## When to reach for it

- After sorting, the best next choice is obvious and never needs to be undone: intervals by end time, jobs by profit, items by value per weight.
- A single running quantity describes everything that matters about the past: the farthest index reachable, the current sum, the fuel in the tank.
- A choice is **forced**: the smallest card must start a group; the earliest-ending interval should be kept.
- Constraints are large (`n` up to `10^5` or more) and a DP table would be too big.
- The problem is a well-known greedy: interval scheduling, fractional knapsack, Huffman coding, minimum spanning trees, Dijkstra.

Look-alikes:

| Statement says | What to use instead |
| --- | --- |
| Fewest coins with an arbitrary coin set | DP ([1-D Dynamic Programming](/problems/patterns/dp-1d)) |
| Items can't be split, maximise value under a weight limit | 0/1 knapsack DP ([2-D Dynamic Programming](/problems/patterns/dp-2d)) |
| Count the ways, or list all arrangements | DP or [Backtracking](/problems/patterns/backtracking) |
| Merge or insert overlapping ranges | [Intervals](/problems/patterns/intervals) (often greedy too) |

## How it works

Take **Jump Game II**: from each index you can jump up to `nums[i]` steps; find the fewest jumps to reach the end. `nums = [3, 1, 1, 2, 1, 1]`.

Think of BFS levels. Index 0 is level 0. Level 1 is every index reachable with one jump: 1 to 3. Level 2 is everything reachable from level 1 but not before: up to `max(1 + 1, 2 + 1, 3 + 2) = 5`. Because levels are contiguous ranges, you only need two numbers per level: where the current level ends, and how far the next one reaches.

| i | i + nums[i] | farthest | end of level? | jumps | level ends at |
| --- | --- | --- | --- | --- | --- |
| 0 | 3 | 3 | yes | 1 | 3 |
| 1 | 2 | 3 | no | 1 | 3 |
| 2 | 3 | 3 | no | 1 | 3 |
| 3 | 5 | 5 | yes | 2 | 5 |
| 4 | 5 | 5 | no | 2 | 5 |

Two jumps. The greedy choice is "make the next level as far-reaching as possible", and the "stays ahead" argument proves it: after `k` jumps, no strategy can reach beyond the end of level `k`.

The **invariant**: every index up to the current level's end is reachable in at most `jumps` jumps, and nothing beyond it is.

## Templates

### Running state (Kadane-style)

```ts
function bestRun(nums: number[]): number {
  let current = nums[0] // best value of a run ending here
  let best = nums[0]
  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i]) // extend, or restart here
    best = Math.max(best, current)
  }
  return best
}
```

- The greedy decision is "drop the past when it can only hurt".

### Farthest reach

```ts
function canReachEnd(nums: number[]): boolean {
  let reach = 0
  for (let i = 0; i < nums.length; i++) {
    if (i > reach) {
      return false // this index can't be reached
    }
    reach = Math.max(reach, i + nums[i])
  }
  return true
}
```

- Works when the reachable set is always a prefix.

### Sort, then take what fits

```ts
function maxNonOverlapping(intervals: number[][]): number {
  intervals.sort((a, b) => a[1] - b[1]) // earliest end first
  let count = 0
  let lastEnd = -Infinity
  for (let i = 0; i < intervals.length; i++) {
    if (intervals[i][0] >= lastEnd) {
      count++ // it fits after the previous chosen interval
      lastEnd = intervals[i][1]
    }
  }
  return count
}
```

- The sort key **is** the greedy rule. Choosing it is the whole problem: earliest end for interval scheduling, highest ratio for fractional knapsack, highest profit for job sequencing.

### Two passes for two-sided constraints

```ts
function twoSided(ratings: number[]): number[] {
  const n = ratings.length
  const given = new Array(n).fill(1)
  for (let i = 1; i < n; i++) {
    if (ratings[i] > ratings[i - 1]) {
      given[i] = given[i - 1] + 1 // satisfy the left neighbour
    }
  }
  for (let i = n - 2; i >= 0; i--) {
    if (ratings[i] > ratings[i + 1] && given[i] <= given[i + 1]) {
      given[i] = given[i + 1] + 1 // satisfy the right neighbour too
    }
  }
  return given
}
```

### Choosing a template

- One value summarises the past: **running state** or **farthest reach**.
- Items to pick in some order: **sort, then take what fits**; spend your effort on the sort key.
- A rule involving both neighbours: **two passes**.
- The best item changes as you go (merge, schedule, simulate): a **heap** of candidates ([Heap / Priority Queue](/problems/patterns/heap)).

## Choosing the greedy rule

| Problem | Greedy rule | Why it is safe |
| --- | --- | --- |
| Maximum Subarray | Restart when the running sum is negative | A negative prefix only lowers what follows |
| Jump Game | Track the farthest reachable index | Reachable indices form a prefix |
| Jump Game II | Extend each level as far as possible | Stays ahead of any other jump sequence |
| Gas Station | Restart after any station where the tank goes negative | No station in the failed stretch can be a start |
| Hand of Straights | The smallest card starts a group | Nothing smaller is left to precede it |
| Partition Labels | Cut when the index reaches the farthest last occurrence | Earliest valid cut leaves the most room |
| Fractional Knapsack | Highest value per weight first | Exchange: swapping weight to a better ratio gains |
| Job Sequencing | Most profitable first, latest free slot | Exchange on profit; late placement blocks nothing |
| Minimum Platforms | Sweep sorted arrivals and departures | Only the count of overlaps matters |
| Candy | Left pass, then right pass with max | Each pass computes a lower bound |

If you can't fill in the last column for your problem, try to break your rule with a small example before coding it.

## Worked problems

**Gas Station.** If the total gas is less than the total cost, no start works. Otherwise drive from station 0; whenever the tank goes negative after station `i`, no station from the current start to `i` can work, so restart at `i + 1`. The last start is the answer.

**Partition Labels.** Record each letter's last index. Walk the string, stretching the current piece's end to the last index of every letter seen. When the index reaches that end, cut.

**Valid Parenthesis String.** Instead of choosing what each `*` is, track the range `[low, high]` of possible open-bracket counts. Fail if `high < 0`; clamp `low` at 0; succeed if `low = 0` at the end.

**Fractional Knapsack.** Sort by value per weight; take whole items, then a fraction of the next one. The 0/1 version, where items can't be split, is not greedy.

## Variations and tricks

- **Sort by end, not by start**, for "keep the most non-overlapping intervals".
- **Process in reverse** when the constraint points backwards (latest slot first in job sequencing).
- **Ranges instead of choices.** When each step has several options, track the set of possible outcomes as a range (Valid Parenthesis String).
- **Greedy plus a heap**, when the best choice changes as items are used (Task Scheduler, Reorganize String, IPO).
- **Greedy plus binary search on the answer.** Guess a value; check feasibility greedily (Koko Eating Bananas, Split Array Largest Sum).
- **Disprove quickly.** Try tiny inputs, including ties and negative numbers, before trusting a rule.

## Complexity

- Usually `O(n)` for a single pass, or `O(n log n)` when a sort comes first.
- With a heap: `O(n log n)`.
- Space is typically `O(1)` beyond the input, or `O(n)` for a sorted copy or an index order.

## Pitfalls

- Using a greedy rule that "looks right" without an argument (largest coin first, highest value first in 0/1 knapsack).
- The wrong sort key: by start instead of by end, by value instead of by ratio.
- Forgetting the global check (Gas Station's total, Hand of Straights' divisibility).
- Off-by-one at boundaries (Jump Game II's loop stopping at `n − 2`).
- Ties: make sure equal keys can't change the answer, or break them deliberately.

## Practice ladder

1. [Maximum Subarray](/problems/maximum-subarray): restart when the past only hurts.
2. [Jump Game](/problems/jump-game): the farthest-reach invariant.
3. [Jump Game II](/problems/jump-game-ii): BFS levels collapsed to two numbers.
4. [Gas Station](/problems/gas-station): elimination with a running balance.
5. [Hand of Straights](/problems/hand-of-straights): a forced choice from the smallest value.
6. [Merge Triplets to Form Target Triplet](/problems/merge-triplets-to-form-target-triplet): filter out the harmful, take the rest.
7. [Partition Labels](/problems/partition-labels): cut at the earliest valid point.
8. [Valid Parenthesis String](/problems/valid-parenthesis-string): track a range of possibilities.
9. [Job Sequencing](/problems/job-sequencing): profit order and the latest free slot.
10. [Fractional Knapsack](/problems/fractional-knapsack): sort by ratio; the textbook exchange argument.
11. [Minimum Platforms](/problems/minimum-platforms): a sweep over sorted events.
12. [Candy](/problems/candy): two passes for a two-sided rule.
