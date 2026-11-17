**Key insight:** `new F(...args)` is four steps you can do by hand: create an object linked to `F.prototype`, call `F` with that object as `this`, and return the constructor's result only if it's an object.

## Approach

1. Throw a `TypeError` if `Constructor` isn't a function.
2. `proto = Constructor.prototype`; if it isn't an object, use `Object.prototype`.
3. `instance = Object.create(proto)` (prototype linked *before* the constructor runs).
4. `result = Constructor.apply(instance, args)`.
5. Return `result` if it's a non-null object or a function; otherwise return `instance`.

## Pitfalls

- `typeof result === 'object'` alone: `null` passes it, so `return null` would make `myNew` return `null`.
- Ignoring functions as return values; they are objects too.
- Creating `{}`, running the constructor, and setting the prototype afterwards: the constructor can't call prototype methods on `this`.
- `instance.__proto__ = Constructor.prototype` silently does nothing when the prototype isn't an object.

## Follow-ups interviewers add

- **Classes:** `Constructor.apply` throws "Class constructor cannot be invoked without new"; `Reflect.construct(C, args)` is the only way.
- **`new.target`:** what is it inside a constructor called by `myNew`? How would a constructor detect being called without `new`?
- **Arrow functions and methods:** why can't they be constructors (no `prototype`, no `[[Construct]]`)?
- **Implement `instanceof`** to check the object you built.
