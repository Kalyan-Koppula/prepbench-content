**Key idea:** a tree is mirrored when every node's two subtrees are mirrored and then swapped. That is a direct recursion: invert the left subtree, invert the right subtree, and attach them on opposite sides. Each node is visited once.

## Recognising the pattern

The answer for a node depends only on the answers for its two children, which is the core recursive shape in the [Trees](/problems/patterns/trees) sheet: "solve both subtrees, combine at the node". Any traversal order that visits every node exactly once and swaps its children works.

## Approach 1: recursion (reference solution)

1. If the node is `null`, return `null`.
2. Invert the left subtree and the right subtree.
3. Set `node.left` to the inverted right subtree and `node.right` to the inverted left subtree.
4. Return the node.

Save both results before assigning. If you wrote `root.left = invertTree(root.right)` first, the original left child would be gone when you needed it.

## Approach 2: iterative BFS (shown below as the alternative)

Put the root in a queue. For each node taken from the queue, swap its two children, then add the non-null children to the queue. Every node gets its children swapped exactly once, which is all that mirroring needs; the order doesn't matter.

This avoids recursion, so it can't overflow the call stack on a very deep, skewed tree. A queue implemented as an array with a moving `head` index keeps each dequeue `O(1)`.

## Walkthrough

```
      4                4
    /   \            /   \
   2     7    →     7     2
  / \   / \        / \   / \
 1   3 6   9      9   6 3   1
```

| node | children before | children after |
| --- | --- | --- |
| 4 | 2, 7 | 7, 2 |
| 2 | 1, 3 | 3, 1 |
| 7 | 6, 9 | 9, 6 |
| leaves | none | none |

## Complexity

- Recursion: time `O(n)`, each node once. Space `O(h)` for the call stack, where `h` is the height: `O(log n)` for a balanced tree, `O(n)` for a chain.
- BFS: time `O(n)`. Space `O(w)` for the queue, where `w` is the widest level, up to about `n / 2`.

## Edge cases

- Empty tree: return `null`.
- A single node: nothing to swap.
- A chain leaning one way: it ends up leaning the other way. The deepest case for recursion.

## Common mistakes

- Overwriting `root.left` before saving it.
- Creating new nodes instead of rearranging the existing ones (allowed, but uses `O(n)` extra memory for no reason).
- Swapping only the root's children.

## In the interview

- One sentence: "mirror both subtrees and swap them." Then mention the iterative version for deep trees.
- Likely follow-ups:
  - *Is a tree symmetric?* Compare the left subtree with the mirror of the right one, without modifying anything (Symmetric Tree).
  - *Check whether two trees are mirrors?* The same recursion as Same Tree with left and right crossed.
