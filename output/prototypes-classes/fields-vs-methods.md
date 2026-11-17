---
title: Class fields vs class methods
difficulty: Medium
order: 5
tags: [classes, class-fields]
frequency: medium
expected: |
  greeting,hello
  constructor,hi
  false true
---

```js
class Greeter {
  greeting = 'hi'
  hello = () => this.greeting
  hi() {
    return this.greeting
  }
}

const g = new Greeter()

console.log(Object.keys(g).join(','))
console.log(Object.getOwnPropertyNames(Greeter.prototype).join(','))
console.log(g.hello === new Greeter().hello, g.hi === new Greeter().hi)
```

## Explanation

1. **Fields** (`greeting = …`, `hello = …`) are created on each instance when the constructor runs, as own enumerable properties: `greeting,hello`.
2. **Methods** (`hi() {}`) are defined once on `Greeter.prototype`, next to the automatic `constructor` property. Class methods are non-enumerable, which is why `getOwnPropertyNames` is used instead of `Object.keys`: `constructor,hi`.
3. Every instance gets a new `hello` arrow, so two instances' `hello` differ (`false`). Both instances find the same `hi` on the prototype (`true`).

Rule to remember: fields live on the instance (one copy each); methods live on the prototype (one shared copy).
