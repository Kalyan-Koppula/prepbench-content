**Key idea:** find the node with the usual search walk, then remove it according to how many children it has. No children: just drop it. One child: let that child take its place. Two children: copy in the value of its inorder **successor** (the smallest value in its right subtree), then delete that successor, which has at most one child.

## Recognising the pattern

Deletion is the hardest of the basic operations in the [Binary Search Trees](/problems/patterns/bst) sheet. The search is ordinary; the work is keeping the ordering intact when a node with two children disappears. The successor is the one value that can sit in its place: larger than everything on the left, smaller than everything else on the right.

## Simpler variant (shown below as the alternative)

For the two-children case, attach the deleted node's whole left subtree under the smallest node of its right subtree, and let the right subtree take the node's place. That keeps the ordering (everything on the left is smaller than everything on the right), and it is valid here, since any correct BST is accepted. But it can make the tree much taller, so it isn't the textbook answer.

## Standard approach: successor replacement

Recursive `deleteNode(node, key)` returning the new subtree root:

1. If `node` is null, the key isn't there: return null.
2. If `key < node.val`, set `node.left = deleteNode(node.left, key)` and return `node`. Mirror for `key > node.val`.
3. Otherwise `node` is the one to delete:
   - No left child: return `node.right` (which may be null).
   - No right child: return `node.left`.
   - Two children: find `successor`, the leftmost node of `node.right`. Copy `successor.val` into `node`, then set `node.right = deleteNode(node.right, successor.val)`.

The successor has no left child (it is the leftmost node), so its own deletion is always one of the simple cases.

Using the **predecessor** (the largest value on the left) works equally well.

## Walkthrough

```
        5                     6
       / \                   / \
      3   6        →        3   7
     / \   \               / \
    2   4   7             2   4
```

Deleting `5`:

| step | detail |
| --- | --- |
| find | key 5 is the root |
| case | two children |
| successor | leftmost of the right subtree: 6 |
| copy | root value becomes 6 |
| delete successor | remove 6 from the right subtree: it has only a right child, 7, which takes its place |

## Complexity

- Time `O(h)`: one walk to the node, one walk to its successor, and one more walk to remove it, all within the same branch.
- Space `O(h)` for the recursion (`O(1)` with an iterative version).

## Edge cases

- Key not in the tree: the tree is returned unchanged.
- Deleting the root, including a root with one child.
- Deleting a leaf.
- A tree with one node: the result is empty.

## Common mistakes

- Forgetting to reassign the result (`node.left = deleteNode(...)`), so the deletion never reaches the parent.
- In the two-children case, deleting the successor from the wrong subtree.
- Swapping values with a node that isn't the successor, which breaks the ordering.

## In the interview

- List the three cases before coding, and explain why the successor is the right replacement.
- Likely follow-ups:
  - *Iterative version?* Track the parent while searching and relink it by hand; more code, `O(1)` space.
  - *Keep the tree balanced?* Balanced trees rebalance with rotations after delete; mention AVL or red-black trees.
  - *Delete a range of values (Trim a BST)?* Recurse with bounds and return the trimmed subtrees.
