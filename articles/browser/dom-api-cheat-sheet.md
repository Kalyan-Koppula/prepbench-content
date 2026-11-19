---
title: DOM API Cheat Sheet
order: 6
summary: The DOM methods you need without a framework — querying, building and inserting nodes, attributes vs properties, geometry, scrolling, delegation and batching.
---

Vanilla JS rounds ("build a todo list without React", "implement `getElementsByClassName`") expose whether you know the platform under your framework. The API surface is large, but interviews use a small, predictable subset. Know these by heart so you never pause on a method name.

## Querying and traversal

| Need | API | Notes |
|---|---|---|
| First match | `el.querySelector(css)` | Searches descendants; `null` if none |
| All matches | `el.querySelectorAll(css)` | Static `NodeList`; has `forEach`, not `map` |
| By id | `document.getElementById(id)` | Only on `document` |
| Live collections | `getElementsByClassName`, `getElementsByTagName`, `children` | `HTMLCollection` updates as the DOM changes |
| Nearest ancestor match | `el.closest(css)` | Includes `el` itself; key for delegation |
| Test a node | `el.matches(css)` | Boolean |
| Parent | `el.parentElement` / `parentNode` | `parentNode` can be a document or fragment |
| Element siblings | `nextElementSibling`, `previousElementSibling` | Skip text nodes |
| Element children | `children`, `firstElementChild`, `lastElementChild` | `childNodes` includes text and comments |
| Contains | `a.contains(b)` | True if `b` is `a` or a descendant |

```js
const items = [...document.querySelectorAll('.item')] // spread to get map/filter
const row = event.target.closest('tr[data-id]')
```

Iterating a live `HTMLCollection` while removing nodes skips elements; convert to an array first.

### Implementing `getElementsByClassName`

```js
function byClassName(root, className) {
  const out = []
  const walk = (node) => {
    for (const child of node.children) {
      if (child.classList.contains(className)) out.push(child)
      walk(child)
    }
  }
  walk(root)
  return out
}
```

Follow-ups: multiple class names (check every one), an iterative version with a stack, and `document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT)` as the built-in traversal tool.

## Creating and inserting nodes

```js
const li = document.createElement('li')
li.textContent = user.name          // safe: never parsed as HTML
li.className = 'user'
li.dataset.id = user.id

list.append(li)                     // end; accepts nodes and strings, many args
list.prepend(header)                // start
ref.before(node); ref.after(node)   // siblings
ref.replaceWith(newNode)
li.remove()
list.replaceChildren(...newItems)   // clear and refill in one call
el.insertAdjacentHTML('beforeend', trustedHtml) // parses; never with user input
```

Older equivalents you may see: `appendChild` (one node, returns it), `insertBefore(node, ref)`, `removeChild`. Moving an existing node by inserting it elsewhere removes it from its old position; nodes can't be in two places. `node.cloneNode(true)` copies a subtree but not listeners added with `addEventListener`.

`innerHTML` with any user-controlled string is an XSS hole. Use `textContent` for text; build structure with `createElement`, or use a `<template>` element and clone its `content`.

## DocumentFragment

```js
const frag = document.createDocumentFragment()
for (const item of items) {
  const li = document.createElement('li')
  li.textContent = item.label
  frag.append(li)
}
list.append(frag) // fragment's children move in; the fragment ends up empty
```

A fragment is an off-document container, so building into it triggers no layout. Modern engines batch DOM writes anyway, so the main win is a single insertion point and avoiding interleaved reads. `append(...nodes)` with an array achieves the same thing.

## Attributes vs properties

Attributes are the strings in the HTML; properties are the live JS object fields. They're often reflected, but not always.

| Case | Attribute | Property |
|---|---|---|
| `<input value="a">` after the user types "b" | `getAttribute('value')` → `"a"` (the default) | `input.value` → `"b"` (current) |
| `<input checked>` | presence means default checked | `input.checked` is the live boolean |
| `<a href="/x">` | `"/x"` | `a.href` → absolute URL |
| `class` | `class` | `className`, `classList` |
| `for` | `for` | `htmlFor` |
| Custom `data-user-id` | `data-user-id` | `dataset.userId` |
| Unknown `foo="1"` | yes | no property created |

Boolean attributes are present or absent: `setAttribute('disabled', 'false')` still disables. Use `el.disabled = false` or `removeAttribute('disabled')`; `toggleAttribute('hidden', cond)` is handy.

## classList and dataset

