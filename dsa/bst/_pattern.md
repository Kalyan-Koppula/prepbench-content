---
title: Binary Search Trees
order: 8
summary: Left < node < right in every subtree — so inorder is sorted, and search, insert and delete are one walk from the root.
---

## The idea

A binary search tree (BST) is a binary tree with one extra rule, the **BST property**: for every node, every value in its left subtree is smaller than the node, and every value in its right subtree is larger.

```
          8
        /   \
       3     10
      / \      \
     1   6      14
        / \     /
       4   7   13
```

The rule applies to **whole subtrees**, not just parent and child. `7` is in `8`'s left subtree, so it must be less than 8, which it is. If `7` were `9`, every parent/child pair would still look fine (9 > 6), but the tree would be broken.

Two consequences make BSTs useful:

1. **Search is one walk down.** At each node, compare the target with the node's value: equal means found, smaller means go left, larger means go right. You never need to look at the other side. The cost is the height `h` of the tree.
2. **Inorder traversal is sorted.** Visiting left subtree, node, right subtree lists the values in increasing order: `1 3 4 6 7 8 10 13 14` for the tree above. Many BST questions are really sorted-array questions in disguise.

The height is what decides speed. A balanced BST has `h ≈ log₂ n`, so operations take about 20 steps for a million values. But inserting values in sorted order builds a chain, with `h = n`, and every operation becomes linear. Self-balancing trees (AVL, red-black) rotate nodes to keep the height logarithmic; you won't write one in an interview, but you should say why they exist.

## When to reach for it

- The input is stated to be a BST, or you are asked to check, build, repair or modify one.
- The question mentions order on a tree: "kth smallest", "successor", "closest value", "values in a range", "sorted".
- You need an operation in `O(h)` instead of `O(n)`: search, insert, delete, lowest common ancestor.

Look-alikes:

| Statement says | What to use instead |
| --- | --- |
| A plain binary tree (no ordering) | General tree recursion from the [Trees](/problems/patterns/trees) sheet |
| "kth largest in a stream", "top k" without a tree | A heap ([Heap](/problems/patterns/heap)) |
| Sorted data with no updates | A sorted array and [Binary Search](/problems/patterns/binary-search) |
| Prefix queries on strings | A trie ([Tries](/problems/patterns/tries)) |

## How it works

Walk through searching for `6` and for `5` in the tree above:

| step | node | compare with 6 | compare with 5 |
| --- | --- | --- | --- |
| 1 | 8 | smaller → left | smaller → left |
| 2 | 3 | larger → right | larger → right |
| 3 | 6 | found | smaller → left |
| 4 | 4 | – | larger → right |
| 5 | null | – | not found |

The **invariant** during a search: if the target is in the tree, it is in the subtree of the current node. Each comparison discards the other subtree entirely. Insertion follows exactly the same path and attaches the new node where the search fell off the tree, at the `null` in step 5.

## Templates

### Search (and the insert path)

```ts
function search(root: TreeNode | null, target: number): TreeNode | null {
  let current = root
  while (current !== null && current.val !== target) {
    if (target < current.val) {
      current = current.left
    } else {
      current = current.right
    }
  }
  return current // null if not found
}
```

- Iterative is preferable: no stack, and the loop is as short as the recursion.
- For **insert**, keep track of the parent and attach the new node on the correct side when `current` becomes null.

### Validate with bounds passed down

```ts
function isValid(node: TreeNode | null, low: number, high: number): boolean {
  if (node === null) {
    return true
  }
  if (node.val <= low || node.val >= high) {
    return false
  }
  return isValid(node.left, low, node.val) && isValid(node.right, node.val, high)
}
// isValid(root, -Infinity, Infinity)
```

- Each node must lie strictly between the bounds set by **all** its ancestors. Going left tightens the upper bound; going right tightens the lower one.
- Start with `-Infinity` and `Infinity`, not with the 32-bit limits: a tree may contain those exact values.

### Inorder with an explicit stack (stop early)

```ts
function kthSmallest(root: TreeNode | null, k: number): number {
  const stack: TreeNode[] = []
  let current = root
  let seen = 0
  while (current !== null || stack.length > 0) {
    while (current !== null) {
      stack.push(current)
      current = current.left
    }
    const node = stack.pop() as TreeNode
    seen++
    if (seen === k) {
      return node.val // values arrive in ascending order
    }
    current = node.right
  }
  return -1
}
```

- The iterative version lets you stop after `k` values, costing `O(h + k)` instead of `O(n)`.
- The same stack, paused between calls, is a **BST iterator**.

