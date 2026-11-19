**Key idea:** the inorder traversal of a BST is strictly increasing. Swapping two values creates "drops" where a value is smaller than the one before it: one drop if the swapped values were adjacent in inorder, two drops otherwise. The first wrong node is the larger value of the first drop; the second is the smaller value of the last drop. Swap their values back.

## Recognising the pattern

Turning a BST question into a sorted-sequence question is the main trick of the [Binary Search Trees](/problems/patterns/bst) sheet. "Two elements of a sorted array were swapped; find them" is a classic, and inorder with a `prev` pointer lets you solve it on the tree directly.

## Brute force

Collect the nodes in inorder, sort their values, and write the sorted values back into the nodes in order. That is the reference brute force below. Correct, since the sorted order is what a valid BST's inorder must be, but `O(n log n)` time and `O(n)` space.

## Optimal: find the drops during inorder

1. Iterative inorder with a stack, keeping `prev`, the previous node visited.
2. Whenever `prev.val > node.val` (a drop):
   - If `first` isn't set yet, set `first = prev`.
   - Always set `second = node`.
3. After the traversal, swap `first.val` and `second.val`.

**Why these two nodes.** Take the sorted sequence `1 2 3 4 5 6` and swap `2` and `5`: `1 5 3 4 2 6`. The drops are `5 → 3` and `4 → 2`. The misplaced large value is the left side of the first drop (`5`), and the misplaced small value is the right side of the last drop (`2`). If the swapped values were neighbours, as in `1 3 2 4`, there is only one drop, and it contains both: `first = 3`, `second = 2`.

## Walkthrough

```
      3
     / \
    1   4
       /
      2
```

Inorder visits `1, 3, 2, 4`.

| node | prev | drop? | first | second |
| --- | --- | --- | --- | --- |
| 1 | – | – | – | – |
| 3 | 1 | no | – | – |
| 2 | 3 | yes | 3 | 2 |
| 4 | 2 | no | 3 | 2 |

Swap `3` and `2`: inorder becomes `1, 2, 3, 4`.

## Complexity

- Sort and rewrite: time `O(n log n)`, space `O(n)`.
- Drops during inorder: time `O(n)`, space `O(h)` for the stack.
- Morris inorder (follow-up): time `O(n)`, space `O(1)`, by temporarily threading each left subtree's rightmost node to its successor instead of using a stack.

## Edge cases

- The swapped nodes are adjacent in inorder: one drop.
- One swapped node is the root.
- Values at the 32-bit limits: compare values only, never add or subtract them.

## Common mistakes

- Stopping at the first drop and taking both of its nodes, which fails when the swapped values aren't adjacent.
- Taking the smaller value of the **first** drop as the second node.
- Rebuilding or restructuring the tree. Only the two values move.

## In the interview

- Explain the drops on a sorted array first; the tree version then needs only a `prev` pointer.
- Mention Morris traversal for the `O(1)` follow-up even if you don't write it.
- Likely follow-ups:
  - *More than two values misplaced?* Then the sort-and-rewrite approach is the general fix.
  - *Same idea on an array?* Find the drops in one scan and swap.
