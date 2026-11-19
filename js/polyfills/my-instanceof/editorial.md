**Key insight:** `instanceof` doesn't look at constructors at all. It looks for one object, `Constructor.prototype`, on the left side's prototype chain.

## Approach

1. Throw a `TypeError` if `Constructor` isn't a function.
2. Return `false` for primitives (anything that isn't a non-null object or a function).
3. `proto = Object.getPrototypeOf(value)`; loop while `proto !== null`: if `proto === Constructor.prototype` return `true`, else step up.
4. Reaching `null` means `false`.

## Walkthrough

`myInstanceof([], Object)`:

| Step | `proto` | Equals `Object.prototype`? |
| --- | --- | --- |
| start | `Array.prototype` | no |
| next | `Object.prototype` | **yes** → true |

`myInstanceof(Object.create(null), Object)` walks: `null` immediately → false. Primitives return false without walking, since `5 instanceof Number` is false.

## Complexity

`O(d)` for prototype chain depth `d`.

## Edge cases to test

- Direct instances and inherited ones.
- Primitives return false.
- Objects with a `null` prototype.
- A non-function right-hand side throws.
- Changing `Constructor.prototype` after creating an object breaks the relationship.

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

## In the interview

The whole answer is "walk the prototype chain looking for `Constructor.prototype`". Mention `Symbol.hasInstance` (which native `instanceof` consults first) and cross-realm failures as follow-ups.
