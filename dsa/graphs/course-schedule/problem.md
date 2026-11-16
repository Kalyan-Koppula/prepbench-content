---
title: Course Schedule
difficulty: Medium
order: 9
lists: [neetcode150, striver]
tags: [topological-sort, cycle-detection, bfs, dfs]
leetcode: course-schedule
function: canFinish
params:
  - { name: numCourses, type: number }
  - { name: prerequisites, type: "number[][]" }
returns: boolean
hints:
  - Model courses as nodes and each prerequisite as a directed edge. When is it impossible to take everything?
  - A directed cycle makes it impossible. Detect one with Kahn's algorithm (repeatedly take courses with no remaining prerequisites) or a three-colour DFS.
complexity: { time: "O(V + E)", space: "O(V + E)" }
---

There are `numCourses` courses labelled `0` to `numCourses - 1`. Each entry `[a, b]` in `prerequisites` means course `b` must be completed before course `a`.

Return `true` if it is possible to complete every course, otherwise `false`.

## Constraints

- `1 <= numCourses <= 2000`
- `0 <= prerequisites.length <= 5000`
- `prerequisites[i] = [a, b]` with `0 <= a, b < numCourses` and `a != b`
- No pair appears twice.
