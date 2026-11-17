**Key insight:** `instanceof` doesn't look at constructors at all. It looks for one object, `Constructor.prototype`, on the left side's prototype chain.

## Approach

1. Throw a `TypeError` if `Constructor` isn't a function.
2. Return `false` for primitives (anything that isn't a non-null object or a function).
3. `proto = Object.getPrototypeOf(value)`; loop while `proto !== null`: if `proto === Constructor.prototype` return `true`, else step up.
4. Reaching `null` means `false`.

## Pitfalls

- Starting the walk at `value` itself instead of its prototype: `myInstanceof(Foo.prototype, Foo)` would wrongly be `true`.
- `Object.getPrototypeOf(5)` returns `Number.prototype` (it boxes), so primitives must be filtered out first.
- Using `value.__proto__`: missing on `Object.create(null)` objects and can be shadowed by an own property.
- Comparing `value.constructor === Constructor`: misses inheritance and is trivially spoofed.

## Follow-ups interviewers add

- **`Symbol.hasInstance`:** `instanceof` first calls `Constructor[Symbol.hasInstance]` if present. Add it, and write a class where `5 instanceof Even` works.
- **Cross-realm arrays:** why `iframeArray instanceof Array` is false and `Array.isArray` exists.
- **Bound functions:** `x instanceof boundFn` uses the target function's prototype.
- **Implement `isPrototypeOf`** with the same loop.
