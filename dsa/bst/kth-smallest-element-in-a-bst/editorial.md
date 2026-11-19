**Key idea:** inorder traversal visits a BST's values in ascending order, so the `k`-th value it produces is the answer. Do it iteratively with a stack and stop as soon as the `k`-th node is popped.

## Recognising the pattern

Any rank question on a BST ("kth smallest", "median", "successor") maps to inorder order, the core idea of the [Binary Search Trees](/problems/patterns/bst) sheet. The iterative traversal matters because it can stop early.

## Brute force

Collect all values in any order, sort them, and return the `k`-th. That is the reference brute force below. Time `O(n log n)`, space `O(n)`. It ignores that the tree is already ordered.

## Better: full inorder into an array

Inorder into an array (already sorted), then return `values[k − 1]`. Time `O(n)`, space `O(n)`.

## Optimal: iterative inorder with early exit

1. Empty stack, `current = root`, `seen = 0`.
2. While `current` is not null or the stack isn't empty:
   1. Push `current` and go left until `current` is null.
   2. Pop a node and increment `seen`. If `seen == k`, return its value.
   3. Move to the popped node's right child.

Before returning, the loop has popped exactly `k` nodes and pushed at most the nodes on the path to them, so the work is `O(h + k)` rather than `O(n)`.

## Walkthrough

```
        5
       / \
      3   6
     / \
    2   4
   /
  1
```

`k = 3`:

| step | action | stack | seen |
| --- | --- | --- | --- |
| 1 | push 5, 3, 2, 1 | [5, 3, 2, 1] | 0 |
| 2 | pop 1 (no right child) | [5, 3, 2] | 1 |
| 3 | pop 2 | [5, 3] | 2 |
| 4 | pop 3 → k-th | [5] | 3 → return 3 |

## Complexity

- Sort: time `O(n log n)`, space `O(n)`.
- Full inorder: time `O(n)`, space `O(n)`.
- Early-exit inorder: time `O(h + k)`, space `O(h)` for the stack.

## Edge cases

- `k = 1`: the leftmost node.
- `k = n`: the rightmost node, after a full traversal.
- A right-leaning chain: the stack never holds more than one node.

## Common mistakes

- A preorder or level-order traversal, which isn't sorted.
- Off-by-one: `k` is 1-based.
- A recursive inorder that keeps visiting after the answer is found.

## In the interview

- State "inorder is sorted", then write the stack version and point out the early exit.
- Likely follow-ups:
  - *The tree changes often and kth queries are frequent?* Store each node's subtree size. At a node with left size `L`: if `k ≤ L` go left, if `k = L + 1` it is this node, else go right with `k − L − 1`. `O(h)` per query.
  - *kth largest?* Reverse inorder (right, node, left).
