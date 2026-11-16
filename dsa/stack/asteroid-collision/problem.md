---
title: Asteroid Collision
difficulty: Medium
order: 8
lists: [striver]
tags: [stack, simulation]
leetcode: asteroid-collision
function: asteroidCollision
params:
  - { name: asteroids, type: "number[]" }
returns: "number[]"
hints:
  - Only a right-mover followed (somewhere later) by a left-mover can collide. Which right-mover does an incoming left-mover hit first?
  - Keep the survivors on a stack. A new left-mover keeps destroying smaller right-movers on top until it dies, ties, or meets a left-mover / empty stack.
complexity: { time: "O(n)", space: "O(n)" }
---

`asteroids` lists asteroids in a row, from left to right. The absolute value is the asteroid's size; the sign is its direction (positive moves right, negative moves left). All asteroids travel at the same speed.

When two asteroids meet, the smaller one is destroyed; if they are the same size, both are destroyed. Asteroids moving in the same direction never meet.

Return the asteroids that remain after all collisions, in their left-to-right order.

## Constraints

- `2 <= asteroids.length <= 10^4`
- `-1000 <= asteroids[i] <= 1000`
- `asteroids[i] !== 0`
