---
title: Function.prototype.call
difficulty: Medium
order: 1
tags: [this, prototypes, symbols]
frequency: high
exports: [myCall]
hints:
  - "The only way to choose `this` without call/apply/bind is a method call: `obj.method()` runs `method` with `this === obj`."
  - Attach the function to the context object under a key nobody else can be using (a fresh `Symbol`), call it as a method, then delete the key.
  - "`null`/`undefined` mean `globalThis`; primitives need `Object(value)` before you can put a property on them. Clean up even when the function throws."
---

Implement `myCall` so that `fn.myCall(thisArg, ...args)` behaves like `fn.call(thisArg, ...args)`: it runs `fn` once with `this` set to `thisArg` and the given arguments, and returns `fn`'s result.

Write it as a plain function that reads the target function from `this`. The tests install it as `Function.prototype.myCall` and call it as a method:

```js
function greet(greeting, mark) {
  return `${greeting}, ${this.name}${mark}`
}
greet.myCall({ name: 'Ada' }, 'Hello', '!') // "Hello, Ada!"
```

**Don't use** `call`, `apply`, `bind` or `Reflect.apply`.

## Notes

- If `thisArg` is `null` or `undefined`, use `globalThis`.
- Primitive `thisArg` values (`'abc'`, `42`) are boxed, so `this.toUpperCase()` works on a string.
- The context object must look untouched afterwards and during the call: no extra enumerable keys, no leftovers, and existing properties keep their values, even if `fn` throws.
- Errors thrown by `fn` propagate to the caller.
