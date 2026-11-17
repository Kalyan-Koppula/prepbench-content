---
title: Undo / Redo History
difficulty: Medium
order: 5
tags: [classes, stacks, state]
frequency: medium
exports: [History]
hints:
  - Keep three things - a stack of past values, the present value, and a stack of future values.
  - Undo moves the present onto the future stack; redo moves it back onto the past stack.
  - A new push makes the future unreachable.
---

Implement a `History` class that tracks the values of some state (a document, a drawing, form input) and supports undo and redo.

```js
const doc = new History('', { limit: 50 })
doc.push('H')
doc.push('Hi')
doc.undo()     // 'H'
doc.undo()     // ''
doc.redo()     // 'H'
doc.push('Ho') // branching: the old redo ('Hi') is gone
doc.canRedo()  // false
doc.value      // 'Ho'
```

## Notes

- `new History(initial, options?)`. `options.limit` is the maximum number of **undo steps** kept (default: unlimited). When a push would exceed it, the oldest step is dropped. A limit of `0` keeps no undo steps.
- `value` is the current value (a read-only property).
- `push(next)` makes `next` the current value and records the previous one as an undo step. If `next` is the same as the current value (`Object.is`), do nothing: no step is recorded and the redo steps survive.
- Any real push **clears all redo steps**.
- `undo()` and `redo()` move one step and return the new current value. When there is nothing to undo/redo they change nothing and return the current value.
- `canUndo()` and `canRedo()` return booleans.
