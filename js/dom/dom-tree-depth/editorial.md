**Key insight:** depth is defined recursively, `1 + max(depth of each child element)`, but you can also count levels with a breadth-first walk, which avoids recursion entirely.

## Approach

**Recursive:** return `0` for a missing node; otherwise `1 + Math.max(0, ...children.map(getTreeDepth))`. Short and what most interviewers want first.

**Iterative (reference):** keep the current level as an array, starting with `[root]`. While it's non-empty, increment `depth` and build the next level from every element's `children`. When a level comes back empty, `depth` is the answer.

## Pitfalls

- Recursing over `childNodes` counts text nodes as a level, so `<p>text</p>` comes out as 2.
- `Math.max(...[])` is `-Infinity`; add `0` to the arguments (or handle leaves explicitly).
- Counting edges instead of nodes is off by one. Ask which definition the interviewer wants.
- Spreading a huge child list into `Math.max(...)` can hit argument limits on very wide trees; a loop is safer.

## Follow-ups interviewers add

- **Iterative without levels:** a DFS stack of `[node, depth]` pairs, tracking the maximum.
- **Return the deepest element** (or the path to it) instead of the number.
- **Count nodes per level** to report the widest level.
- **Live DOM:** why might the depth of `document.body` be useful for performance audits? (Deep trees slow style recalculation and layout.)
