---
title: Course Schedule II
difficulty: Medium
order: 10
lists: [neetcode150, striver]
tags: [topological-sort, bfs, dfs]
leetcode: course-schedule-ii
function: findOrder
params:
  - { name: numCourses, type: number }
  - { name: prerequisites, type: "number[][]" }
returns: "number[]"
compare: checker
hints:
  - You need a topological order of the prerequisite graph.
  - With Kahn's algorithm, the order in which courses reach indegree `0` is a valid schedule.
  - If fewer than `numCourses` courses get scheduled, there's a cycle — return `[]`.
complexity: { time: "O(V + E)", space: "O(V + E)" }
---

There are `numCourses` courses labelled `0` to `numCourses - 1`. Each entry `[a, b]` in `prerequisites` means course `b` must be completed before course `a`.

Return an order in which all courses can be taken, as an array containing every course exactly once. If several orders work, any one is accepted. If no order works, return an empty array.

## Constraints

- `1 <= numCourses <= 2000`
- `0 <= prerequisites.length <= 5000`
- `prerequisites[i] = [a, b]` with `0 <= a, b < numCourses` and `a != b`
- No pair appears twice.
