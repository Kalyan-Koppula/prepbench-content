---
title: 2-D Dynamic Programming
order: 15
summary: When one index can't describe the subproblem, use two — grid cells, two prefixes, item × capacity, or an interval.
---

## The idea

[1-D Dynamic Programming](/problems/patterns/dp-1d) names each subproblem with one number: a position, an amount. Many problems need **two** numbers to say where you are:

- A cell in a grid: row `i`, column `j`.
- Two strings being compared: how much of the first (`i`) and how much of the second (`j`) has been handled.
- Items and a budget: the first `i` items, with capacity `w` left.
- A range of an array: from `i` to `j`.
- A position and a mode: day `i`, holding a share or not.

The method doesn't change. You still answer the four questions (state, transition, base cases, answer); the table just has two dimensions, and the order in which you fill it needs a little more thought.

Here is the table for the longest common subsequence of `"ace"` and `"abcde"`. Each cell `lcs[i][j]` is the answer for the first `i` characters of one string and the first `j` of the other:

```
            ""  a   b   c   d   e
       ""    0   0   0   0   0   0
       a     0   1 ← 1 ← 1 ← 1 ← 1        match: diagonal + 1  (↖)
       c     0   1   1   2 ← 2 ← 2        no match: best of up (↑) and left (←)
       e     0   1   1   2   2   3
```

Every cell depends on three neighbours: up, left and up-left. Filling row by row, left to right, guarantees they are ready. That is the whole trick of most 2-D DP: **define the cell, see which neighbours it reads, fill in an order that has them ready.**

## When to reach for it

- A **grid** with moves in fixed directions (right/down), and a count, minimum or maximum.
- **Two sequences** to compare, align, match or merge: LCS, edit distance, interleaving, pattern matching.
- **Choose items under a limit**: knapsack, target sums, coin combinations.
- The answer for a **range** depends on where you split it: burst balloons, matrix chains, palindrome partitioning.
- A walk through time where you're in one of a few **modes**: stock trading with holding, cooldowns or a limited number of trades.

Look-alikes:

| Statement says | What to use instead |
| --- | --- |
| Grid with moves in all directions and costs | Dijkstra or BFS ([Advanced Graphs](/problems/patterns/advanced-graphs)); there may be cycles |
| One sequence, one index is enough | [1-D Dynamic Programming](/problems/patterns/dp-1d) |
| List every alignment or every subset | [Backtracking](/problems/patterns/backtracking) |
| Pick items where each local best choice is safe | [Greedy](/problems/patterns/greedy) |

The exception to the first row: if moves go in every direction but values strictly increase along a path (Longest Increasing Path in a Matrix), there are no cycles and memoised DFS works.

## How it works

Take **Edit Distance**: the fewest insertions, deletions and replacements to turn `"flaw"` into `"lawn"`. Define `dist[i][j]` = fewest edits to turn the first `i` characters of `"flaw"` into the first `j` of `"lawn"`.

- **Base cases.** `dist[i][0] = i` (delete all), `dist[0][j] = j` (insert all).
- **Transition.** If the last characters match, `dist[i][j] = dist[i − 1][j − 1]`. Otherwise `1 + min(replace: dist[i − 1][j − 1], delete: dist[i − 1][j], insert: dist[i][j − 1])`.

|  | "" | l | a | w | n |
| --- | --- | --- | --- | --- | --- |
| "" | 0 | 1 | 2 | 3 | 4 |
| f | 1 | 1 | 2 | 3 | 4 |
| l | 2 | 1 | 2 | 3 | 4 |
| a | 3 | 2 | 1 | 2 | 3 |
| w | 4 | 3 | 2 | 1 | 2 |

Read the diagonal of matches (`l`, `a`, `w`): after deleting `f`, everything lines up, and one insert of `n` finishes it. Answer 2.

The **invariant**: when `dist[i][j]` is computed, every cell above it and to its left is final. Row-major order guarantees this for every prefix-style table.

## Templates

### Grid paths

```ts
function gridPaths(m: number, n: number): number {
  const paths: number[][] = []
  for (let i = 0; i < m; i++) {
    paths.push(new Array(n).fill(0))
  }
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (i === 0 || j === 0) {
        paths[i][j] = 1
      } else {
        paths[i][j] = paths[i - 1][j] + paths[i][j - 1] // from above + from the left
      }
    }
  }
  return paths[m - 1][n - 1]
}
```

