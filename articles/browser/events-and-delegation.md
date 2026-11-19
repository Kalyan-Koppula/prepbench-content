---
title: Events and Delegation
order: 2
summary: Capture, target and bubble phases, event delegation, stopPropagation vs preventDefault, passive listeners and custom events.
---

DOM events are everywhere in frontend interviews: explaining propagation, implementing delegation for a list, debugging why a click handler fires twice, or making scroll listeners cheaper. Know the three phases and the handful of listener options cold.

## How an event reaches your code

When the user clicks, the browser's input system works out which element is under the pointer (hit testing), creates a `PointerEvent`, then a `MouseEvent` for `click`, and queues a **task** to dispatch it. When that task runs:

1. The browser computes the **propagation path** once, from `window` down to the target. Elements added or removed during dispatch don't change this path.
2. It walks the path three times: capture, target, bubble, calling matching listeners in the order they were added.
3. After every listener has run, if nobody called `preventDefault()`, it performs the **default action**: follow the link, toggle the checkbox, submit the form.

Because each user event is its own task, the microtask queue drains between two separate clicks, and a `Promise.then` scheduled in a click handler runs before the browser processes the next input (see [The Event Loop](/read/event-loop)).

## The three phases

```text
window → document → html → body → ul → li → button      (capture phase)
                                           button          (target phase)
button → li → ul → body → html → document → window       (bubble phase)
```

- **Capture:** from the window down to the target's parent. Listeners registered with `{ capture: true }` run here.
- **Target:** at the target itself. Capture listeners on the target run first, then bubble listeners (modern browsers).
- **Bubble:** from the target's parent back up. Default for `addEventListener`.

```js
parent.addEventListener('click', () => console.log('parent capture'), { capture: true })
parent.addEventListener('click', () => console.log('parent bubble'))
child.addEventListener('click', () => console.log('child'))
// Clicking child: parent capture, child, parent bubble
```

### A propagation trace

```html
<div id="outer">
  <div id="inner">
    <button id="btn">Save</button>
  </div>
</div>
```

```js
outer.addEventListener('click', () => log('outer capture'), { capture: true })
outer.addEventListener('click', () => log('outer bubble'))
inner.addEventListener('click', (e) => {
  log('inner bubble')
  e.stopPropagation()
})
btn.addEventListener('click', () => log('btn 1'))
btn.addEventListener('click', () => log('btn 2'))
```

| Phase | Element | Logs |
| --- | --- | --- |
| Capture | `outer` | outer capture |
| Target | `btn` | btn 1, btn 2 (in registration order) |
| Bubble | `inner` | inner bubble, then propagation stops |
| Bubble | `outer` | (never reached) |

Note that `stopPropagation` in `inner` doesn't undo the capture listener that already ran on `outer`. Capture listeners are the reliable way for an ancestor to see every event, even ones that are stopped lower down.

Not every event bubbles: `focus`, `blur`, `mouseenter`, `mouseleave`, `load` and `scroll` on elements don't. Use `focusin`/`focusout` and `mouseover`/`mouseout` when you need bubbling versions.

## `target` vs `currentTarget`

| Property | Meaning |
|---|---|
| `event.target` | The deepest element where the event originated (e.g. a `<span>` inside a button) |
| `event.currentTarget` | The element whose listener is running right now |
| `event.composedPath()` | The full propagation path, including across open shadow roots |

`currentTarget` is `null` once dispatch finishes, so read it synchronously, not in an awaited callback.

## Event delegation

Attach one listener to a stable ancestor and use `closest()` to find the relevant item. Works for items added later and saves memory on large lists.

```js
const list = document.querySelector('#todo-list')

list.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]')
  if (!button || !list.contains(button)) return

  const item = button.closest('li')
  const { action } = button.dataset
  if (action === 'delete') item.remove()
  if (action === 'toggle') item.classList.toggle('done')
})
```

