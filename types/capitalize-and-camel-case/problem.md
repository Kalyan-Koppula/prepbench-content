---
title: Capitalize and CamelCase
difficulty: Medium
order: 19
tags: [template-literal-types, recursion, strings]
frequency: medium
hints:
  - "`` `${infer First}${infer Rest}` `` splits off the first character of a string literal."
  - Walk `CamelCase` one character at a time. A union of separators placed between two `infer`s in one pattern matches in more ways than you want.
---

Implement two string helpers without using the built-in `Capitalize` or `Uncapitalize`. You may use the intrinsic `Uppercase` and `Lowercase`.

- `MyCapitalize<S>` uppercases the first character of `S` and leaves the rest alone.
- `CamelCase<S>` converts kebab-case or snake_case to camelCase: every `-` or `_` is removed and the character right after it is uppercased.

```ts
type A = MyCapitalize<'hello world'>     // 'Hello world'
type B = CamelCase<'get-user_by-id'>     // 'getUserById'
type C = CamelCase<'background-color'>   // 'backgroundColor'
```

- `CamelCase` only changes characters that follow a separator. Everything else, including existing capitals, is left as it is.
- Runs of separators act as one: `'a--b'` gives `'aB'`. A trailing separator is just dropped.
- Uppercasing a non-letter does nothing: `'v-2'` gives `'v2'`.
- Unions are handled member by member, and the argument must be a string.
