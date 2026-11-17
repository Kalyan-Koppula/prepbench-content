**Key insight:** a node's position is the list of child indexes from the root down to it. Record that path in tree A, then follow it in tree B.

## Approach

1. Start at `target` and climb with `parentNode` until you reach `rootA`. At each step push the node's index in `parent.childNodes`.
2. If `parentNode` becomes `null` before you meet `rootA`, the target isn't in tree A: return `null`.
3. Walk down from `rootB`, applying the recorded indexes from last to first (the last one recorded is the outermost step).

An alternative is a simultaneous walk: traverse both trees in lockstep (DFS or BFS with two stacks) until the A-side node is `target`, then return the B-side node. It's O(n) instead of O(depth × siblings), but the path approach is what most interviewers expect first.

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
