**Key idea:** in preorder, each value is a node followed by its left subtree, then its right subtree. In a BST the left subtree is exactly the following values that are smaller than the node. So build recursively with an upper **bound**: take the next value as a node, build its left subtree from the values below the node, and its right subtree from the values below the parent's bound.

## Recognising the pattern

Building a tree from a traversal is a [Trees](/problems/patterns/trees) sheet recursion; the BST property from the [Binary Search Trees](/problems/patterns/bst) sheet replaces the inorder array you would otherwise need. The bounds technique is the same one used to validate a BST, run in reverse.

## Brute force

Insert the values one by one into an empty BST, in preorder order. That is the reference brute force below. It is correct because inserting in preorder recreates the same tree, but each insert walks from the root: `O(n · h)`, or `O(n²)` for a chain.

## Optimal: one pass with bounds

Keep a shared index `next` into `preorder`.

`build(bound)` builds the subtree consisting of the upcoming values smaller than `bound`:

1. If all values are used, or `preorder[next] > bound`, return null: the next value belongs higher up.
2. Create a node from `preorder[next]` and advance `next`.
3. `node.left = build(node.val)`: the following values smaller than this node.
4. `node.right = build(bound)`: the values after those, still below the outer bound.
5. Return the node.

Call `build(∞)`. Each value is consumed exactly once.

## Walkthrough

`preorder = [8, 5, 1, 7, 10, 12]`

| call (bound) | next value | action |
| --- | --- | --- |
| build(∞) | 8 | node 8 |
| build(8) | 5 | node 5, left of 8 |
| build(5) | 1 | node 1, left of 5 |
| build(1) | 7 > 1 | null (left of 1) |
| build(5) | 7 > 5 | null (right of 1) |
| build(8) | 7 | node 7, right of 5 |
| build(7), build(8) | 10 | both null |
| build(∞) | 10 | node 10, right of 8 |
| build(10) | 12 > 10 | null |
| build(∞) | 12 | node 12, right of 10 |

Result: `8` with left `5 (1, 7)` and right `10 (–, 12)`.

## Complexity

- Repeated inserts: time `O(n · h)` (`O(n²)` worst case), space `O(h)`.
- Bounds: time `O(n)`, space `O(h)` for the recursion.

## Edge cases

- One value: a single node.
- Strictly increasing values: a right-leaning chain.
- Strictly decreasing values: a left-leaning chain, the deepest recursion.

## Common mistakes

- Passing the node's value as the bound for the right subtree. The right subtree's bound is the parent's bound.
- Using a non-shared index, so values are reused.
- Sorting to get the inorder and then running the general preorder + inorder construction. It works, but costs `O(n log n)` and misses the point.

## In the interview

- Explain how the bound tells you where a subtree ends.
- Likely follow-ups:
  - *From postorder?* Read from the end, build the right subtree first, and use a lower bound.
  - *Verify that an array is a valid BST preorder?* Run the same bounded build and check that every value is consumed.
