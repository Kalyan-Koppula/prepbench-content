---
title: Binary Search Trees
order: 8
summary: Left < node < right everywhere — so inorder is sorted and every search is a single root-to-leaf walk.
---

## Recognise it

- The input is explicitly a BST, or you're asked to check/repair/build one.
- "kth smallest", "successor", "closest value", "range", "sorted" on a tree.
- An operation that should cost `O(h)` instead of `O(n)`: search, insert, delete, LCA.

## Templates

```ts
// Search / insert path: one comparison per level, O(h)
let cur = root
while (cur && cur.val !== target) cur = target < cur.val ? cur.left : cur.right

// Validate with bounds passed down (top-down state)
function valid(node: TreeNode | null, lo: number, hi: number): boolean {
  if (!node) return true
  if (node.val <= lo || node.val >= hi) return false
  return valid(node.left, lo, node.val) && valid(node.right, node.val, hi)
}
valid(root, -Infinity, Infinity)

// Inorder = sorted order; stop early for "kth" style questions
const stack: TreeNode[] = []
let node = root
while (node || stack.length) {
  while (node) { stack.push(node); node = node.left }
  node = stack.pop()!
  // node.val arrives in ascending order here
  node = node.right
}
```

## Interview notes

- The BST property is about **whole subtrees**, not just parent/child pairs. Carry `(lo, hi)` bounds or compare with the previous inorder value.
- Inorder traversal turns the tree into a sorted array — many BST problems are "sorted array" problems in disguise (two pointers, kth element, detect a swapped pair).
- Complexity is `O(h)`: `O(log n)` only if balanced. Say so; a sorted insert order degrades to a linked list.
- Successor of a node with a right child: leftmost node of the right subtree. Otherwise: the last ancestor where you went left.
- Delete has three cases: leaf, one child (splice it out), two children (copy in the successor, then delete it from the right subtree).
- Self-balancing trees (AVL, red-black) keep `h = O(log n)`; you won't code one, but know they exist and why.

## Pitfalls

- Duplicates: confirm whether they're allowed and which side they go on. Most problems assume distinct values.
- Initial bounds of `±2^31` fail on values at the 32-bit limits — use `±Infinity` or `null`.
- Recursing into both subtrees when the ordering tells you which one to skip throws away the `O(h)` advantage.
