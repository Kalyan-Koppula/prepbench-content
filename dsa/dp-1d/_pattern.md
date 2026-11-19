---
title: 1-D Dynamic Programming
order: 14
summary: Name the subproblem by one index, write how it depends on smaller ones, then fill a table (or two variables) from the smallest case up.
---

## The idea

Dynamic programming (DP) is for problems where the answer can be built from answers to **smaller versions of the same problem**, and those smaller answers are needed again and again. Plain recursion recomputes them every time and becomes exponential. DP computes each one once and stores it.

Climbing stairs shows the whole idea. You can take 1 or 2 steps at a time; how many ways are there to reach step `n`? Your last move came either from step `n − 1` or from step `n − 2`, so:

```
ways(n) = ways(n - 1) + ways(n - 2)
ways(0) = 1, ways(1) = 1
```

A naive recursive call tree for `ways(5)` recomputes `ways(3)` twice, `ways(2)` three times, and so on: about `1.6^n` calls. Storing each value once turns it into `n` steps:

| n | 0 | 1 | 2 | 3 | 4 | 5 |
| --- | --- | --- | --- | --- | --- | --- |
| ways | 1 | 1 | 2 | 3 | 5 | 8 |

Every DP solution answers the same four questions:

1. **State:** what does `dp[i]` mean, in words? ("the number of ways to reach step `i`", "the most money from the first `i` houses").
2. **Transition:** how is `dp[i]` computed from smaller states? This is the recurrence.
3. **Base cases:** the smallest states, set directly.
4. **Answer:** which state (or which combination of states) is the final answer.

"1-D" means the state is a single index: a position in an array or string, or an amount. Problems whose state needs two indices are in [2-D Dynamic Programming](/problems/patterns/dp-2d).

## When to reach for it

- "**How many ways**", "**minimum** / **maximum** cost", "**can** you reach / make / split".
- Choices at each step whose effects depend only on a small summary of what came before (position, remaining amount).
- A brute force that tries every combination and visibly recomputes the same subproblems.
- Constraints around `n ≤ 10^4` (for `O(n²)`) or `n ≤ 10^5` (for `O(n)` or `O(n log n)`).

Look-alikes:

| Statement says | What to use instead |
| --- | --- |
| List **all** combinations | Backtracking ([Backtracking](/problems/patterns/backtracking)); DP only counts or optimises |
| A locally best choice is always safe | Greedy ([Greedy](/problems/patterns/greedy)) |
| Shortest path with non-uniform costs on a graph | Dijkstra ([Advanced Graphs](/problems/patterns/advanced-graphs)) |
| Two sequences, or a grid | 2-D DP |

## How it works

Take **House Robber**: houses in a row with amounts `[2, 7, 9, 3, 1]`; you can't rob two neighbours. Define `dp[i]` = the most money from houses `0..i`. For house `i`, either skip it (keep `dp[i − 1]`) or rob it (add `nums[i]` to `dp[i − 2]`):

```
dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])
```

| i | nums[i] | skip: dp[i−1] | rob: dp[i−2] + nums[i] | dp[i] |
| --- | --- | --- | --- | --- |
| 0 | 2 | – | 2 | 2 |
| 1 | 7 | 2 | 7 | 7 |
| 2 | 9 | 7 | 2 + 9 = 11 | 11 |
| 3 | 3 | 11 | 7 + 3 = 10 | 11 |
| 4 | 1 | 11 | 11 + 1 = 12 | 12 |

The **invariant**: when you compute `dp[i]`, every `dp[j]` with `j < i` is already final. That is why the table is filled from small to large (bottom-up). Each `dp[i]` only looks back two steps, so two variables are enough instead of a whole array.

## Templates

### Bottom-up table

```ts
function solve(nums: number[]): number {
  const n = nums.length
  const dp = new Array(n + 1).fill(0)
  dp[0] = 0 // base case(s)
  for (let i = 1; i <= n; i++) {
    dp[i] = 0 // combine dp[smaller indices] with nums[i - 1]
  }
  return dp[n]
}
```

- Sizing the table `n + 1` with `dp[0]` as "empty prefix" removes many edge cases.

### Two variables (when only the last few states matter)

```ts
function rob(nums: number[]): number {
  let twoBack = 0 // best for houses up to i - 2
  let oneBack = 0 // best for houses up to i - 1
  for (let i = 0; i < nums.length; i++) {
    const current = Math.max(oneBack, twoBack + nums[i])
    twoBack = oneBack
    oneBack = current
  }
  return oneBack
}
```

### Top-down with memoisation

```ts
function ways(n: number, memo: number[]): number {
  if (n <= 1) {
    return 1
  }
  if (memo[n] !== -1) {
    return memo[n]
  }
  memo[n] = ways(n - 1, memo) + ways(n - 2, memo)
  return memo[n]
}
// ways(n, new Array(n + 1).fill(-1))
```

- Top-down follows the recurrence directly and only computes states that are needed. Bottom-up avoids recursion depth limits and is usually faster.

