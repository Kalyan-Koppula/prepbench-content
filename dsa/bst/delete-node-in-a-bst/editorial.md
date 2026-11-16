**Key insight:** find the node, then handle three cases — no child, one child, two children. Only the last needs a trick: replace the value with the in-order successor's and delete the successor instead.

## Approach

Recursive `del(node, key)` returning the new subtree root:

1. `null` → `null` (key not found).
2. `key < node.val` → `node.left = del(node.left, key)`; `key > node.val` → same on the right. Return `node`.
3. Found it:
   - No left child → return `node.right` (covers the leaf case too).
   - No right child → return `node.left`.
   - Two children → let `succ` be the leftmost node of `node.right`. Copy `succ.val` into `node`, then `node.right = del(node.right, succ.val)`. The successor has no left child, so that second deletion hits an easy case.

## Complexity

- Time `O(h)` — one walk to the node and one down to its successor.
- Space `O(h)` recursion (an iterative version with a parent pointer is `O(1)`).

## Alternatives to mention

- Use the in-order **predecessor** (rightmost of the left subtree) instead — symmetric and equally valid.
- **Re-hang** instead of copying: attach the deleted node's left subtree under the leftmost node of its right subtree, and return the right subtree. Simple, but can make the tree much taller.
- Interviewers sometimes forbid copying values (nodes carry other data). Then splice the successor node itself into the deleted node's position, rewiring its parent's pointer.

## Pitfalls

- Forgetting to reassign the child pointer on the way back up (`node.left = del(...)`), so the deletion never sticks.
- Deleting the root: the return value of the top-level call *is* the new root.
