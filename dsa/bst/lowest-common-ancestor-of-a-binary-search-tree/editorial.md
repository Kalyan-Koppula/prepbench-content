**Key insight:** the LCA is the split point — the first node on the way down where `p` and `q` stop being on the same side.

## Approach

1. Start at the root.
2. If both `p` and `q` are less than `cur.val`, both live in the left subtree → go left.
3. If both are greater, go right.
4. Otherwise they split here (or `cur` is one of them) → `cur.val` is the answer.

## Complexity

- Time `O(h)` — one root-to-node walk; `O(log n)` balanced, `O(n)` skewed.
- Space `O(1)` iteratively (`O(h)` if written recursively).

## Alternatives to mention

- The general binary-tree LCA (recurse into both subtrees, return the node where both sides report a hit) also works, but costs `O(n)` and ignores the ordering — mention it to show you know why the BST version is better.

## Pitfalls

- Using `<=` / `>=` in the "go left/right" checks makes you walk past a node that equals `p` or `q`.
- The original problem passes node references; here they're values, which works because values are unique.
