**Key insight:** in preorder, a node's right subtree comes straight after the *last* node of its left subtree — which is the left subtree's rightmost node. Splice it there and slide the left subtree over to the right.

## Approach (`O(1)` space)

Walk `cur` down the right pointers from the root. At each `cur` with a left child:

1. Find `pred`, the rightmost node of `cur.left`.
2. `pred.right = cur.right` — the right subtree now follows the left subtree.
3. `cur.right = cur.left; cur.left = null`.

Then move to `cur.right`. Every node is eventually reached by this walk, and each edge is traversed a constant number of times overall.

## Complexity

- Time `O(n)` — the rightmost-node searches walk disjoint right spines in total.
- Space `O(1)`.

## Alternatives to mention

- **Reverse preorder recursion** (right, left, node) with a `prev` pointer: set `node.right = prev; node.left = null; prev = node`. `O(n)` time, `O(h)` stack — very short to write.
- **Collect then relink:** push nodes into an array in preorder, then link `a[i].right = a[i+1]`. `O(n)` extra space; fine as a first answer.
- **Stack-based iterative preorder** linking each popped node to the next top of the stack.

## Pitfalls

- Overwriting `cur.right` before saving the original right subtree loses it.
- Forgetting `left = null` leaves a structure that still looks like a tree.
- You must reuse the existing nodes; building a new chain and returning it doesn't change `root`.
