**Key insight:** depth is defined recursively, `1 + max(depth of each child element)`, but you can also count levels with a breadth-first walk, which avoids recursion entirely.

## Approach

**Recursive:** return `0` for a missing node; otherwise `1 + Math.max(0, ...children.map(getTreeDepth))`. Short and what most interviewers want first.

**Iterative (reference):** keep the current level as an array, starting with `[root]`. While it's non-empty, increment `depth` and build the next level from every element's `children`. When a level comes back empty, `depth` is the answer.

## Walkthrough

```html
<div id="root">
  <p><span>a</span></p>
  <ul><li><b>b</b></li></ul>
</div>
```

| Level | Elements | Depth after |
| --- | --- | --- |
| 1 | div | 1 |
| 2 | p, ul | 2 |
| 3 | span, li | 3 |
| 4 | b | 4 |
| 5 | (none) | stop |

Answer 4. Level-order traversal counts one per level; text nodes aren't counted because `children` only contains elements.

## Complexity

`O(n)` for `n` elements; `O(w)` extra space for the widest level.

## Edge cases to test

- `null` root returns 0; a single element returns 1.
- Uneven branches (the deepest one decides).
- Text nodes ignored.
- Very deep trees (iterative BFS avoids recursion limits).

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

## In the interview

Offer both versions: recursive (`1 + max(depth(child))`) and BFS by levels. Mention that it's the same problem as [Maximum Depth of Binary Tree](/problems/maximum-depth-of-binary-tree) with any number of children.
