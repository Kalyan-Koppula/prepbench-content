---
title: Event Emitter
difficulty: Medium
order: 1
tags: [classes, events, closures]
frequency: high
exports: [EventEmitter]
hints:
  - Store, per event name, an array of listener records rather than bare functions, so `once` listeners and duplicate registrations stay distinguishable.
  - In `emit`, loop over a copy of the array taken when the emit starts.
  - Remove a `once` listener before calling it, so an emit triggered from inside it can't call it again.
---

Implement an `EventEmitter` class, the pattern behind Node's `events`, DOM events and most component libraries.

```js
const chat = new EventEmitter()
const stop = chat.on('message', (from, text) => console.log(`${from}: ${text}`))
chat.once('message', () => console.log('first message!'))

chat.emit('message', 'ada', 'hi') // "ada: hi", "first message!"  -> returns true
chat.emit('message', 'lin', 'yo') // "lin: yo"                    -> returns true
stop()
chat.emit('message', 'ada', '?')  // nothing                      -> returns false
```

## Notes

- `on(event, listener)` registers a listener and returns a function that removes **that** registration (calling it again does nothing).
- `once(event, listener)` is the same, but the listener is removed right before its first call.
- `off(event, listener)` removes one registration of `listener`, the most recently added one. `off` also removes a `once` listener that hasn't fired yet. Unknown events or listeners are ignored.
- The same function can be registered more than once; it then runs once per registration.
- `emit(event, ...args)` calls the event's listeners in registration order with `args`, with `this` set to the emitter. It returns `true` if at least one listener ran, otherwise `false`.
- **During an emit**, the listener list is the one that existed when `emit` started: listeners added during the emit run from the next emit on, and removing a listener (including a listener removing itself) must never cause another listener in the current emit to be skipped. A listener removed during the emit before its turn still runs this time.
- A `once` listener must not run twice, even if it emits the same event from inside itself.
