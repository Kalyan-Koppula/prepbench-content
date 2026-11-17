---
title: Functions returned from methods
difficulty: Medium
order: 14
tags: [arrow-functions, implicit-binding]
frequency: medium
expected: |
  global
  team
  other team
  other
---

```js
var who = 'global'

const team = {
  who: 'team',
  greeter() {
    return function () {
      return this.who
    }
  },
  arrowGreeter() {
    return () => this.who
  },
}

const g1 = team.greeter()
const g2 = team.arrowGreeter()

console.log(g1())
console.log(g2())

const other = { who: 'other', g1, g2 }
console.log(other.g1(), other.g2())
console.log(team.arrowGreeter.call(other)())
```

## Explanation

1. `g1` is a regular function. Its `this` depends only on how *it* is called. `g1()` is a plain call: `global`.
2. `g2` is an arrow created while `arrowGreeter` ran with `this = team`. It keeps that forever: `team`.
3. Attached to `other`: `other.g1()` is a method call, so `other`. `other.g2()` is still `team`, because arrows ignore the receiver.
4. `team.arrowGreeter.call(other)` runs `arrowGreeter` with `this = other`, so the arrow created during *that* call captures `other`: `other`.

Rule to remember: an arrow's `this` is fixed when it is created, by the `this` of the function call that created it.