- For costs, replace `+` with `min` and add the cell's own value.

### Two prefixes (sequence comparison)

```ts
function compare(a: string, b: string): number {
  const m = a.length
  const n = b.length
  // table[i][j] = answer for the first i characters of a and the first j of b.
  const table: number[][] = []
  for (let i = 0; i <= m; i++) {
    table.push(new Array(n + 1).fill(0))
  }
  // Base cases: row 0 and column 0 describe an empty prefix.
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        table[i][j] = table[i - 1][j - 1] + 1 // use both characters
      } else {
        table[i][j] = Math.max(table[i - 1][j], table[i][j - 1]) // drop one of them
      }
    }
  }
  return table[m][n]
}
```

- The padded row and column (size `m + 1` by `n + 1`) remove almost all edge cases.
- Characters are at `i − 1` and `j − 1` because the table is indexed by prefix **length**.

### Items and capacity (0/1 knapsack)

```ts
function knapsack(weights: number[], values: number[], capacity: number): number {
  const best = new Array(capacity + 1).fill(0) // one row: best value for each capacity
  for (let i = 0; i < weights.length; i++) {
    for (let w = capacity; w >= weights[i]; w--) {
      // Downward: best[w - weight] still describes the items before i.
      if (best[w - weights[i]] + values[i] > best[w]) {
        best[w] = best[w - weights[i]] + values[i]
      }
    }
  }
  return best[capacity]
}
```

- The full table is `best[i][w]`; this is its one-row version.
- **Downward** = each item at most once. **Upward** = unlimited copies (unbounded knapsack, coin change).

### Intervals (split point)

```ts
function intervalDp(n: number): number {
  const best: number[][] = []
  for (let i = 0; i < n; i++) {
    best.push(new Array(n).fill(0)) // length-1 intervals: base case
  }
  for (let length = 2; length <= n; length++) {
    for (let i = 0; i + length - 1 < n; i++) {
      const j = i + length - 1
      best[i][j] = Infinity
      for (let k = i; k < j; k++) {
        const total = best[i][k] + best[k + 1][j] // + the cost of combining at k
        if (total < best[i][j]) {
          best[i][j] = total
        }
      }
    }
  }
  return best[0][n - 1]
}
```

- Fill by **length**, never by `i` alone: `[i, j]` reads shorter intervals only.
- `O(n³)`: `n²` intervals, `n` split points each.

### State machine (a few modes per step)

```ts
function stockWithCooldown(prices: number[]): number {
  let holding = -prices[0]
  let justSold = -Infinity
  let resting = 0
  for (let i = 1; i < prices.length; i++) {
    const oldHolding = holding
    const oldJustSold = justSold
    const oldResting = resting
    holding = Math.max(oldHolding, oldResting - prices[i])
    justSold = oldHolding + prices[i]
    resting = Math.max(oldResting, oldJustSold)
  }
  return Math.max(resting, justSold)
}
```

- The table is `day × mode`; each day reads only the previous day, so a few variables replace it.
- Copy the old values before updating any of them.

### Choosing a template

- Moves through a grid: **grid paths**.
- Two strings or arrays: **two prefixes**.
- Pick from items with a limit: **knapsack**, deciding the loop direction by whether items repeat.
- "Which split / which last operation?" over a range: **intervals**.
- A few modes that change step by step: **state machine**.

## Choosing the state

| Problem | Cell means | Reads |
| --- | --- | --- |
| Unique Paths | routes to (i, j) | up + left |
| Minimum Path Sum | cheapest cost to (i, j) | min(up, left) + cell |
| Longest Common Subsequence | LCS of a[0..i), b[0..j) | diagonal + 1, or max(up, left) |
| Edit Distance | edits from a[0..i) to b[0..j) | diagonal, or 1 + min of three |
| Distinct Subsequences | ways to form t[0..j) from s[0..i) | up, plus diagonal on a match |
| Interleaving String | s3[0..i+j) interleaves s1[0..i), s2[0..j) | up or left, with a character check |
| Regular Expression Matching | s[0..i) matches p[0..j) | diagonal; for `x*`: two left, or up |
| 0/1 Knapsack | best value, first i items, weight ≤ w | previous row at w and w − weight |
| Coin Change II | combinations, first i coins, amount x | previous row at x + same row at x − coin |
| Burst Balloons | best coins strictly between l and r | every split k between them |
| Stock with Cooldown | best profit on day i in each mode | yesterday's modes |

