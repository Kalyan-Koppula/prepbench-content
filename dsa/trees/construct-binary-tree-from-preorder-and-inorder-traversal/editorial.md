**Key idea:** preorder lists a subtree's root first, and inorder lists everything left of the root before it and everything right of it after it. So take the next preorder value as the root, find it in inorder to split the remaining values into left and right subtrees, and build each side recursively. A map from value to inorder index makes each split `O(1)`.

## Recognising the pattern

Reconstructing a tree from traversals is a divide-and-conquer recursion from the [Trees](/problems/patterns/trees) sheet. Each traversal gives a different piece of information: preorder says **who the root is**, inorder says **how big each side is**. You need both, and distinct values, for the tree to be unique.

## Brute force

Recurse on sub-arrays: the root is `preorder[0]`; find it in `inorder` by scanning; the left subtree uses the next `leftSize` preorder values and the inorder values before the root; the right subtree uses the rest. The reference brute force below does this with start indices and sizes rather than copying arrays.

Correct, but the linear search for each root costs `O(n)`, so a chain-shaped tree takes `O(n²)`. (Slicing arrays at every level adds the same cost again in memory.)

## Optimal: index map and a moving preorder pointer

1. Build `inorderIndex`: value → position in `inorder`.
2. Keep a pointer `nextPre` into preorder, starting at 0.
3. `build(lo, hi)` builds the subtree whose values are exactly `inorder[lo..hi]`:
   1. If `lo > hi`, return null.
   2. Take `rootVal = preorder[nextPre]` and advance `nextPre`.
   3. `mid = inorderIndex[rootVal]`.
   4. `left = build(lo, mid − 1)`, then `right = build(mid + 1, hi)`.
4. Return `build(0, n − 1)`.

**Why build the left side first?** Preorder lists the entire left subtree before the right subtree. Building left first consumes exactly the left subtree's values from the shared pointer, so when the right side starts, the pointer is on the right subtree's root.

## Walkthrough

`preorder = [3, 9, 20, 15, 7]`, `inorder = [9, 3, 15, 20, 7]`

| call (inorder range) | root (from preorder) | split at | left range | right range |
| --- | --- | --- | --- | --- |
| [0..4] | 3 | 1 | [0..0] | [2..4] |
| [0..0] | 9 | 0 | empty | empty |
| [2..4] | 20 | 3 | [2..2] | [4..4] |
| [2..2] | 15 | 2 | empty | empty |
| [4..4] | 7 | 4 | empty | empty |

Result: `3` with left child `9` and right child `20`, whose children are `15` and `7`.

## Complexity

- Linear search per root: time `O(n²)` worst case, space `O(h)`.
- Index map: time `O(n)`, each value handled once with `O(1)` lookups. Space `O(n)` for the map plus `O(h)` recursion.

## Edge cases

- One node: both ranges are empty.
- A left-leaning chain: every split leaves an empty right side, and recursion is `n` deep.
- Duplicate values: not allowed here; with duplicates the tree is ambiguous.

## Common mistakes

- Building the right subtree before the left, which takes the wrong values from preorder.
- Slicing arrays at every call, which costs `O(n²)` time and memory.
- Off-by-one in the split: the root itself belongs to neither range.

## In the interview

- Explain what each traversal contributes, then the pointer-plus-map version.
- Likely follow-ups:
  - *Inorder and postorder?* Take roots from the **end** of postorder and build the right subtree first.
  - *Preorder and postorder?* Not unique in general; it works for full binary trees.
  - *Serialise and deserialise a tree?* Use one traversal with null markers instead (Serialize and Deserialize Binary Tree).
