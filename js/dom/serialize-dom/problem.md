---
title: Serialize a DOM Tree
difficulty: Easy
order: 5
tags: [dom, recursion, serialization]
frequency: medium
exports: [serialize]
dom: true
hints:
  - Branch on `nodeType`. Elements (1) become objects, text nodes (3) become strings, everything else is dropped.
  - Read attributes from `element.attributes`, which lists every attribute as a `{ name, value }` pair.
  - Serialize children recursively, then filter out the ones that came back empty.
---

Implement `serialize(node)`, which turns a DOM node into a plain, JSON-safe object so it can be stored or sent over the network.

- An **element** becomes `{ tag, attributes, children }`: `tag` is the lower-case tag name, `attributes` maps every attribute name to its string value, and `children` is the array of serialized child nodes.
- A **text node** becomes its text, as a string.

```js
document.body.innerHTML = `<form id="signup" class="card">
  <label for="email">Email <b>*</b></label>
  <input id="email" type="email" required>
  <!-- TODO: password -->
</form>`

serialize(document.getElementById('signup'))
// {
//   tag: 'form',
//   attributes: { id: 'signup', class: 'card' },
//   children: [
//     { tag: 'label', attributes: { for: 'email' }, children: ['Email ', { tag: 'b', attributes: {}, children: ['*'] }] },
//     { tag: 'input', attributes: { id: 'email', type: 'email', required: '' }, children: [] },
//   ],
// }
```

## Notes

- Always include `attributes` (possibly `{}`) and `children` (possibly `[]`) on elements.
- Drop comment nodes, and drop text nodes that contain only whitespace. Keep every other text node exactly as it is, without trimming.
- `serialize` called on a text node directly returns its text; called on a comment, `null`, or `undefined`, it returns `null`.
- The result must survive `JSON.parse(JSON.stringify(result))` unchanged: no DOM nodes, functions or `undefined` inside.
