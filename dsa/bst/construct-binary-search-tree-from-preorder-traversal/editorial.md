**Key insight:** in preorder, a node's left subtree is the run of following values smaller than it; everything else up to the parent's bound belongs to the right subtree. Passing an upper bound down lets you consume the array in one left-to-right sweep.

## Approach

1. Keep a shared index `i` into `preorder`.
2. `build(bound)`: if the array is exhausted or `preorder[i] > bound`, this subtree is empty → `null`.
3. Otherwise create a node from `preorder[i++]`, then build its left subtree with bound `node.val` and its right subtree with the *inherited* `bound`.
4. Call `build(Infinity)`.

## Complexity

- Time `O(n)` — every value is consumed once; each failed bound check is `O(1)`.
- Space `O(h)` recursion.

## Alternatives to mention

- **Repeated insertion:** insert each value into the BST in order. `O(n · h)` — quadratic for sorted input.
- **Sort for inorder, then reuse "build from preorder + inorder":** `O(n log n)`; correct because a BST's inorder is its sorted values.
- **Monotonic stack:** push nodes; for each new value pop while the top is smaller — the last popped node gets the new value as its right child, otherwise it becomes the top's left child. `O(n)`.

## Pitfalls

- Giving the right subtree bound `node.val` instead of the parent's bound — every value would end up on the left chain or be lost.
