**Key idea:** in preorder, a node's whole left subtree comes right after it, and its right subtree comes after the **last** node of the left subtree, which is the left subtree's rightmost node. So for each node with a left child: attach the current right subtree under that rightmost node, move the left subtree into the right slot, and clear `left`. Then step right and repeat.

## Recognising the pattern

Rearranging pointers in place to match a traversal order is a [Trees](/problems/patterns/trees) sheet technique closely related to Morris traversal: you use the tree's own empty `right` pointers to stitch things together instead of a stack. The `O(1)` follow-up is the hint.

## Brute force

Collect the nodes in preorder into an array, then relink them: each node's `left` becomes null and its `right` the next node in the array. That is the reference brute force below.

Correct and `O(n)` time, but `O(n)` extra space for the array (plus the recursion).

## Optimal: splice each left subtree into place

1. `current = root`.
2. While `current` is not null:
   1. If `current.left` exists:
      - Find `rightmost`, the rightmost node of the left subtree.
      - `rightmost.right = current.right`.
      - `current.right = current.left`, `current.left = null`.
   2. `current = current.right`.

After step 2.1, `current`'s right chain is: its old left subtree, followed by its old right subtree, exactly as preorder wants. Nodes further down are fixed when `current` reaches them.

**Why it is linear.** Finding `rightmost` walks down right pointers of the left subtree. Each such edge is walked once by this search, and once more later when `current` itself moves along the chain. So the total work is `O(n)`, even though the loop has an inner `while`.

A recursive alternative processes nodes in reverse preorder (right, left, node), keeping a `prev` pointer and setting `node.right = prev`, `node.left = null`. It is short, but uses `O(h)` stack.

## Walkthrough

```
      1
     / \
    2   5
   / \   \
  3   4   6
```

| current | left subtree's rightmost | splice | chain after |
| --- | --- | --- | --- |
| 1 | 4 | 4.right = 5; 1.right = 2 | 1 → 2 → 3, 4 → 5 → 6 (3 still on 2's left) |
| 2 | 3 | 3.right = 4; 2.right = 3 | 1 → 2 → 3 → 4 → 5 → 6 |
| 3, 4, 5, 6 | – | no left child | unchanged |

Result `1 → 2 → 3 → 4 → 5 → 6`, all `left` pointers null.

## Complexity

- Preorder array: time `O(n)`, space `O(n)`.
- Splicing: time `O(n)`, space `O(1)`.

## Edge cases

- Empty tree: nothing happens.
- No left children anywhere: the tree is already a chain.
- A left-leaning chain: each step moves one node's left child to the right.

## Common mistakes

- Attaching the right subtree to the left child instead of to the left subtree's rightmost node.
- Forgetting `current.left = null`, which leaves both pointers set.
- Building new nodes instead of relinking existing ones.

## In the interview

- Explain where the right subtree must go in preorder, which justifies the "rightmost" search.
- Likely follow-ups:
  - *Flatten to a doubly linked list in inorder?* The same in-place idea with inorder (Convert BST to Sorted Doubly Linked List).
  - *Morris inorder traversal?* The same "rightmost of the left subtree" threading, but temporary.