```js
el.classList.add('open', 'active')
el.classList.remove('active')
el.classList.toggle('open', isOpen) // second arg forces the state
el.classList.replace('old', 'new')
el.classList.contains('open')

el.dataset.state = 'loading'        // writes data-state="loading"
delete el.dataset.state             // removes the attribute
```

`dataset` keys are camelCased from the dashed attribute name, and values are always strings.

## Geometry

```js
const r = el.getBoundingClientRect() // { x, y, top, left, right, bottom, width, height }
// viewport-relative, includes transforms, fractional pixels

const pageTop = r.top + window.scrollY // document-relative
const inView = r.top < innerHeight && r.bottom > 0
```

| Property | Measures |
|---|---|
| `offsetWidth/Height` | Border box, ignoring transforms, integers |
| `clientWidth/Height` | Padding box without scrollbar |
| `scrollWidth/Height` | Full content size including overflow |
| `scrollTop/Left` | Current scroll offset of an element |
| `offsetTop` / `offsetParent` | Position relative to the nearest positioned ancestor |

All of these force a synchronous layout if styles are dirty.

## Scrolling

```js
window.scrollTo({ top: 0, behavior: 'smooth' })
el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
container.scrollBy({ top: 200 })
const atBottom = c.scrollTop + c.clientHeight >= c.scrollHeight - 1
```

`scroll` listeners should be `{ passive: true }`. For "is it visible?" or "load more at the bottom", use `IntersectionObserver` rather than measuring on every scroll event. CSS `scroll-behavior`, `scroll-margin-top` and `scroll-snap` often replace JS entirely.

## Events and delegation in code

```js
list.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]')
  if (!btn || !list.contains(btn)) return
  const id = btn.closest('li').dataset.id
  if (btn.dataset.action === 'delete') removeItem(id)
  if (btn.dataset.action === 'toggle') toggleItem(id)
})

const controller = new AbortController()
window.addEventListener('resize', onResize, { passive: true, signal: controller.signal })
controller.abort() // removes every listener registered with that signal
```

One listener on the container handles current and future children. `focus`/`blur` don't bubble; delegate with `focusin`/`focusout`. See the events article for phases and propagation.

## Performance: batch reads, then writes

```js
// Bad: read, write, read, write -> a layout per iteration
for (const el of boxes) el.style.height = `${el.offsetWidth}px`

// Good: read all, then write all
const widths = boxes.map((el) => el.offsetWidth)
boxes.forEach((el, i) => { el.style.height = `${widths[i]}px` })
```

- Group writes in a `requestAnimationFrame` callback when they come from frequent events.
- Toggle a class instead of setting many inline styles.
- Prefer `transform` and `opacity` for animation.
- Render long lists virtually or with `content-visibility: auto`.

## Common "implement X with DOM APIs" tasks

| Task | Core APIs |
|---|---|
| Todo list | `createElement`, `append`, delegated click, `dataset.id`, `form` submit |
| Tabs | `role="tablist"`, `aria-selected`, `hidden`, arrow-key handling |
| Accordion | `<details>`/`<summary>` or `button[aria-expanded]` + `hidden` |
| Modal | `<dialog>`, `showModal()`, `close()`, return focus to the trigger |
| Infinite scroll | `IntersectionObserver` on a sentinel element |
| Star rating | Radio inputs or buttons with `aria-pressed`, hover via delegation |
| Highlight text matches | `TreeWalker` over text nodes, `splitText`, wrap in `<mark>` |
| Find the DOM path or common ancestor | `parentElement` loop, `contains`, a `Set` of ancestors |
| Serialize/deserialize a DOM tree | Recursion over `childNodes`, `nodeType`, `attributes` |

## Worked task: an accessible tabs widget with plain DOM

A typical machine-coding prompt: "Build tabs without a framework." The markup carries the semantics:

```html
<div class="tabs">
  <div role="tablist" aria-label="Account">
    <button role="tab" id="tab-profile" aria-controls="panel-profile" aria-selected="true">Profile</button>
    <button role="tab" id="tab-billing" aria-controls="panel-billing" aria-selected="false" tabindex="-1">Billing</button>
  </div>
  <section role="tabpanel" id="panel-profile" aria-labelledby="tab-profile">…</section>
  <section role="tabpanel" id="panel-billing" aria-labelledby="tab-billing" hidden>…</section>
</div>
```

The script uses delegation, `closest`, attributes and keyboard handling:

