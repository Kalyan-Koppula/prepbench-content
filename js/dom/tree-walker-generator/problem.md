---
title: Tree Walker Generator
difficulty: Medium
order: 12
tags: [dom, generators, traversal, bfs, dfs]
frequency: low
exports: [walk]
dom: true
hints:
  - Keep a container of nodes still to visit. Taking from the end (a stack) gives depth-first order; taking from the front (a queue) gives breadth-first order.
  - For depth-first with a stack, push children in reverse so the first child comes out first.
  - Call `filter` only when you take a node out, and add its children only if the answer isn't `'reject'`.
---

The DOM's `TreeWalker` lets you visit nodes one at a time and decide which ones you care about. Build a lighter version as a generator.

Implement `walk(root, options)`, a **generator function** that yields the nodes of the tree rooted at `root` (including `root` itself), visiting **every** node type: elements, text and comments.

`options` is optional:

- `order`: `'depth'` (default) for depth-first pre-order, or `'breadth'` for level by level.
- `filter(node)`: decides what happens to each node, like `NodeFilter`:
  - `'accept'`: yield the node and visit its children;
  - `'skip'`: don't yield the node, but still visit its children;
  - `'reject'`: don't yield the node and don't visit anything below it.

  Without a filter, every node is accepted.

```js
document.body.innerHTML = '<ul id="list"><li>One</li><li class="secret">Two</li><li>Three</li></ul>'
const list = document.getElementById('list')

const texts = [...walk(list, {
  filter: (node) => {
    if (node.nodeType === 1 && node.classList.contains('secret')) return 'reject'
    return node.nodeType === 3 ? 'accept' : 'skip'
  },
})].map((n) => n.textContent)
// ['One', 'Three']
```

## Notes

- The walk is **lazy**: `filter` is called for a node only when the walk reaches it, so a caller that stops after the first result does almost no work.
- Children are visited in `childNodes` order.
- Calling `walk` twice gives two independent walks.
