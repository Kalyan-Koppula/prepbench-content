**Key insight:** inorder yields values in ascending order, so the `k`-th value visited is the answer — and an iterative traversal can stop right there.

## Approach

1. Iterative inorder: push the left spine, pop a node, count it.
2. When the count reaches `k`, return that node's value.
3. Otherwise move to the popped node's right child and repeat.

## Complexity

- Time `O(h + k)` — you descend one spine, then visit `k` nodes.
- Space `O(h)` for the stack.

## Alternatives to mention

- Full inorder into an array, return `arr[k - 1]`: `O(n)` time and space. Simple but doesn't stop early.
- Recursive inorder with a counter in an outer variable and an early exit.

## Follow-ups

- **Frequent updates + queries:** augment each node with the size of its subtree. Then at each node compare `k` with `leftSize + 1` and go left, return, or go right with `k - leftSize - 1` — `O(h)` per query, and sizes are maintained on insert/delete. With a balanced tree that's `O(log n)`.
