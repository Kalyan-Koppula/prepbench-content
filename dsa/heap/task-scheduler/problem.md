---
title: Task Scheduler
difficulty: Medium
order: 5
lists: [neetcode150]
tags: [heap, greedy, counting]
leetcode: task-scheduler
function: leastInterval
params:
  - { name: tasks, type: "string[]" }
  - { name: n, type: number }
returns: number
hints:
  - Only the count of each task type matters, not the order they're listed in.
  - Greedily run the available type with the most copies left. A max-heap of counts plus a queue of types cooling down simulates this.
  - "Faster still: the most frequent type forces a frame of `(maxCount - 1) * (n + 1)` slots, plus one slot per type tied for that max count."
complexity: { time: "O(T log 26)", space: "O(26)" }
---

A CPU must run a list of `tasks`, each labelled with an uppercase letter. Every time unit it either runs one task (any order) or sits idle. After running a task of some label, it must wait at least `n` time units before running another task with the **same** label.

Return the minimum number of time units needed to finish all tasks, counting idle units.

## Constraints

- `1 <= tasks.length <= 10^4`
- `tasks[i]` is an uppercase English letter.
- `0 <= n <= 100`
