**Key insight:** don't try to do it in one clever walk — collect the left edge, the leaves and the right edge separately, keeping leaves out of both edges so nothing is counted twice.

## Approach

1. Start the output with `root.val`.
2. **Left edge:** `cur = root.left`; while `cur` is not a leaf, append it and move to `cur.left ?? cur.right`.
3. **Leaves:** a DFS (left before right) appending every leaf. Skip the root itself, so a single node isn't output twice.
4. **Right edge:** `cur = root.right`; while `cur` is not a leaf, push it onto a temporary list and move to `cur.right ?? cur.left`. Append that list reversed.

## Complexity

- Time `O(n)` — the leaf pass touches every node; the edges are at most `O(h)` each.
- Space `O(n)` worst case for output and recursion.

## Alternatives to mention

- A single pre-order DFS with two flags, `onLeftEdge` and `onRightEdge`: a left-edge node is emitted before its children, a right-edge node after them (which gives the bottom-up order for free). A child inherits the left flag if it's the left child, or the right child when no left child exists; mirror for the right flag.

## Pitfalls

- **Root with one side missing**: if there's no left child, the left edge is empty — don't walk down the right subtree as the "left edge".
- **Double counting**: the leftmost and rightmost leaves belong to the leaf pass only.
- **Single node**: the root is not also a leaf; output `[root.val]`, not `[root.val, root.val]`.
- Interviewers' definitions vary slightly (some treat the root as part of the left edge, or only take left children). Confirm the rules before coding.
