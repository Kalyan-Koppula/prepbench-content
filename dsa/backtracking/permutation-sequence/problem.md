---
title: Permutation Sequence
difficulty: Hard
order: 9
lists: [striver]
tags: [math, combinatorics, recursion]
leetcode: permutation-sequence
function: getPermutation
params:
  - { name: n, type: number }
  - { name: k, type: number }
returns: string
hints:
  - Listing permutations in order until the k-th one is O(n! · n). How many permutations start with each particular first digit?
  - "Exactly `(n-1)!` permutations start with each digit, so the first digit is determined by `floor((k - 1) / (n-1)!)`. Remove it and repeat on the rest."
complexity: { time: "O(n²)", space: "O(n)" }
---

Write the digits `1` to `n` in every possible order and sort these `n!` orderings lexicographically. Return the `k`-th ordering in that list (counting from `1`) as a string.

For `n = 3` the sorted list is `"123", "132", "213", "231", "312", "321"`.

## Constraints

- `1 <= n <= 9`
- `1 <= k <= n!`
