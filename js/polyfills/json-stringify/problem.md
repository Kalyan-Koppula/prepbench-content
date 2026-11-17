---
title: JSON.stringify
difficulty: Hard
order: 14
tags: [recursion, serialization, edge cases]
frequency: medium
exports: [jsonStringify]
hints:
  - Write one recursive `serialize(key, value)` that returns a string or `undefined` ("leave this out"). Objects drop `undefined` results; arrays replace them with `null`.
  - Call `toJSON(key)` first if the value has one, then switch on `typeof`. Remember `typeof null === 'object'` and that `NaN`/`Infinity` become `null`.
  - Keep a stack of the objects currently being serialized; meeting one of them again means a cycle. Pop on the way out so shared, non-cyclic references are fine.
---

Implement `jsonStringify(value)`, a version of `JSON.stringify(value)` without the `replacer` and `space` arguments. The output must match the built-in character for character.

```js
jsonStringify({ name: 'Ada', tags: ['math', undefined], born: new Date(0), skip: () => {} })
// '{"name":"Ada","tags":["math",null],"born":"1970-01-01T00:00:00.000Z"}'

jsonStringify('say "hi"\n')   // '"say \\"hi\\"\\n"'
jsonStringify(undefined)      // undefined (not a string)
```

**Don't use** `JSON.stringify`.

## Notes

- **Primitives:** strings are quoted and escaped; finite numbers use their normal string form (`-0` gives `"0"`); `NaN` and `±Infinity` give `"null"`; booleans and `null` as written.
- **String escaping:** `"` → `\"`, `\` → `\\`, and `\b \f \n \r \t` use their short escapes; any other character below U+0020 becomes `\u00XX` (lowercase hex). Everything else is copied as is.
- **`undefined`, functions and symbols:** omitted as object properties, `null` inside arrays, and at the top level the result is `undefined`.
- **Arrays:** every index from `0` to `length - 1`; holes become `null`.
- **Objects:** own enumerable string keys in `Object.keys` order; symbol keys are ignored.
- **`toJSON`:** if a value (at any level) has a `toJSON` method, serialize `value.toJSON(key)` instead, where `key` is the property name, the array index as a string, or `''` at the top level. This is how `Date` works.
- **Errors:** a circular reference throws a `TypeError` (the same object appearing twice without a cycle is fine). A `BigInt` throws a `TypeError`.
- Not required: boxed primitives (`new String('x')`), `replacer`, `space`.
