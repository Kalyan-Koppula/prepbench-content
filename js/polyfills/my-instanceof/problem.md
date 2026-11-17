---
title: Implement instanceof
difficulty: Easy
order: 11
tags: [prototypes, objects]
frequency: medium
exports: [myInstanceof]
hints:
  - "`a instanceof C` asks one question: does `C.prototype` appear anywhere on `a`'s prototype chain?"
  - Walk the chain with `Object.getPrototypeOf` until you hit `C.prototype` (true) or `null` (false).
  - Primitives have no prototype chain of their own, so they're never instances; check the right-hand side is callable before anything else.
---

Implement `myInstanceof(value, Constructor)` so that it returns the same result as `value instanceof Constructor` for ordinary constructors and classes.

```js
class Animal {}
class Dog extends Animal {}
const rex = new Dog()

myInstanceof(rex, Dog)      // true
myInstanceof(rex, Animal)   // true
myInstanceof(rex, Object)   // true
myInstanceof(rex, Array)    // false
myInstanceof(5, Number)     // false: primitives are never instances
```

**Don't use** `instanceof` or `isPrototypeOf`.

## Notes

- Walk `value`'s prototype chain and compare each link with `Constructor.prototype`. The check is live: if a prototype is changed later, the answer changes.
- Primitives (`5`, `'s'`, `true`, `null`, `undefined`) are never instances. Boxed values like `new Number(5)` are objects and are.
- Functions are objects too: `myInstanceof(function () {}, Object)` is `true`.
- If `Constructor` isn't a function, throw a `TypeError`.
- You don't need to support `Symbol.hasInstance`.
