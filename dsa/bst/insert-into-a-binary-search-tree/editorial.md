**Key idea:** search for the value as if it were in the tree. The search falls off the tree at exactly the place the value belongs; attach a new leaf there. Nothing else moves.

## Recognising the pattern

Insertion is the search path from the [Binary Search Trees](/problems/patterns/bst) sheet with one extra step at the end. It costs one comparison per level, `O(h)`.

## Approach 1: iterative (reference solution)

1. Create the new node. If the tree is empty, return it as the root.
2. `current = root`. Repeat:
   1. If `val < current.val`: if `current.left` is null, attach the node there and return `root`; otherwise go left.
   2. Otherwise: if `current.right` is null, attach the node there and return `root`; otherwise go right.

Checking the child before moving keeps a reference to the parent, which is where the new node must be attached.

## Approach 2: recursive (shown below as the alternative)

`insert(node, val)`: if `node` is null, return a new node. Otherwise insert into the correct subtree and assign the result back (`node.left = insert(node.left, val)`), then return `node`. Elegant, because the "attach to the parent" step happens through the return value, but it uses `O(h)` stack.

## Walkthrough

```
      4                4
     / \              / \
    2   7    →       2   7
   / \              / \  /
  1   3            1  3 5
```

Inserting `5`:

| node | comparison | action |
| --- | --- | --- |
| 4 | 5 > 4 | go right |
| 7 | 5 < 7 | left child is null → attach 5 |

## Complexity

- Iterative: time `O(h)`, space `O(1)`.
- Recursive: time `O(h)`, space `O(h)`.

`h` is `O(log n)` for a balanced tree and `O(n)` for a chain.

## Edge cases

- Empty tree: the new node is the root.
- The value smaller than everything: it becomes the left child of the leftmost node.
- Inserting sorted values one by one builds a chain. Worth mentioning when discussing complexity.

## Common mistakes

- Walking to `null` without remembering the parent, so the node can't be attached.
- Returning the new node instead of the original root.
- Forgetting to assign the recursive result back to `left` or `right`.

## In the interview

- One sentence: "search for it and attach where the search ends."
- Mention that repeated inserts can unbalance the tree, and that balanced trees fix this with rotations.
- Likely follow-ups:
  - *Delete a value?* Three cases: leaf, one child, two children with the inorder successor (Delete Node in a BST).
  - *Duplicates allowed?* Decide a side (often right) or keep a count per node.
