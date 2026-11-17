---
title: Trim
difficulty: Medium
order: 18
tags: [template-literal-types, recursion, strings]
frequency: medium
hints:
  - "A template literal pattern like `` `${Ws}${infer Rest}` `` matches a string that starts with whitespace."
  - Recurse until neither end matches.
---

Implement three string helpers at the type level. Whitespace means a space, a newline (`\n`) or a tab (`\t`).

- `TrimStart<S>` removes whitespace at the start of `S`.
- `TrimEnd<S>` removes whitespace at the end of `S`.
- `Trim<S>` removes it at both ends.

```ts
type A = TrimStart<'  hi  '> // 'hi  '
type B = TrimEnd<'  hi  '>   // '  hi'
type C = Trim<'\n\t hi \n'>  // 'hi'
```

- Any amount of whitespace is removed, not just one character, and whitespace inside the string is kept.
- Unions are trimmed member by member; the wide type `string` stays `string`.
- The argument must be a string.
