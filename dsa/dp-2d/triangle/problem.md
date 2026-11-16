---
title: Triangle
difficulty: Medium
order: 3
lists: [striver]
tags: [dp]
leetcode: triangle
function: minimumTotal
params:
  - { name: triangle, type: "number[][]" }
returns: number
hints:
  - Going top-down, the last row has many possible end points. Going bottom-up, there is a single end point — the apex.
  - "`best[i][j] = triangle[i][j] + min(best[i+1][j], best[i+1][j+1])`."
  - Start from a copy of the last row and fold rows upward into it.
complexity: { time: "O(n²)", space: "O(n)" }
---

`triangle` is a list of rows where row `i` holds `i + 1` integers. A path starts at the single number in row `0` and goes down one row at a time; from position `j` in a row you may step to position `j` or `j + 1` in the next row.

Return the smallest possible sum of the numbers on a path that ends in the last row.

## Constraints

- `1 <= triangle.length <= 200`
- `triangle[i].length === i + 1`
- `-10^4 <= triangle[i][j] <= 10^4`

**Follow-up:** can you use only `O(n)` extra space, where `n` is the number of rows?
