---
title: Implement the new operator
difficulty: Medium
order: 10
tags: [prototypes, this, constructors]
frequency: medium
exports: [myNew]
hints:
  - "`new` does four things: create an object, link its prototype, run the constructor with `this` set to it, and pick the return value."
  - Link the prototype *before* running the constructor; constructors often call prototype methods on `this`.
  - Only objects and functions returned by the constructor replace the new instance. `null` is not an object for this purpose.
---

Implement `myNew(Constructor, ...args)` so that it behaves like `new Constructor(...args)` for plain constructor functions.

```js
function Person(name) {
  this.name = name
}
Person.prototype.greet = function () {
  return `Hi, I'm ${this.name}`
}

const ada = myNew(Person, 'Ada')
ada.greet()             // "Hi, I'm Ada"
ada instanceof Person   // true
```

**Don't use** `new` on `Constructor` or `Reflect.construct`. You may use `Object.create`/`Object.setPrototypeOf` and `apply`.

## Notes

- The new object's prototype is `Constructor.prototype`, set before the constructor runs. If `Constructor.prototype` isn't an object (e.g. someone set it to `null`), use `Object.prototype`.
- The constructor runs with `this` set to the new object and receives `args`.
- If the constructor returns an object or a function, that is the result. Any other return value (`undefined`, numbers, strings, `null`) is ignored and the new object is returned.
- `Constructor` that isn't a function → `TypeError`. You don't need to support `class` constructors.
