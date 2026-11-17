**Key insight:** `bind` is a closure over `(target, thisArg, presets)` that forwards with `apply`, plus one branch: when the bound function is called with `new`, behave like `new target(...)` instead.

## Approach

1. In `myBind`, `this` is the target. Throw a `TypeError` if it isn't a function.
2. Return a regular `function bound(...args)`:
   - Combine `[...presets, ...args]` into a fresh array each call.
   - If `new.target` is set (called with `new`), create `instance = Object.create(target.prototype)`, run `target.apply(instance, allArgs)`, and return the target's result if it's an object or function, otherwise `instance`.
   - Otherwise return `target.apply(thisArg, allArgs)`.
3. Re-binding works automatically: the outer bound function ignores any `this` it receives.

A pre-ES2015 alternative to `new.target`: set `bound.prototype = Object.create(target.prototype)` and check `this instanceof bound`.

## Pitfalls

- Returning an arrow function: you can't call it with `new` at all.
- Ignoring `new`: `new Bound()` then writes properties onto the bound `thisArg` object and returns a plain object that isn't `instanceof Target`.
- `bound.prototype = target.prototype` (sharing instead of inheriting): adding methods to one adds them to the other.
- Pushing call arguments onto `presets`, so they accumulate across calls.

## Follow-ups interviewers add

- **`name` and `length`:** native bound functions are named `"bound fn"` and have `length = max(0, fn.length - presets.length)`. Set them with `Object.defineProperty`.
- **`instanceof Bound`:** natively `new Bound() instanceof Bound` is true; which of the two implementations above gets that right?
- **Classes:** `target.apply` throws for `class` constructors; `Reflect.construct(target, args, new.target)` fixes it.
- **Arrow functions:** what does `arrow.bind(obj)` do (nothing to `this`, presets still apply)?
