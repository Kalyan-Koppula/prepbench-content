---
title: Walls and Gates
difficulty: Medium
order: 7
lists: [neetcode150]
tags: [bfs, multi-source-bfs, matrix]
leetcode: walls-and-gates
function: wallsAndGates
params:
  - { name: rooms, type: "number[][]" }
mutates: 0
hints:
  - A BFS from each empty room toward the gates repeats work. Search from the other direction.
  - Seed a single queue with every gate. The first time the BFS reaches a room is its distance to the nearest gate.
complexity: { time: "O(m · n)", space: "O(m · n)" }
---

A floor plan is an `m x n` grid `rooms` where each cell is:

- `-1` — a wall,
- `0` — a gate,
- `2147483647` (`2^31 - 1`, call it `INF`) — an empty room.

Fill every empty room, in place, with the number of steps to its nearest gate, moving only up, down, left or right through non-wall cells. Rooms that cannot reach any gate keep the value `INF`. Your function returns nothing; the grid after the call is checked.

## Constraints

- `1 <= m, n <= 100`
- `rooms[r][c]` is `-1`, `0` or `2147483647`
