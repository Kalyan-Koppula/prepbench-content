---
title: getElementsByClassName
difficulty: Medium
order: 1
tags: [dom, traversal, recursion]
frequency: high
exports: [getElementsByClassName]
dom: true
hints:
  - Split the class list on whitespace first and drop empty pieces; an element matches only if it has every one of them.
  - Visit `children` (elements only) depth-first, checking each child before descending into it, so results come out in document order.
  - '`classList.contains` compares whole tokens; a substring check on `className` would match `btn` inside `btn-primary`.'
---

Implement `getElementsByClassName(root, classNames)` without using the built-in lookup methods. It returns an **array** of every element *under* `root` that has all of the classes listed in `classNames`.

`classNames` is a whitespace-separated list, just like the argument to the native `element.getElementsByClassName`. The order of classes in the list doesn't matter, and an element may have extra classes.

```js
document.body.innerHTML = `
  <nav id="nav" class="menu">
    <a id="home" class="link active">Home</a>
    <div class="group">
      <a id="docs" class="active link external">Docs</a>
      <a id="blog" class="link">Blog</a>
    </div>
  </nav>`
const nav = document.getElementById('nav')

getElementsByClassName(nav, 'link active').map((el) => el.id) // ['home', 'docs']
getElementsByClassName(nav, 'menu') // [] — the root itself is never included
```

## Notes

- Results are in document order (a parent comes before its descendants, earlier siblings before later ones).
- Class names are case-sensitive and must match whole tokens: `btn` does not match `btn-primary`.
- `classNames` may contain extra spaces, tabs or newlines. If it holds no class names at all, return `[]`.
- Don't call `getElementsByClassName`, `querySelector` or `querySelectorAll`; the tests check.
