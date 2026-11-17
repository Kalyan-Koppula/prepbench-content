---
title: Simple querySelectorAll
difficulty: Hard
order: 11
tags: [dom, css-selectors, parsing, traversal]
frequency: medium
exports: [querySelectorAllLite]
dom: true
hints:
  - "Parse first: split the selector on whitespace into compound parts, and parse each part into `{ tag, ids, classes }`."
  - Match right to left. An element is a candidate if it matches the last compound; then look for the remaining compounds among its ancestors.
  - With only the descendant combinator, taking the nearest ancestor that matches each compound is always safe, so you never need to backtrack.
---

Implement `querySelectorAllLite(root, selector)` — a small version of `root.querySelectorAll(selector)` — without using the browser's selector engine. It returns an **array** of the matching elements inside `root`, in document order.

Supported syntax:

| Selector | Matches |
|---|---|
| `div`, `*` | a tag name (case-insensitive), or any element |
| `.card` | elements with class `card` |
| `#main` | the element with id `main` |
| `li.item.active`, `#nav.open`, `.a#b` | **compound**: all of the parts at once, in any order (at most one tag, at the start) |
| `nav ul a` | **descendant combinator**: an `a` somewhere inside a `ul` somewhere inside a `nav` |

```js
document.body.innerHTML = `
  <nav id="top">
    <ul class="menu">
      <li class="item active"><a id="home">Home</a></li>
      <li class="item"><a id="about">About</a></li>
    </ul>
  </nav>`
const body = document.body

querySelectorAllLite(body, 'li.active a').map((a) => a.id) // ['home']
querySelectorAllLite(body, '#top .item').length            // 2
querySelectorAllLite(body, 'ul li')                        // both <li>s, in document order
```

## Notes

- Behave like the native method: `root` itself is never returned, and each element appears at most once.
- Like the native method, ancestors used by the descendant combinator may be **outside** `root`: `section.querySelectorAll('div p')` finds a `<p>` in `section` even if the only `<div>` is above `section`.
- Class names and ids are case-sensitive; tag names are not. Extra whitespace around or between parts is allowed.
- Don't call `querySelector`, `querySelectorAll`, `matches`, `closest` or the `getElementsBy…` methods; the tests check.
- You don't need attribute selectors, pseudo-classes, `,`, `>`, `+` or `~`.