Two tests for a state definition:

1. Can you say what a cell means in one sentence?
2. Is the final answer a single cell (or a simple combination of cells)?

## Worked problems

**Unique Paths.** `paths[i][j] = paths[i − 1][j] + paths[i][j − 1]`; the first row and column are 1. One row of size `n` is enough. The closed form `C(m + n − 2, m − 1)` is a nice cross-check.

**Longest Common Subsequence.** On a match, extend the diagonal; otherwise drop a character from one side. Every "two strings" problem is a variation of this table.

**0/1 Knapsack.** For each item, skip it or take it from the **previous** row so it is used once. Compress to one row by iterating capacities downward.

**Burst Balloons.** Choose the **last** balloon `k` to burst between two walls; its neighbours are then the walls, and the two sides are independent. Interval DP, filled by width.

**Regular Expression Matching.** `x*` either disappears (`match[i][j − 2]`) or absorbs one more character while staying on the same column (`match[i − 1][j]`). Row 0 handles patterns like `a*b*` matching the empty string.

## Variations and tricks

- **Rolling rows.** If row `i` reads only row `i − 1`, keep two rows (or one, with the right direction). Space drops from `O(m · n)` to `O(n)`.
- **Iterate the direction that keeps old values.** Reading the previous row's `j − 1` from a single array means going right to left; reading the current row's `j − 1` means left to right.
- **Bottom-up versus top-down.** Memoised recursion over suffixes (`i..`, `j..`) is often easier to derive; the table over prefixes is easier to optimise.
- **Reconstruction.** Walk back from the final cell, following whichever neighbour produced each value. Keep the full table if you need this.
- **Pad with an empty row and column** instead of special-casing index 0.
- **State machines** are 2-D DP where one dimension is tiny; write them with variables.
- **Turning algebra into knapsack.** Target Sum becomes "count subsets summing to `(total + target) / 2`".

## Complexity

- Cells × work per cell. Most prefix and grid tables: `O(m · n)` time.
- Interval DP: `O(n²)` intervals × `O(n)` splits = `O(n³)`.
- Knapsack: `O(items × capacity)`, pseudo-polynomial in the capacity.
- Space: `O(m · n)` for the table, `O(n)` with rolling rows, unless you need to reconstruct the answer.

## Pitfalls

- Filling in an order where a cell reads something not yet computed (intervals by `i` instead of by length).
- Off-by-one between prefix lengths and character indices (`a[i − 1]`).
- Forgetting the base row or column (empty-string matches, `ways[i][0] = 1`).
- Wrong loop direction in one-row knapsack, which turns 0/1 into unbounded or the reverse.
- Swapping the loops in Coin Change II, which counts orderings instead of combinations.
- Updating several state-machine variables in place, mixing today's and yesterday's values.
- Exponential recursion when the memo is forgotten.

## Practice ladder

1. [Unique Paths](/problems/unique-paths): the basic grid recurrence.
2. [Minimum Path Sum](/problems/minimum-path-sum): the same grid with costs and `min`.
3. [Triangle](/problems/triangle): a triangular grid, cleanest bottom-up.
4. [Longest Common Subsequence](/problems/longest-common-subsequence): the two-prefix table.
5. [Coin Change II](/problems/coin-change-ii): counting combinations; why the loop order matters.
6. [Target Sum](/problems/target-sum): algebra that turns signs into a subset-sum count.
7. [0/1 Knapsack](/problems/knapsack-0-1): take or skip, each item once.
8. [Best Time to Buy and Sell Stock with Cooldown](/problems/best-time-to-buy-and-sell-stock-with-cooldown): a three-state machine.
9. [Interleaving String](/problems/interleaving-string): two prefixes feeding a third string.
10. [Edit Distance](/problems/edit-distance): three operations, three neighbours.
11. [Longest Increasing Path in a Matrix](/problems/longest-increasing-path-in-a-matrix): memoised DFS on an implicit DAG.
12. [Distinct Subsequences](/problems/distinct-subsequences): counting with skip-or-use.
13. [Wildcard Matching](/problems/wildcard-matching): a star that matches any sequence.
14. [Regular Expression Matching](/problems/regular-expression-matching): `x*` as a unit with two choices.
15. [Burst Balloons](/problems/burst-balloons): interval DP, choosing the last action.
16. [Matrix Chain Multiplication](/problems/matrix-chain-multiplication): the classic interval split.
