---
title: getElementsByTagName
difficulty: Easy
order: 2
tags: [dom, traversal]
frequency: medium
exports: [getElementsByTagName]
dom: true
hints:
  - Normalise the tag name once; `element.tagName` is upper-case for HTML elements, so compare lower-cased strings.
  - Walk the subtree depth-first over `children`, testing a child before recursing into it.
  - Treat `*` as a predicate that accepts every element.
---

Implement `getElementsByTagName(root, tagName)` without the built-in lookups. It returns an **array** of all elements *inside* `root` whose tag name matches `tagName`, in document order.

```js
document.body.innerHTML = `
  <article id="post">
    <h2 id="title">Release notes</h2>
    <ul>
      <li id="a">Faster builds</li>
      <li id="b">New <em id="e">dark</em> theme</li>
    </ul>
  </article>`
const post = document.getElementById('post')

getElementsByTagName(post, 'li').map((el) => el.id) // ['a', 'b']
getElementsByTagName(post, 'LI').map((el) => el.id) // ['a', 'b']
getElementsByTagName(post, '*').length              // 5
```

## Notes

- Matching ignores case (`'LI'`, `'li'` and `'Li'` are the same). Custom element names such as `user-card` work like any other tag.
- `'*'` matches every element.
- `root` itself is never part of the result, even if it matches.
- Text and comment nodes are not elements and are never returned.
- Don't call `getElementsByTagName`, `querySelector` or `querySelectorAll`; the tests check.