- Use `closest` rather than checking `event.target` directly; the click may land on an icon inside the button.
- The `list.contains` check guards against matches outside the container when using generic selectors.
- Doesn't work directly for non-bubbling events; use their bubbling counterparts or capture.
- React already delegates: it attaches listeners at the root container and dispatches synthetic events.

### A reusable delegation helper

```js
function on(root, type, selector, handler, options) {
  const listener = (event) => {
    const match = event.target.closest(selector)
    if (match && root.contains(match)) {
      handler.call(match, event, match) // `this` and the second argument are the matched element
    }
  }
  root.addEventListener(type, listener, options)
  return () => root.removeEventListener(type, listener, options)
}

const off = on(document.querySelector('#table'), 'click', 'tr[data-id]', (event, row) => {
  openDetails(row.dataset.id)
})
```

This is the core of what jQuery's `.on(type, selector, handler)` did. Note that `event.target` may be a text node's parent rather than an element you expect, and for keyboard events it is the focused element.

## `stopPropagation` vs `preventDefault`

| Method | Effect |
|---|---|
| `event.preventDefault()` | Cancels the browser's default action (link navigation, form submit, checkbox toggle, scroll on touch). Propagation continues. |
| `event.stopPropagation()` | Stops the event from reaching further elements. Other listeners on the current element still run. |
| `event.stopImmediatePropagation()` | Also stops remaining listeners on the current element. |
| `return false` | In an inline `onclick` attribute, prevents default. In `addEventListener`, does nothing. |

```js
form.addEventListener('submit', (event) => {
  event.preventDefault() // handle with fetch instead of navigating
  save(new FormData(form))
})
```

Avoid `stopPropagation` as a general fix: it breaks delegated listeners, analytics and "click outside to close" logic further up the tree. Prefer checking `event.target` in the outer handler.

`event.defaultPrevented` tells later listeners that someone cancelled the default.

## Listener options

```js
el.addEventListener('scroll', onScroll, {
  passive: true,        // promise not to call preventDefault
  once: true,           // auto-remove after first call
  capture: false,
  signal: controller.signal, // remove when controller.abort() is called
})
```

### Passive listeners

For `touchstart`, `touchmove` and `wheel`, the browser must wait for your listener to finish before scrolling, in case you call `preventDefault()`. Marking the listener passive lets scrolling start immediately. Modern browsers default `touchstart`, `touchmove` and `wheel` listeners on `window`, `document` and `body` to passive. Calling `preventDefault()` inside a passive listener is ignored with a console warning.

For scroll-linked effects, consider `IntersectionObserver` or CSS scroll-driven animations instead of listeners.

### Removing listeners

`removeEventListener` needs the **same function reference** and the same `capture` value. Anonymous functions can't be removed; use a named reference or an `AbortSignal`.

## Custom events

```js
const event = new CustomEvent('cart:add', {
  detail: { id: 42, qty: 1 },
  bubbles: true,     // default false
  composed: true,    // cross shadow DOM boundaries
  cancelable: true,
})
const notCancelled = button.dispatchEvent(event) // false if a listener called preventDefault

document.addEventListener('cart:add', (e) => updateBadge(e.detail))
```

- `dispatchEvent` is **synchronous**: listeners run before it returns.
- Native-like events can be created with their constructors (`new KeyboardEvent('keydown', { key: 'Enter' })`), but synthetic events are untrusted (`event.isTrusted === false`) and won't trigger default actions like opening a file picker.
- `EventTarget` can be instantiated or extended directly for a lightweight pub/sub bus.

## Keyboard and pointer notes

- Use `pointerdown`/`pointerup` to handle mouse, touch and pen with one code path.
- Read `event.key` (`'Enter'`, `'Escape'`, `'ArrowDown'`) rather than deprecated `keyCode`.
- `click` also fires for keyboard activation (Enter/Space) on buttons; prefer `click` over `mousedown` for actions.

## Focus events and focus management

| Event | Bubbles | Fires when |
| --- | --- | --- |
| `focus` / `blur` | No | An element gains or loses focus |
| `focusin` / `focusout` | Yes | The same, but bubbling, so usable with delegation |