```js
function initTabs(root) {
  const tablist = root.querySelector('[role="tablist"]')
  const tabs = [...tablist.querySelectorAll('[role="tab"]')]

  function select(tab) {
    for (const t of tabs) {
      const selected = t === tab
      t.setAttribute('aria-selected', String(selected))
      t.tabIndex = selected ? 0 : -1 // roving tabindex: only the active tab is in the Tab order
      document.getElementById(t.getAttribute('aria-controls')).hidden = !selected
    }
    tab.focus()
  }

  tablist.addEventListener('click', (event) => {
    const tab = event.target.closest('[role="tab"]')
    if (tab) select(tab)
  })

  tablist.addEventListener('keydown', (event) => {
    const index = tabs.indexOf(document.activeElement)
    if (index === -1) return
    let next = null
    if (event.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length]
    if (event.key === 'ArrowLeft') next = tabs[(index - 1 + tabs.length) % tabs.length]
    if (event.key === 'Home') next = tabs[0]
    if (event.key === 'End') next = tabs[tabs.length - 1]
    if (next) {
      event.preventDefault()
      select(next)
    }
  })
}

document.querySelectorAll('.tabs').forEach(initTabs)
```

What an interviewer looks for: one listener per tab list (delegation), the `hidden` attribute instead of inline styles, ARIA state kept in sync, arrow-key navigation with a roving `tabindex`, and no global state, so several tab widgets can live on one page.

## Rendering a list efficiently

```js
function renderList(container, items) {
  const fragment = document.createDocumentFragment()
  for (const item of items) {
    const li = document.createElement('li')
    li.dataset.id = item.id
    li.textContent = item.label // text, never HTML, for user data
    fragment.append(li)
  }
  container.replaceChildren(fragment) // one DOM mutation, clears old children
}
```

- `textContent` escapes user data; building HTML strings with it invites XSS.
- `replaceChildren` swaps everything in one operation.
- For updates to long lists, key nodes by id (a `Map` from id to element) and only touch what changed: that is a tiny version of what frameworks do in reconciliation.
- `<template>` elements hold inert markup you can clone with `template.content.cloneNode(true)`, a fast way to stamp out complex rows.

## Live versus static collections

| API | Returns | Updates when the DOM changes? |
| --- | --- | --- |
| `querySelectorAll` | `NodeList` | No: a snapshot |
| `getElementsByClassName`, `getElementsByTagName` | `HTMLCollection` | Yes: live |
| `element.children` | `HTMLCollection` | Yes: live |
| `element.childNodes` | `NodeList` | Yes: live (includes text nodes) |

Removing items while looping over a **live** collection skips elements, because indices shift under you. Copy it first (`[...collection]`) or loop backwards.

## Common interview questions

**What's the difference between `NodeList` and `HTMLCollection`?**
`querySelectorAll` returns a static `NodeList`; `children` and `getElementsBy*` return a live `HTMLCollection` that updates as the DOM changes. `childNodes` is a live `NodeList`. Convert either with spread or `Array.from` to use array methods.

**`textContent` vs `innerText` vs `innerHTML`?**
`textContent` reads or writes raw text of all descendants and is fast. `innerText` is layout-aware (respects CSS visibility and line breaks) and forces layout. `innerHTML` parses HTML and is unsafe with untrusted input.

**Why does setting `value` via `setAttribute` not update a typed-in input?**
The `value` attribute is only the default. Once the user edits, the `value` property holds the current state, so you must set `input.value`.

**How would you find the lowest common ancestor of two DOM nodes?**
Walk up from one node collecting ancestors in a `Set`, then walk up from the other until you hit a member. Alternatively loop `a = a.parentNode` until `a.contains(b)`.

**When is `DocumentFragment` still worth using?**
When you build many nodes in a loop and insert once, or when cloning `<template>` content. It keeps construction off-document and gives one insertion point.

**How do you avoid layout thrashing?**
Separate reads from writes: measure everything first, then mutate. For continuous updates, schedule writes in `requestAnimationFrame` and avoid reading geometry in the same frame after writing styles.

**How do you remove all listeners added by a component?**
Pass a shared `AbortController`'s `signal` to every `addEventListener` call and call `abort()` on teardown. Otherwise you must keep references to each handler and call `removeEventListener` with identical options.

## Key takeaways

- `querySelector`/`closest` for finding, `append`/`before`/`replaceChildren` for inserting, `remove` for deleting.
- Attributes are the HTML source; properties are the live state. They differ for `value`, `checked` and others.
- Batch DOM work with fragments or `replaceChildren`, and batch layout reads before writes.
- Insert user data with `textContent`, never with HTML strings.
- Know which collections are live, and copy them before mutating the DOM in a loop.