### Unbounded choices over an amount (coin change shape)

```ts
function fewestCoins(coins: number[], amount: number): number {
  const dp = new Array(amount + 1).fill(Infinity)
  dp[0] = 0
  for (let a = 1; a <= amount; a++) {
    for (let c = 0; c < coins.length; c++) {
      if (coins[c] <= a && dp[a - coins[c]] + 1 < dp[a]) {
        dp[a] = dp[a - coins[c]] + 1
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount]
}
```

### Choosing a template

- Each state depends on a fixed few earlier ones: **two variables**.
- Each state depends on all earlier ones (LIS, word break): a **full table**, often `O(n²)`.
- The state is an amount and items can be reused: **amount loop outside, items inside**.
- Hard to see the order of computation, or many states unused: **top-down memo**.

## Choosing the state

| Problem | dp[i] means | Transition |
| --- | --- | --- |
| Climbing Stairs | ways to reach step i | dp[i−1] + dp[i−2] |
| House Robber | best from houses 0..i | max(dp[i−1], dp[i−2] + nums[i]) |
| Decode Ways | ways to decode the first i characters | one-digit and two-digit endings |
| Coin Change | fewest coins for amount i | min over coins of dp[i − coin] + 1 |
| Word Break | can the first i characters be split | any j with dp[j] and s[j..i) a word |
| Longest Increasing Subsequence | longest LIS ending at i | 1 + max dp[j] over j < i with nums[j] < nums[i] |
| Partition Equal Subset Sum | can some subset make sum i | 0/1 knapsack over the items |

A good test of a state definition: can you say in one sentence what `dp[i]` means, and does the final answer follow from it directly?

## Worked problems

**Climbing Stairs.** `dp[i] = dp[i − 1] + dp[i − 2]`, the Fibonacci numbers. Two variables, `O(n)`.

**Coin Change.** `dp[a]` = fewest coins for amount `a`. Try each coin as the last one: `dp[a] = min(dp[a − c] + 1)`. Unreachable amounts stay infinite.

**Longest Increasing Subsequence.** `dp[i]` = length of the longest increasing subsequence **ending at** `i`. Look back at every smaller element: `O(n²)`. The patience-sorting trick with binary search brings it to `O(n log n)`.

**Partition Equal Subset Sum.** If the total is odd, no. Otherwise ask whether some subset sums to half. `dp[s]` = "sum `s` is reachable"; for each number, update sums from high to low so each number is used at most once.

## Variations and tricks

- **0/1 versus unbounded items.** Iterating sums **downward** uses each item once (0/1 knapsack); **upward** allows reuse (coin change).
- **Ending-at versus up-to.** "Best subsequence ending at `i`" needs a final `max` over all `i`; "best for the prefix up to `i`" is just `dp[n]`.
- **Circular arrays.** Solve twice, once without the first element and once without the last (House Robber II).
- **Tracking min and max together.** For products, a negative number swaps them (Maximum Product Subarray).
- **Reconstructing the answer.** Store the choice made at each state, then walk back from the end.

## Complexity

- States × work per state. Fixed lookback: `O(n)` time, `O(1)` space. Look back at all earlier states: `O(n²)`.
- Amount-based DP: `O(amount × items)`.
- Top-down: the same, plus `O(n)` recursion depth.

## Pitfalls

- An unclear state definition, which leads to wrong transitions.
- Wrong base cases, especially for empty input (`dp[0]`).
- Iterating sums in the wrong direction for 0/1 problems, letting an item be reused.
- Using `0` as "impossible" for minimisation problems; use infinity.
- Forgetting the final `max` over all positions when the state is "ending at `i`".

## Practice ladder

1. [Climbing Stairs](/problems/climbing-stairs): the simplest recurrence.
2. [Min Cost Climbing Stairs](/problems/min-cost-climbing-stairs): the same shape with costs.
3. [House Robber](/problems/house-robber): take or skip with a neighbour constraint.
4. [House Robber II](/problems/house-robber-ii): a circular version solved as two linear ones.
5. [Decode Ways](/problems/decode-ways): counting with one- and two-character choices.
6. [Coin Change](/problems/coin-change): minimisation over an amount with reusable items.
7. [Maximum Product Subarray](/problems/maximum-product-subarray): tracking both a minimum and a maximum.
8. [Word Break](/problems/word-break): each state looks back at all split points.
9. [Longest Increasing Subsequence](/problems/longest-increasing-subsequence): "ending at i" states, and the `O(n log n)` trick.
10. [Partition Equal Subset Sum](/problems/partition-equal-subset-sum): 0/1 knapsack with booleans.
11. [Longest Palindromic Substring](/problems/longest-palindromic-substring): expanding around centres, a DP in disguise.
12. [Palindromic Substrings](/problems/palindromic-substrings): counting with the same centre expansion.
13. [Perfect Squares](/problems/perfect-squares): coin change with squares as coins.
14. [Largest Divisible Subset](/problems/largest-divisible-subset): LIS-style DP plus reconstruction.
