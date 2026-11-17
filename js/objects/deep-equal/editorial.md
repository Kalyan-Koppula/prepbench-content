**Key insight:** settle the cheap cases first (identity, `NaN`, primitives, prototype mismatch) so that by the time you recurse you know both sides are the same kind of object and can apply one comparison rule.

## Approach

1. `x === y` covers identical references and `0 === -0`; `x !== x && y !== y` covers `NaN`.
2. If either side is a primitive (or `null`), they are different.
3. Different prototypes mean different kinds of object: return `false`. From here on you only need to check the type of `x`.
4. Cycles: keep a stack of `[x, y]` pairs being compared. If the pair is already on the stack, return `true` (assume equal; if they differ, some other branch will find it). Pop the pair when you finish, so a failed comparison isn't remembered as a success.
5. Per kind: Date by `getTime()`, RegExp by `source` and `flags`, Map by size plus `has` and deep values, Set by matching each member against a not-yet-matched member, arrays by length and index, objects by `Object.keys` length plus `hasOwnProperty` and deep values.

## Pitfalls

- `typeof null === 'object'`; and `Object.keys([])` vs `Object.keys({})` are both empty, so without the prototype check `[]` equals `{}`.
- Comparing key counts but checking `b[k] === undefined` instead of `hasOwnProperty`: `{ a: undefined }` then equals `{ b: undefined }`.
- Sets with object members: `b.has(member)` is a reference check. "Every member of `a` has a deep match in `b`" is not enough either: `{[1], [1]}` would match `{[1], [2]}`. Each member of `b` can be used once.
- A memo of compared pairs that is never cleared can turn a pair that failed once into a pass later.

## Follow-ups interviewers add

- **`Object.is` policy:** make `0` and `-0` different. Which line changes?
- **Symbol keys and non-enumerable properties:** switch to `Reflect.ownKeys`.
- **Typed arrays, `ArrayBuffer`, boxed primitives (`new Number(1)`):** more branches.
- **Performance:** the Set matching is O(n²). When can you speed it up (all members primitive: just `has`)?
- **Loose mode:** ignore prototypes and undefined-valued keys, like Jest's `toEqual`.
