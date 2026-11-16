---
title: Candy
difficulty: Hard
order: 12
lists: [striver]
tags: [greedy, two-pass]
leetcode: candy
function: candy
params:
  - { name: ratings, type: "number[]" }
returns: number
hints:
  - Handle the "higher than my left neighbour" rule and the "higher than my right neighbour" rule separately.
  - "Pass left to right for the left rule, then right to left for the right rule, keeping the max of both requirements at each position."
complexity: { time: "O(n)", space: "O(n)" }
---

Children stand in a line, and `ratings[i]` is the score of child `i`. Hand out candies so that:

- every child gets at least one candy, and
- any child whose rating is strictly higher than an adjacent child's gets strictly more candies than that neighbour.

Return the smallest total number of candies that satisfies both rules.

## Constraints

- `1 <= ratings.length <= 2 * 10^4`
- `0 <= ratings[i] <= 2 * 10^4`

**Follow-up:** can you do it in `O(1)` extra space?