### Choosing a template

- A target value or an insertion point: the **search walk**.
- A property every node must satisfy relative to its ancestors: **bounds passed down**.
- Anything about ranks, order or neighbouring values: **inorder**, recursive or with a stack.

## Choosing what to track

| Question | Track | Why |
| --- | --- | --- |
| Is it a valid BST? | `(low, high)` bounds per call, or the previous inorder value | The rule is about all ancestors, not just the parent |
| kth smallest | A counter during inorder | Inorder visits values in sorted order |
| Successor of a node | The last node where you went left | If there is no right subtree, the successor is the nearest ancestor you are in the left subtree of |
| Two swapped nodes | The previous inorder value and the "drops" where it decreases | A sorted sequence with two swapped values has one or two drops |
| LCA of two values | Just the current node | The paths split where one value is smaller and the other larger |

## Worked problems

**Validate Binary Search Tree.** Pass `(low, high)` down. A left child inherits the parent's value as its new upper bound, a right child as its new lower bound. Any node outside its bounds breaks the tree. Equivalent check: an inorder traversal must be strictly increasing.

**Kth Smallest Element in a BST.** Inorder with a stack, stopping after `k` pops. The follow-up, frequent updates, is answered by storing subtree sizes in each node so you can choose left or right by rank.

**Lowest Common Ancestor of a BST.** Walk from the root. If both values are smaller than the current node, go left; if both are larger, go right; otherwise the current node is where their paths split, and it is the answer. No need to search both subtrees as in a general tree.

**Delete Node in a BST.** Find the node, then three cases. A leaf is removed. A node with one child is replaced by that child. A node with two children takes the value of its inorder **successor** (the leftmost node of its right subtree), and that successor is deleted from the right subtree, where it has at most one child.

## Variations and tricks

- **Previous-value inorder.** Many checks compare each inorder value with the one before it: validation (must increase), minimum difference (adjacent values), recovering swapped nodes (find the drops).
- **Build from sorted data.** The middle element becomes the root, and the halves become the subtrees: a balanced BST in `O(n)`.
- **Build from preorder.** Insert with bounds: the next preorder value belongs to the current subtree only if it fits the current `(low, high)` range, which gives `O(n)` instead of `n` separate inserts.
- **Two-sum on a BST.** Either a hash set during any traversal, or two inorder iterators, one ascending and one descending, used like two pointers on a sorted array.
- **Floor and ceiling.** Walk the search path and remember the last node that was `<=` (floor) or `>=` (ceiling) the target.

## Complexity

- Search, insert, delete, LCA, floor and ceiling: `O(h)` time, `O(1)` space iteratively. `h` is `O(log n)` when balanced and `O(n)` in the worst case.
- Full traversals (validate, build, recover): `O(n)` time, `O(h)` space for recursion or the stack.
- kth smallest with an early-exit inorder: `O(h + k)`.

## Pitfalls

- Validating only parent/child pairs instead of the full ancestor bounds.
- Using `Number.MIN_SAFE_INTEGER` or 32-bit limits as initial bounds when values can equal them.
- Allowing duplicates without deciding which side they go on. Most problems guarantee distinct values; ask.
- Recursing into both subtrees when the ordering tells you which one to skip, which loses the whole advantage.
- Assuming `O(log n)` without mentioning balance.

## Practice ladder

1. [Two Sum IV - Input is a BST](/problems/two-sum-iv-input-is-a-bst): any traversal plus a hash set, or two iterators on a sorted order.
2. [Validate Binary Search Tree](/problems/validate-binary-search-tree): bounds passed down, the defining BST check.
3. [Kth Smallest Element in a BST](/problems/kth-smallest-element-in-a-bst): inorder with a stack, stopping early.
4. [Lowest Common Ancestor of a Binary Search Tree](/problems/lowest-common-ancestor-of-a-binary-search-tree): one walk down, splitting where the values diverge.
5. [Insert into a Binary Search Tree](/problems/insert-into-a-binary-search-tree): the search path, attaching at the null.
6. [Delete Node in a BST](/problems/delete-node-in-a-bst): the three cases and the inorder successor.
7. [Construct Binary Search Tree from Preorder Traversal](/problems/construct-binary-search-tree-from-preorder-traversal): building with bounds in linear time.
8. [Binary Search Tree Iterator](/problems/binary-search-tree-iterator): the inorder stack, paused between calls.
9. [Recover Binary Search Tree](/problems/recover-binary-search-tree): finding two swapped values from the drops in inorder.
