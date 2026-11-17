---
title: Event Delegation
difficulty: Medium
order: 8
tags: [dom, events, closures]
frequency: high
exports: [delegate]
dom: true
hints:
  - Attach one listener to `root`. Events from descendants bubble up to it.
  - In that listener, `event.target.closest(selector)` finds the nearest matching ancestor of whatever was clicked.
  - "`closest` can walk past `root`: only accept a match that `root` contains and that isn't `root` itself. Return a function that removes the listener you added."
---

Instead of attaching a listener to every row in a long list, attach **one** listener to a container and work out which row the event came from. That's event delegation, and it also covers rows added later.

Implement `delegate(root, selector, type, handler)`:

- Listen for `type` events on `root`.
- When an event happens inside an element that matches `selector`, call `handler` with `this` set to that matching element, and with `(event, matchedElement)` as arguments.
- Return an `unsubscribe` function that stops further calls.

```js
document.body.innerHTML = `
  <ul id="todos">
    <li data-id="1">Buy milk <button class="remove">×</button></li>
    <li data-id="2">Walk dog <button class="remove">×</button></li>
  </ul>`
const list = document.getElementById('todos')

const stop = delegate(list, 'li', 'click', function (event, li) {
  console.log(this.dataset.id, event.target.tagName)
})

list.querySelector('li[data-id="2"] button').click() // logs "2 BUTTON"
stop()
```

## Notes

- If the event comes from inside several nested matches, call `handler` once, for the **nearest** one.
- Only elements *inside* `root` count. An ancestor of `root` that matches the selector, or `root` itself, never triggers the handler.
- `event.target` must still be the element the event started on.
- Elements that match but are added after `delegate` is called must work too.
- Inside your own listener, get the container from your closure (or `event.currentTarget`) rather than from `this`.
