---
title: Render a Virtual Node
difficulty: Medium
order: 6
tags: [dom, virtual-dom, events, recursion]
frequency: high
exports: [render]
dom: true
hints:
  - Strings and numbers become text nodes; objects become elements whose props and children you apply one by one.
  - Sort each prop into a bucket — `className`, `style`, event handlers (`on` + capital letter), booleans, everything else — before touching the element.
  - Flatten nested child arrays and skip `null`, `undefined`, `true` and `false` children, the way JSX does.
---

Frameworks describe UI as plain objects ("virtual nodes") and turn them into real DOM. Implement `render(vnode)`, which returns a real DOM node for a virtual one.

A virtual node is either:

- a **string or number**, which becomes a text node, or
- an object `{ type, props, children }`, which becomes the element `type` (`props` and `children` are both optional).

Props are applied like this:

| Prop | Effect |
|---|---|
| `className: 'a b'` | sets the `class` attribute |
| `style: { fontSize: '12px' }` | sets each property on `el.style` |
| `onClick: fn`, `onKeyDown: fn`, … | `on` + a capital letter: `addEventListener('click', fn)`, `'keydown'`, … |
| `true` | sets the attribute with an empty value (`disabled: true` → `disabled=""`) |
| `false`, `null`, `undefined` | ignored |
| anything else | `setAttribute(name, String(value))` |

```js
const button = render({
  type: 'button',
  props: { type: 'submit', className: 'btn primary', disabled: false, onClick: () => console.log('saved') },
  children: ['Save ', { type: 'span', props: { 'aria-hidden': true }, children: ['✓'] }],
})

button.outerHTML // '<button type="submit" class="btn primary">Save <span aria-hidden="">✓</span></button>'
button.click()   // logs "saved"
```

## Notes

- `children` may contain nested arrays (from `.map()`); flatten them.
- Children that are `null`, `undefined`, `true` or `false` render nothing. `0` renders as the text `"0"`.
- Event handlers must not show up as attributes.
- Text is text: `render('<b>hi</b>')` makes a text node, never markup.
