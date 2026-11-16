**Key insight:** a mirrored tree is a node whose children are swapped *and* whose subtrees are themselves mirrored — one recursive swap per node.

## Approach

1. Empty node: return `null`.
2. Recursively invert the left and right subtrees.
3. Attach the inverted right subtree on the left and the inverted left subtree on the right; return the node.

Save one child in a local variable before overwriting the pointer, or you invert the same subtree twice.

## Complexity

- Time `O(n)` — every node is visited once.
- Space `O(h)` recursion stack: `O(log n)` balanced, `O(n)` for a skewed tree.

## Alternatives to mention

- BFS with a queue: pop a node, swap its children, push the non-null ones. Same `O(n)` time, `O(w)` space for the widest level, and no recursion-depth risk.
- Pre-order or post-order both work; in-order needs care because after swapping you would descend into the same (now left) subtree twice.
