**Key idea:** the depth of a tree is one (for the root) plus the depth of its deeper subtree. An empty tree has depth 0. That definition is already the algorithm.

## Recognising the pattern

A value computed **bottom-up** from the children's values is the most common shape in the [Trees](/problems/patterns/trees) sheet: recurse into both subtrees, combine their answers, return the result upward. The same skeleton gives size, height, balance, diameter and maximum path sums.

## Approach 1: recursive DFS (reference solution)

1. If the node is `null`, return 0.
2. Compute `left = maxDepth(node.left)` and `right = maxDepth(node.right)`.
3. Return `1 + max(left, right)`.

## Approach 2: level-order BFS (shown below as the alternative)

Process the tree one level at a time and count the levels. Start with the root as the current level. Build the next level from the current level's children. Stop when a level is empty. The number of levels processed is the depth.

BFS uses no recursion, so it can't overflow the stack, and it uses memory proportional to the widest level instead of the height.

## Walkthrough

```
    3
   / \
  9   20
     /  \
    15   7
```

| node | left depth | right depth | depth |
| --- | --- | --- | --- |
| 9 | 0 | 0 | 1 |
| 15 | 0 | 0 | 1 |
| 7 | 0 | 0 | 1 |
| 20 | 1 | 1 | 2 |
| 3 | 1 | 2 | 3 |

The answer is `3`. BFS sees the levels `[3]`, `[9, 20]` and `[15, 7]`: three levels.

## Complexity

- DFS: time `O(n)`, space `O(h)` for the call stack (`O(n)` for a chain).
- BFS: time `O(n)`, space `O(w)` for the widest level.

## Edge cases

- Empty tree: 0.
- A single node: 1.
- A chain of `n` nodes: depth `n`, the deepest recursion.

## Common mistakes

- Returning `-1` or `1` for an empty tree, which shifts every answer by one.
- Counting edges instead of nodes. This problem counts nodes; some textbooks define height in edges.
- Using `Math.min` by mistake, which gives the minimum depth (and is wrong even for that problem when one child is missing).

## In the interview

- State the recurrence in one line, then code it.
- Mention BFS for very deep trees.
- Likely follow-ups:
  - *Minimum depth?* Careful: a node with one child is not a leaf, so take the depth of the child that exists. BFS can stop at the first leaf.
  - *Is the tree balanced?* Compute heights bottom-up and return a "not balanced" signal as soon as two siblings differ by more than one (Balanced Binary Tree).
  - *Diameter?* At each node, combine the two subtree depths (Diameter of Binary Tree).
