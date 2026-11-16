---
title: Matrix Chain Multiplication
difficulty: Hard
order: 16
lists: [striver]
tags: [dp, interval-dp]
function: matrixChainOrder
params:
  - { name: dims, type: "number[]" }
returns: number
hints:
  - Whatever the bracketing, there is one final multiplication that splits the chain into a left part and a right part.
  - If the split is after matrix `k`, the cost is (best for the left part) + (best for the right part) + the cost of multiplying the two results.
  - "`cost[i][j]` over chains of matrices `i..j`; fill by increasing chain length."
complexity: { time: "O(n³)", space: "O(n²)" }
---

You need the product of a chain of `n` matrices `M₀ · M₁ · … · Mₙ₋₁`. Their shapes are given by `dims` (length `n + 1`): matrix `Mᵢ` has `dims[i]` rows and `dims[i + 1]` columns, so consecutive matrices are always compatible.

Multiplying an `a × b` matrix by a `b × c` matrix costs `a · b · c` scalar multiplications and produces an `a × c` matrix. Matrix multiplication is associative, so you can choose the bracketing — but different bracketings cost different amounts.

Return the minimum total number of scalar multiplications needed to compute the whole product. A chain of one matrix costs `0`.

## Constraints

- `2 <= dims.length <= 100`
- `1 <= dims[i] <= 100`
