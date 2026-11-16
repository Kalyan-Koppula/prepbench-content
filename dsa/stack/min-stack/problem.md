---
title: Min Stack
difficulty: Medium
order: 2
lists: [neetcode150, striver]
tags: [stack, design]
leetcode: min-stack
kind: class
class: MinStack
params: []
methods:
  - name: push
    params: [{ name: val, type: number }]
    returns: void
  - name: pop
    params: []
    returns: void
  - name: top
    params: []
    returns: number
  - name: getMin
    params: []
    returns: number
hints:
  - The minimum can change when you pop. What if each entry remembered the minimum at the moment it was pushed?
  - Keep a second stack (or store pairs) holding the running minimum alongside each value.
complexity: { time: "O(1) per operation", space: "O(n)" }
---

Design a stack that, besides the usual operations, can report its smallest element in constant time.

- `push(val)` puts `val` on top of the stack.
- `pop()` removes the top element.
- `top()` returns the top element.
- `getMin()` returns the smallest element currently in the stack.

Every operation must run in **O(1)** time. `pop`, `top` and `getMin` are only called when the stack is non-empty.

Tests are a sequence of operations: the first creates the object, and the output lists each call's return value (`null` for the constructor and methods that return nothing).

## Constraints

- `-2^31 <= val <= 2^31 - 1`
- At most `3 * 10^4` calls in total.
