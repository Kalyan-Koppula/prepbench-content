**Key insight:** an unsuccessful search for `val` ends at exactly one null child — put the new node there.

## Approach

1. Empty tree → return a new node.
2. Walk down from the root: go left if `val < cur.val`, else right.
3. When the chosen child is null, attach `new TreeNode(val)` there and stop.
4. Return the original root.

## Complexity

- Time `O(h)` — one root-to-leaf walk.
- Space `O(1)` iteratively; `O(h)` for the recursive form `node.left = insert(node.left, val)`.

## Alternatives to mention

- Recursive insert: returns the (possibly new) subtree root and reassigns the child pointer — very short, but uses stack space.
- Other valid BSTs exist (e.g. making `val` the new root and re-hanging subtrees), which is why the statement pins down "insert as a leaf".

## Follow-ups

- Repeated inserts in sorted order produce a chain with `h = n`. Self-balancing trees (AVL, red-black) rotate after inserts to keep `h = O(log n)`.
