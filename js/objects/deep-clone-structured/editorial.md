**Key insight:** a `WeakMap` from original to clone fixes both cycles and shared references, as long as you store the clone **before** recursing into its children.

## Approach

1. Primitives and functions: return them.
2. If `seen` already has this object, return the stored clone.
3. `Date` and `RegExp` have no children, so build the copy directly.
4. For `Map`, `Set`, arrays and other objects: create the empty container, `seen.set(original, container)`, then fill it, passing the same `seen` down.
5. For ordinary objects, `Object.create(Object.getPrototypeOf(src))` keeps the prototype, and `Reflect.ownKeys` plus a `propertyIsEnumerable` check picks up string and symbol keys.

## Pitfalls

- Registering the clone **after** filling it: the recursion hits the cycle before the map knows about it and overflows the stack.
- `Object.keys` and `for...in` skip symbol keys.
- `{}` as the target loses the prototype, so cloned class instances lose their methods.
- `new Map(src)` copies keys and values by reference; you have to clone each entry.
- Checking `typeof x === 'object'` alone treats `null` as an object.

## Follow-ups interviewers add

- **Map keys policy:** cloning keys means you can't look up the copy with the original key object. When would you keep keys as-is?
- **Typed arrays, `ArrayBuffer`, `Error`:** more branches; how would you organise them (a lookup of cloners keyed by tag)?
- **Getters and non-enumerable properties:** copy descriptors with `Object.getOwnPropertyDescriptors` instead of values.
- **Compare with `structuredClone`:** it handles cycles and built-ins, but throws on functions and DOM nodes and drops class prototypes.
- **Iterative version** with an explicit stack for very deep graphs.
