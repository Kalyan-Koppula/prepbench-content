**Key idea:** inorder means left subtree, then the node, then the right subtree. The recursive version follows the definition. The iterative version simulates the call stack: walk as far left as possible, pushing nodes; pop one, record it, then continue with its right child.

## Recognising the pattern

Traversal orders are the foundation of the [Trees](/problems/patterns/trees) sheet. Inorder matters most for binary search trees, where it visits values in sorted order. Converting a recursion into a loop with an explicit stack is a skill interviewers test directly.

## Approach 1: recursion (shown below as the alternative)

`visit(node)`: if `node` is null, return; otherwise `visit(node.left)`, record `node.val`, `visit(node.right)`. Time `O(n)`, space `O(h)` for the call stack.

## Approach 2: iterative with a stack (reference solution)

The stack holds nodes whose left subtree is being processed and which are waiting to be recorded.

1. `current = root`, empty stack.
2. While `current` is not null or the stack is not empty:
   1. While `current` is not null: push it and move to `current.left`.
   2. Pop a node. Its left subtree is finished, so record its value.
   3. Set `current = node.right` and repeat.

Each node is pushed once and popped once.

**`O(1)` space: Morris traversal.** For each node with a left subtree, find its inorder predecessor (the rightmost node of the left subtree) and temporarily point that node's `right` back to the current node. This thread replaces the stack. When you return through it, remove it and record the node. Time stays `O(n)`, extra space is `O(1)`, but the tree is modified temporarily.

## Walkthrough

`root = [1, null, 2, 3]`: `1` has a right child `2`, and `2` has a left child `3`.

| step | action | stack | output |
| --- | --- | --- | --- |
| 1 | push 1, go left (null) | [1] | |
| 2 | pop 1, record, go right to 2 | [] | 1 |
| 3 | push 2, go left to 3, push 3, go left (null) | [2, 3] | 1 |
| 4 | pop 3, record, go right (null) | [2] | 1, 3 |
| 5 | pop 2, record, go right (null) | [] | 1, 3, 2 |

Result `[1, 3, 2]`.

## Complexity

- Recursion: time `O(n)`, space `O(h)`.
- Explicit stack: time `O(n)`, space `O(h)`.
- Morris: time `O(n)`, space `O(1)`.

## Edge cases

- Empty tree: an empty list.
- Left-leaning chain: everything is pushed first, then popped in reverse.
- Right-leaning chain: the stack never holds more than one node.

## Common mistakes

- Recording a node when it is pushed instead of when it is popped (that gives preorder).
- Forgetting the `stack.length > 0` part of the loop condition, so the loop stops when `current` becomes null with nodes still waiting.
- Building the result with array spreads at every level, which copies arrays and turns the recursion quadratic.

## In the interview

- Write the recursive version in one breath, then convert it to the stack version; that conversion is usually the real question.
- Likely follow-ups:
  - *Preorder or postorder iteratively?* Preorder records on push. Postorder can be done as a reversed "node, right, left" preorder, or with a "last visited" pointer.
  - *Kth smallest in a BST?* Stop the inorder walk after `k` pops (Kth Smallest Element in a BST).
  - *BST iterator?* This exact stack, paused between calls (Binary Search Tree Iterator).
