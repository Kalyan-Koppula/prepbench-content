**Key insight:** let each call return "the target (or LCA) found in this subtree, or nothing". The first node where *both* sides return something is the LCA.

## Approach

1. `find(node)`: if `node` is null, return `null`. If `node.val` is `p` or `q`, return `node` — no need to look below it: if the other target is underneath, this node is the LCA anyway.
2. Recurse: `left = find(node.left)`, `right = find(node.right)`.
3. If both are non-null, the targets are split across this node → return `node`.
4. Otherwise return whichever side is non-null (it carries a target, or an LCA found deeper).

The answer is `find(root).val`.

## Complexity

- Time `O(n)` — each node visited at most once.
- Space `O(h)` recursion stack.

## Alternatives to mention

- **Root-to-node paths**: record the path to `p` and to `q`, then walk both from the root until they diverge. Same `O(n)` time, `O(h)` extra space, two passes — easier to explain, also handles "target might be missing" naturally.
- **Parent map**: BFS to record parents, put all ancestors of `p` into a set, then walk up from `q` until you hit one.

## Pitfalls / follow-ups

- The early return assumes both targets exist. If one may be missing, you must finish the search (or count found targets) before trusting the result.
- In a BST, use the ordering instead: walk down from the root and split where `p` and `q` fall on different sides — `O(h)`.
- The original problem passes node references; here we use values since they're unique — say this assumption out loud.
