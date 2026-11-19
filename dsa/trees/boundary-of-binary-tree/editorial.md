**Key idea:** build the boundary from its parts in anticlockwise order: the root, the left edge going down (without its leaf), every leaf from left to right, and the right edge going back up (without its leaf). Each part is a short walk, and excluding leaves from the edges is what prevents duplicates.

## Recognising the pattern

This is a careful **decomposition** problem from the [Trees](/problems/patterns/trees) sheet. There is no clever trick; the work is defining each part precisely so that nodes appear exactly once. Writing a small helper per part keeps the code readable.

## Approach 1: four separate parts (reference solution)

1. **Root.** Start the result with `root.val`. The root is never treated as a leaf, so a single-node tree gives just `[root]`.
2. **Left edge.** Start at `root.left`. While the node exists and isn't a leaf, record it and move to its left child, or to its right child if there is no left child.
3. **Leaves.** A DFS over `root.left` and `root.right`, left before right, that records only leaves.
4. **Right edge.** Start at `root.right`. While the node exists and isn't a leaf, collect it and move right (or left if there is no right child). Append the collected values in **reverse**, since anticlockwise order goes up the right side.

The leaves are visited by their own DFS, and both edge walks stop before a leaf, so no node appears twice.

## Approach 2: one walk with flags (shown below as the alternative)

A single preorder DFS carries two flags: "on the left edge" and "on the right edge". Left-edge nodes are recorded on the way down, leaves when they are reached, and right-edge nodes on the way back up (after both children), which produces them bottom-up automatically. A child inherits the left flag if it is the left child, or the right child of a node with no left child, and symmetrically for the right flag.

It is one pass, but the flag rules are easy to get wrong. The four-part version is easier to explain.

## Walkthrough

```
         1
       /   \
      2     3
     / \   /
    4   5 6
       / \ \
      7   8 9
```

| part | values |
| --- | --- |
| root | 1 |
| left edge | 2 (4 is a leaf, so stop) |
| leaves | 4, 7, 8, 9 |
| right edge, top-down | 3, 6 |
| right edge, reversed | 6, 3 |

Result `[1, 2, 4, 7, 8, 9, 6, 3]`.

## Complexity

- Both approaches: time `O(n)`; each node is visited a constant number of times.
- Space: `O(h)` for recursion, plus the output.

## Edge cases

- A single node: `[root]`.
- No left child: the left edge is empty, and the leaves start straight after the root.
- No right child: the right edge is empty.
- The edge path switching sides, as when an edge node has only a right child.

## Common mistakes

- Including the leaf at the bottom of an edge in the edge, so it appears twice.
- Treating the root as a leaf in a single-node tree, which would list it twice.
- Forgetting to reverse the right edge.
- Following only left children on the left edge, and missing nodes where the edge continues to the right.

## In the interview

- Define the four parts out loud before coding, especially the "prefer left, else right" rule and the leaf exclusions.
- Likely follow-ups:
  - *Clockwise boundary?* Swap the roles of left and right and reverse the leaf order.
  - *Nodes visible from outside in a grid layout?* Usually phrased with column indices; see Vertical Order Traversal.
