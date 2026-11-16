**Key insight:** inorder makes the BST a sorted array, and sorted two-sum is the two-pointer sweep.

## Approach

1. Inorder traverse into `vals` (ascending).
2. `i = 0`, `j = n - 1`. While `i < j`: if `vals[i] + vals[j]` equals `k`, return `true`; if it's too small, `i++`; too large, `j--`.
3. Return `false`.

`i < j` guarantees two different nodes.

## Complexity

- Time `O(n)`, space `O(n)` for the array.

## Alternatives to mention

- **Hash set during any traversal** (the classic Two Sum): `O(n)` time and space, ignores the BST property entirely — fine, but say so.
- **Two BST iterators** (follow-up): one stack yields values ascending (push left spines), another descending (push right spines). Move them like the two pointers. `O(n)` time, `O(h)` space. Stop when the two iterators meet.
- For each node, binary-search the tree for `k - val`: `O(n · h)`.

## Pitfalls

- Pairing a node with itself when `k = 2 * val` — the pointers must be different positions.
