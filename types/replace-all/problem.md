---
title: Replace and ReplaceAll
difficulty: Medium
order: 20
tags: [template-literal-types, recursion, strings]
frequency: medium
hints:
  - "`` `${infer Before}${From}${infer After}` `` splits a string around the first occurrence of `From`."
  - For `ReplaceAll`, recurse only on the part *after* the match, so text you just inserted is never scanned again.
  - An empty `From` matches everywhere. Handle it before pattern matching.
---

Implement the type-level `String.prototype.replace` and `replaceAll` for string literals:

- `Replace<S, From, To>` replaces the **first** occurrence of `From` in `S` with `To`.
- `ReplaceAll<S, From, To>` replaces **every** occurrence, scanning left to right.

```ts
type A = Replace<'2024-01-31', '-', '/'>    // '2024/01-31'
type B = ReplaceAll<'2024-01-31', '-', '/'> // '2024/01/31'
```

- If `From` doesn't occur, or `From` is the empty string `''`, `S` is returned unchanged.
- Matches don't overlap, and text that has been inserted is not searched again: `ReplaceAll<'aaaa', 'aa', 'a'>` is `'aa'`, not `'a'`.
- Unions in `S` are handled member by member. All three arguments must be strings.
