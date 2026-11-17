---
title: Optional chaining short-circuits
difficulty: Medium
order: 13
tags: [optional-chaining]
frequency: high
expected: |
  0
  undefined
  undefined
  undefined
  TypeError
  undefined
---

```js
const user = { profile: { tags: [] }, getName: null }

console.log(user.profile?.tags?.length)
console.log(user.settings?.theme)
console.log(user.getName?.())
console.log(user.settings?.theme.color)

try {
  console.log(user.settings.theme)
} catch (e) {
  console.log(e.name)
}

console.log(typeof user.profile?.tags[0]?.id)
```

## Explanation

`a?.b` evaluates to `undefined` when `a` is `null` or `undefined`, instead of throwing.

1. Everything exists; the empty array's `length` is `0`.
2. `user.settings` is `undefined`, so `?.theme` stops there: `undefined`.
3. `?.()` calls only if the function is not nullish. `getName` is `null`, so no call happens: `undefined`.
4. Short-circuiting skips the **rest of the chain**. Once `settings?.` sees `undefined`, `.theme.color` is never evaluated, so there's no error even without a second `?.`: `undefined`.
5. Without `?.`, reading `.theme` from `undefined` throws a `TypeError`.
6. `tags[0]` is `undefined`, and `?.id` stops: `typeof undefined` is `undefined`.

Rule to remember: `?.` protects only the value directly to its left, but once it short-circuits, the whole rest of the chain is skipped.
