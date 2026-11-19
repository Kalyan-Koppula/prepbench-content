**Key insight:** a `WeakMap` from original to clone fixes both cycles and shared references, as long as you store the clone **before** recursing into its children.

## Approach

1. Primitives and functions: return them.
2. If `seen` already has this object, return the stored clone.
3. `Date` and `RegExp` have no children, so build the copy directly.
4. For `Map`, `Set`, arrays and other objects: create the empty container, `seen.set(original, container)`, then fill it, passing the same `seen` down.
5. For ordinary objects, `Object.create(Object.getPrototypeOf(src))` keeps the prototype, and `Reflect.ownKeys` plus a `propertyIsEnumerable` check picks up string and symbol keys.

## Walkthrough

Cloning an object with a cycle and built-ins:

```js
const original = { created: new Date(0), tags: new Set(['x']) }
original.self = original
const copy = cloneDeep(original)
```

| Step | Value | Action | `seen` after |
| --- | --- | --- | --- |
| 1 | `original` | new object with the same prototype; record it **before** recursing | {original → copy} |
| 2 | `created` | new `Date` with the same time | – |
| 3 | `tags` | new `Set`, record it, clone each item | {…, tags → copyTags} |
| 4 | `self` | already in `seen`: return `copy` | – |

`copy.self === copy` is true: the cycle is reproduced instead of recursing forever. Registering each container in `seen` before cloning its children is what makes cycles (and shared references) work.

## Complexity

`O(n)` time for `n` reachable values; `O(n)` extra space for the `WeakMap`.

## Edge cases to test

- Cycles and shared references (two keys pointing at the same object stay shared).
- `Date`, `RegExp`, `Map`, `Set` produce new instances of the same type.
- Symbol keys are copied; non-enumerable properties are skipped.
- Class instances keep their prototype.
- Arrays with holes keep their length.

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

## In the interview

The key sentence: "record the copy in the map before recursing". Then compare with `structuredClone` (drops prototypes, throws on functions) and `JSON` round-tripping (loses many types and fails on cycles).
