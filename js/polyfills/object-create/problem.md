---
title: Object.create
difficulty: Medium
order: 9
tags: [prototypes, objects, property descriptors]
frequency: medium
exports: [objectCreate]
hints:
  - Validate first. The prototype must be an object, a function or `null`; everything else is a `TypeError`.
  - "`Object.setPrototypeOf({}, proto)` works for `null` too, unlike the classic `function F() {}; F.prototype = proto; new F()` trick."
  - The second argument has exactly the shape `Object.defineProperties` expects.
---

Implement `objectCreate(proto, propertiesObject?)`, a standalone version of `Object.create`.

```js
const animal = { speak() { return `${this.name} makes a sound` } }
const dog = objectCreate(animal)
dog.name = 'Rex'
dog.speak()                     // "Rex makes a sound"

const dict = objectCreate(null) // no prototype: no toString, no hasOwnProperty
'toString' in dict              // false

const point = objectCreate(Object.prototype, {
  x: { value: 1, enumerable: true },
  y: { value: 2 },              // not enumerable, not writable
})
Object.keys(point)              // ['x']
```

**Don't use** `Object.create`. `Object.setPrototypeOf` and `Object.defineProperties` are allowed.

## Notes

- `proto` must be an object, a function or `null`; anything else (`undefined`, numbers, strings…) throws a `TypeError`.
- The new object has no own properties except the ones described by `propertiesObject`.
- Descriptors follow the usual defaults: anything not specified is `false`/`undefined` (not writable, not enumerable, not configurable).
- `propertiesObject` of `undefined` is ignored.
