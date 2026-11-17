---
title: DOM Tree Depth
difficulty: Easy
order: 4
tags: [dom, recursion, trees]
frequency: medium
exports: [getTreeDepth]
dom: true
hints:
  - The depth of an element is 1 plus the largest depth among its element children.
  - Only `children` count; text and comment nodes don't add a level.
  - For an iterative version, do a breadth-first walk and count how many levels you process.
---

Implement `getTreeDepth(root)`, which returns the height of the element tree rooted at `root`: the number of elements on the longest path from `root` down to a leaf element, counting `root` itself.

```js
document.body.innerHTML = `
  <div id="app">
    <header><h1>Title</h1></header>
    <main>
      <ul><li><a>link</a></li></ul>
    </main>
  </div>`

getTreeDepth(document.getElementById('app')) // 5 (div > main > ul > li > a)
getTreeDepth(document.querySelector('h1'))   // 1
getTreeDepth(null)                           // 0
```

## Notes

- Only elements count. Text and comment nodes never add a level.
- A missing root (`null` or `undefined`) has depth `0`.
- Trees can be thousands of levels deep or thousands of children wide.