`focusout` carries `event.relatedTarget`, the element receiving focus next. That lets a dropdown close only when focus leaves the whole widget:

```js
menu.addEventListener('focusout', (event) => {
  if (!menu.contains(event.relatedTarget)) closeMenu()
})
```

Keyboard users depend on predictable focus: move focus into a dialog when it opens, return it to the trigger when it closes, and never remove focus outlines without a visible replacement (`:focus-visible`).

## High-frequency events

`input`, `scroll`, `resize`, `pointermove` and `wheel` can fire dozens of times per frame. Strategies:

- **Debounce** work that should run once the user pauses (search requests on `input`).
- **Throttle** or batch per animation frame for visual updates:

```js
let scheduled = false
let lastX = 0
window.addEventListener('pointermove', (event) => {
  lastX = event.clientX
  if (scheduled) return
  scheduled = true
  requestAnimationFrame(() => {
    scheduled = false
    cursor.style.transform = `translateX(${lastX}px)`
  })
})
```

- **Replace listeners with observers** when you only need to know about visibility or size: `IntersectionObserver` and `ResizeObserver` are asynchronous and batched by the browser.

## Events in React

- React attaches one listener per event type to the **root container** and dispatches its own synthetic events through the component tree. It is delegation, built in.
- `onClick` handlers run in the bubble phase; `onClickCapture` runs in the capture phase.
- Since React 17, listeners attach to the root element rather than `document`, so several React apps (or React and non-React code) on one page don't interfere.
- `event.stopPropagation()` in React stops propagation through React's tree; a native listener on `document` added with `addEventListener` may still run, depending on phase.
- `onChange` on inputs fires on every keystroke (it maps to the native `input` event), unlike the native `change` event.

## Events and shadow DOM

Events from inside a shadow root are **retargeted** when they cross the boundary: listeners outside see `event.target` as the host element, not the internal node, which keeps the component's internals private. Only events with `composed: true` cross the boundary at all; most UI events (`click`, `input`, `keydown`) are composed, custom events are not by default. `event.composedPath()` reveals the full path for open shadow roots.

## Common interview questions

**What is event delegation and why use it?**
Handling events for many children with one listener on a common ancestor, relying on bubbling. It uses less memory, handles dynamically added children, and simplifies cleanup.

**Difference between `stopPropagation` and `preventDefault`?**
`stopPropagation` stops the event travelling to other elements; `preventDefault` cancels the browser's default action. They're independent.

**In what order do capture and bubble listeners fire?**
Capture listeners from the window down to the target's parent, then target listeners, then bubble listeners from the parent up to the window.

**How would you implement "click outside to close"?**
Listen on `document` for `pointerdown` and close if `!menu.contains(event.target)`. Remove the listener when the menu closes, and don't let inner handlers stop propagation.

**Why are passive listeners faster?**
The browser doesn't have to wait for JavaScript before scrolling, because you've promised not to cancel the scroll.

**Is `dispatchEvent` synchronous?**
Yes. All listeners run before it returns, unlike native user events which are queued as tasks.

## Pitfalls

- Comparing `event.target` directly instead of using `closest()`.
- Removing a listener with a different function reference or capture flag.
- Using `mouseenter` with delegation; it doesn't bubble.
- Reading `event.currentTarget` after an `await`.
- Overusing `stopPropagation` and breaking outer handlers.

## Key takeaways

- Events travel capture → target → bubble along a path fixed at dispatch time.
- `target` is where the event started; `currentTarget` is where the running listener lives.
- Delegate with one listener on a stable ancestor plus `closest()`.
- `preventDefault` cancels the browser's action; `stopPropagation` stops the journey. They're independent.
- Use passive listeners, `requestAnimationFrame` batching and observers for high-frequency events.
- Clean up with `AbortSignal`, and use `focusin`/`focusout` with `relatedTarget` for focus logic.
