**Key insight:** a node's position is the list of child indexes from the root down to it. Record that path in tree A, then follow it in tree B.

## Approach

1. Start at `target` and climb with `parentNode` until you reach `rootA`. At each step push the node's index in `parent.childNodes`.
2. If `parentNode` becomes `null` before you meet `rootA`, the target isn't in tree A: return `null`.
3. Walk down from `rootB`, applying the recorded indexes from last to first (the last one recorded is the outermost step).

An alternative is a simultaneous walk: traverse both trees in lockstep (DFS or BFS with two stacks) until the A-side node is `target`, then return the B-side node. It's O(n) instead of O(depth × siblings), but the path approach is what most interviewers expect first.

## Walkthrough

Two structurally identical trees A and B; `target` is the second child of A's first child.

| Phase | Steps | Result |
| --- | --- | --- |
| Walk up from `target` to `rootA` | index of target in its parent: 1; index of that parent in rootA: 0 | path `[1, 0]` (bottom-up) |
| Walk down from `rootB` | take child 0, then child 1 | the corresponding node in B |

Recording **indices** instead of comparing content works because the trees have the same structure. Using `childNodes` (not `children`) keeps text nodes in the count, so the indices line up exactly.

## Complexity

`O(d × w)`: depth `d`, and `indexOf` over up to `w` siblings per level.

## Edge cases to test

- The target is the root itself (empty path → `rootB`).
- Deep targets and text-node targets.
- A target not inside `rootA` returns `null`.

## Pitfalls

- Using `children` instead of `childNodes` breaks for text-node targets and gives wrong indexes when text sits between elements.
- Climbing until `parentNode` is `null` without checking for `rootA` returns a document-relative path, which only works if both trees are at the same depth.
- Replaying the path in the order it was recorded (innermost first) walks the wrong branch.
- `childNodes` is a `NodeList`, not an array; use `Array.prototype.indexOf.call` or `Array.from`.

## Follow-ups interviewers add

- **Lockstep traversal:** solve it without building a path, walking both trees at once.
- **Many lookups:** if you'll map thousands of nodes, precompute a `Map` from each A node to its B node in one traversal.
- **Trees that differ:** what should happen when tree B is missing the branch? (Return `null` once an index is out of range.)
- **Shadow DOM / iframes:** how does the path change when nodes live in a shadow root?

## In the interview

Mention the alternative of walking both trees in parallel (DFS on A and B together until A's node is the target), which needs no path array, and why the index path is cleaner.
