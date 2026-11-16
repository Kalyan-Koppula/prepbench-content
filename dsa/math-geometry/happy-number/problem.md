---
title: Happy Number
difficulty: Easy
order: 2
lists: [neetcode150]
tags: [math, cycle-detection, hash-set]
leetcode: happy-number
function: isHappy
params:
  - { name: n, type: number }
returns: boolean
hints:
  - The sequence either reaches `1` or loops forever. How do you notice a loop?
  - "Remember every value you've produced in a set — or run a slow and a fast pointer over the sequence, as with a linked-list cycle."
complexity: { time: "O(log n)", space: "O(1)" }
---

Start from a positive integer `n` and repeatedly replace it with the sum of the squares of its decimal digits. If this process eventually produces `1`, the number is called **happy**; otherwise it cycles forever through numbers that never include `1`.

Return `true` if `n` is happy, otherwise `false`.

## Constraints

- `1 <= n <= 2^31 - 1`
