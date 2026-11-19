**Key idea:** from the right you see exactly one node per level, the rightmost one. Either take the last node of each BFS level, or do a DFS that visits the right child first and records the first node it reaches at each new depth.

## Recognising the pattern

"One answer per depth" is a level-oriented question from the [Trees](/problems/patterns/trees) sheet. It can be answered with BFS (per level) or with DFS carrying the depth, as long as the visiting order guarantees which node of a level is seen first.

## Approach 1: DFS, right child first (reference solution)

`viewFromRight(node, depth)`:

1. If `node` is null, return.
2. If `depth` equals the number of values recorded so far, this is the first node seen at this depth: record it.
3. Recurse into `node.right` with `depth + 1`, then into `node.left`.

Because the right subtree is explored first at every node, the first node reached at each depth is the rightmost one on that level, even if it lives in a left subtree (when the right side is shorter).

## Approach 2: BFS, last node of each level (shown below as the alternative)

Traverse level by level and record the last node of each level. Straightforward and easy to explain. It uses `O(w)` memory for the widest level instead of `O(h)` for the recursion.

## Walkthrough

```
    1
   / \
  2   3
   \
    5
```

DFS order with right first: `1 (depth 0)`, `3 (depth 1)`, `2 (depth 1)`, `5 (depth 2)`.

| node | depth | recorded so far | record? |
| --- | --- | --- | --- |
| 1 | 0 | [] | yes → [1] |
| 3 | 1 | [1] | yes → [1, 3] |
| 2 | 1 | [1, 3] | no (depth 1 already has a value) |
| 5 | 2 | [1, 3] | yes → [1, 3, 5] |

Result `[1, 3, 5]`. Note that `5` comes from the left subtree: nothing on the right reaches depth 2.

## Complexity

- DFS: time `O(n)`, space `O(h)` for recursion.
- BFS: time `O(n)`, space `O(w)`.

## Edge cases

- Empty tree: `[]`.
- The right side shorter than the left: deeper levels come from the left subtree.
- A left-leaning chain: every node is visible.

## Common mistakes

- Only following right children down from the root, which misses deeper levels on the left.
- Recursing left before right in the DFS, which gives the left side view.
- Recording a node per depth without checking whether that depth already has one.

## In the interview

- Explain why "first node at each depth, right first" gives the rightmost node.
- Likely follow-ups:
  - *Left side view?* Recurse left first, or take the first node of each BFS level.
  - *Top or bottom view (by column)?* Track horizontal positions with BFS (related to Vertical Order Traversal).
