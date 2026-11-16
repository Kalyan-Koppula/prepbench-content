**Key insight:** you see one node per level — the rightmost — and it may sit in the left subtree when the right side is shallower.

## Approach (DFS, right first)

1. Recurse with `(node, depth)`, visiting the right child before the left.
2. The first time you reach a given `depth` (i.e. `depth === out.length`), that node is the rightmost on its level — record it.

## Approach (BFS)

Process level by level and record the last node of each level. Equally good; `O(w)` space instead of `O(h)`.

## Complexity

- Time `O(n)`.
- Space `O(h)` for DFS recursion (`O(w)` for BFS), plus the output.

## Pitfalls

- Following only right pointers from the root. If the left subtree is deeper, its deeper nodes are visible.

## Follow-ups

- Left side view: visit left before right (or take the first node of each level).
- Top / bottom view need horizontal distances — see *Vertical Order Traversal*.
