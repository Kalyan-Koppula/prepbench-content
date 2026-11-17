---
title: Signals
difficulty: Hard
order: 8
tags: [reactivity, dependency-tracking, graphs]
frequency: medium
exports: [signal, computed, effect]
hints:
  - Keep a global "currently running computation". Reading a signal or computed while it is set records a dependency in both directions.
  - "On a write, don't recompute anything yet: mark direct dependents as dirty and everything further downstream as \"maybe dirty\", and queue the effects you reach."
  - A \"maybe dirty\" node first brings its sources up to date; it reruns only if one of them actually produced a new value.
---

Implement fine-grained reactivity in the style of Preact Signals, Solid and Angular signals.

```js
const first = signal('Ada')
const last = signal('Lovelace')
const full = computed(() => `${first.value} ${last.value}`)

const stop = effect(() => console.log(full.value)) // logs "Ada Lovelace"
first.value = 'Augusta'                             // logs "Augusta Lovelace"
first.value = 'Augusta'                             // same value: nothing happens
stop()
last.value = 'King'                                 // effect is gone: nothing
```

## Notes

- `signal(initial)` returns an object with a read/write `value` property.
- `computed(fn)` returns an object with a read-only `value`. It is **lazy** (`fn` doesn't run until `value` is read) and **cached** (`fn` reruns only when something it read has changed since its last run).
- `effect(fn)` runs `fn` immediately, then again **synchronously** after any write that changes something it read during its latest run. It returns a function that disposes the effect.
- Dependencies are **dynamic**: only the signals and computeds read during the most recent run count. A branch that wasn't taken isn't a dependency.
- **No redundant work:**
  - writing a value that is `Object.is`-equal to the current one does nothing;
  - if a computed reruns and produces an `Object.is`-equal value, things that depend only on it don't rerun;
  - in a "diamond" (`a` feeds `b` and `c`, and an effect reads both), one write to `a` reruns each computed and the effect **once**, and the effect never sees a mix of old and new values.
- An effect may write to other signals; effects depending on those run too, before the outer write returns.
