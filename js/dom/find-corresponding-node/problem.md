---
title: Find the Corresponding Node
difficulty: Easy
order: 3
tags: [dom, traversal, trees]
frequency: high
exports: [findCorrespondingNode]
dom: true
hints:
  - Walk up from `target` to `rootA`, recording the index of each node among its parent's `childNodes`.
  - Then replay those indexes from `rootB` downward, in reverse order.
  - If you reach the top of the document without meeting `rootA`, the target isn't in tree A.
---

You have two DOM trees with the same **shape**: every node in tree A has a counterpart at the same position in tree B. Ids, classes and text may differ, so you can't look nodes up by their content.

Implement `findCorrespondingNode(rootA, rootB, target)`. Given a node `target` somewhere inside `rootA`, return the node at the same position inside `rootB`.

```js
document.body.innerHTML = `
  <div id="left"><ul><li>One</li><li>Two <b>!</b></li></ul></div>
  <div id="right"><ul><li>Uno</li><li>Dos <b>?</b></li></ul></div>`
const left = document.getElementById('left')
const right = document.getElementById('right')

const bang = left.querySelector('b')
findCorrespondingNode(left, right, bang).textContent // '?'
```

## Notes

- `target` can be any node, including a text node. Positions count every child node (text and comments too), not just elements.
- If `target` is `rootA`, return `rootB`.
- If `target` is not inside `rootA`, return `null`.
- The two trees may sit at different depths in the document.
