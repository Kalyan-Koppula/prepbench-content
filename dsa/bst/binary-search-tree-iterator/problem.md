---
title: Binary Search Tree Iterator
difficulty: Medium
order: 8
lists: [striver]
tags: [bst, stack, design, iterator]
leetcode: binary-search-tree-iterator
kind: class
class: BSTIterator
params:
  - { name: root, type: TreeNode }
methods:
  - name: next
    params: []
    returns: number
  - name: hasNext
    params: []
    returns: boolean
hints:
  - Flattening the whole tree into a sorted array works, but uses `O(n)` memory. What's the least state an inorder traversal needs?
  - Keep a stack of nodes whose value hasn't been returned yet — start with the left spine from the root.
  - After returning a node, push the left spine of its right child.
complexity: { time: "O(1) amortised per call", space: "O(h)" }
---

Design an iterator over a binary search tree that returns its values in **ascending** order.

- `BSTIterator(root)` sets up the iterator for the tree rooted at `root`.
- `next()` returns the next smallest value not yet returned.
- `hasNext()` returns `true` if there are values left to return.

`next()` is only called when a value remains. Aim for `O(1)` amortised time per call and `O(h)` memory, where `h` is the tree's height.

Tests are a sequence of operations: the first creates the object, and the output lists each call's return value (`null` for the constructor and methods that return nothing). Trees are written in level order with `null` for a missing child: `[1,null,2]` is a root `1` whose only child is a right child `2`.

## Constraints

- `1 <= number of nodes <= 10^4`
- `0 <= Node.val <= 10^6`, all values distinct
- At most `2 * 10^4` calls to `next` and `hasNext` in total.
