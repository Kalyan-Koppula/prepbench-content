---
title: classNames
difficulty: Easy
order: 1
tags: [strings, recursion, objects]
frequency: high
exports: [classNames]
hints:
  - Write one recursive `visit(value)` that handles each kind of argument, and call it for every argument.
  - Strings and numbers are pushed as they are, arrays recurse, and objects contribute each own key whose value is truthy.
---

Implement `classNames(...args)`, the helper used everywhere in React code to build a `className` string from conditions.

Each argument can be:

- a **string** or **number**: included as is;
- an **object**: each of its **own** keys is included if its value is truthy;
- an **array**: its items are processed by the same rules (arrays can nest);
- anything **falsy** (`null`, `undefined`, `false`, `0`, `''`, `NaN`): skipped.

Classes are joined with single spaces, in the order they appear.

```js
classNames('btn', { 'btn-primary': isPrimary, disabled: !enabled }, size && `btn-${size}`)
// 'btn btn-primary btn-lg' when isPrimary, enabled and size === 'lg'

classNames(['a', ['b', { c: true, d: false }]], null, 'e') // 'a b c e'
```

## Notes

- `true` and functions are ignored.
- Inherited object properties are ignored.
- Duplicates are kept; don't dedupe.
