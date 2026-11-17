---
title: this inside setTimeout callbacks
difficulty: Medium
order: 8
tags: [callbacks, timers, arrow-functions]
frequency: high
expected: |
  speak: global
  function: global
  arrow: happy
---

```js
var mood = 'global'

const player = {
  mood: 'happy',
  speak() {
    console.log('speak:', this.mood)
  },
  later() {
    setTimeout(function () {
      console.log('function:', this.mood)
    }, 0)
    setTimeout(() => {
      console.log('arrow:', this.mood)
    }, 0)
  },
}

setTimeout(player.speak, 0)
player.later()
```

## Explanation

`setTimeout` calls its callback as a plain function, with no receiver. In a browser (sloppy mode) that makes `this` the global object.

1. `setTimeout(player.speak, 0)` passes the bare method. When the timer fires, `this` is `window`, and `window.mood` is the global `var`: `speak: global`. It was scheduled first, so it runs first.
2. `player.later()` is a method call, so inside `later`, `this` is `player`. It schedules two more timers.
3. The `function` callback gets its own `this` from how the timer calls it, which is `window`: `function: global`.
4. The arrow callback has no `this` of its own; it uses `later`'s, which is `player`: `arrow: happy`.

Rule to remember: timers lose the receiver; use an arrow (or `bind`) when the callback needs the surrounding `this`.
