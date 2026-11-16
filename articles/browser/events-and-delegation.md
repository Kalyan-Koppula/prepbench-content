---
title: Events and Delegation
order: 2
summary: Capture, target and bubble phases, event delegation, stopPropagation vs preventDefault, passive listeners and custom events.
---

DOM events are everywhere in frontend interviews: explaining propagation, implementing delegation for a list, debugging why a click handler fires twice, or making scroll listeners cheaper. Know the three phases and the handful of listener options cold.

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
