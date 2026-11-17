---
title: Diff and Patch
difficulty: Hard
order: 7
tags: [dom, virtual-dom, diffing, recursion]
frequency: medium
exports: [patch]
dom: true
hints:
  - "Handle the four cases at each position in order: nothing before (append), nothing after (remove), a different node (replace), the same kind of node (update in place)."
  - For an element that stays, diff the props first (removed, then added or changed), then recurse into the children by index.
  - When the new list is shorter, remove the extra old children from the end backwards; removing forwards shifts the indexes under you.
---

Re-rendering a whole tree on every change throws away DOM nodes (and their focus, scroll position and listeners). Instead, a virtual DOM compares the previous virtual tree with the next one and changes only what's different.

Implement `patch(parent, oldVNode, newVNode, index = 0)`. The real node `parent.childNodes[index]` was rendered from `oldVNode`. Update the DOM so it matches `newVNode`, reusing existing nodes wherever you can.

Virtual nodes have the same shape as in *Render a Virtual Node*: a string is a text node, and `{ type, props, children }` is an element. The starter includes a working `createNode(vnode)` you can use for nodes that need to be created.

```js
const before = { type: 'ul', props: { className: 'list' }, children: [
  { type: 'li', children: ['Milk'] },
  { type: 'li', children: ['Eggs'] },
] }
const after = { type: 'ul', props: { className: 'list done' }, children: [
  { type: 'li', children: ['Oat milk'] },
] }

const app = document.createElement('div')
app.appendChild(createNode(before))
const ul = app.firstChild

patch(app, before, after)
app.innerHTML        // '<ul class="list done"><li>Oat milk</li></ul>'
app.firstChild === ul // true: the <ul> was updated, not replaced
```

## Rules

- **Added** (`oldVNode` is `undefined`): append a new node to `parent`.
- **Removed** (`newVNode` is `undefined`): remove `parent.childNodes[index]`.
- **Changed** (text vs element, a different `type`, or different text): replace the old node with a new one.
- **Same type**: keep the element. Remove props that are gone, set props that are new or changed, then patch the children position by position.

## Notes

- Props follow `createNode`: `className` is the `class` attribute, `onClick`-style props are event listeners, everything else is an attribute. When an event handler changes, the old one must stop firing.
- Children are matched by index only (no `key`s), and child lists contain only strings and vnodes.
- An element whose props and children didn't change must be left alone: same node, no attribute writes needed.
