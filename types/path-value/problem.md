---
title: Paths and PathValue
difficulty: Hard
order: 24
tags: [template-literal-types, recursion, mapped-types]
frequency: medium
hints:
  - "`Paths<T>`: map each string key `K` to `K` itself plus `K` joined with a dot to every path below it, then index the mapped type with `keyof T` to collect one union."
  - "`PathValue`: split the path at the first dot with `` `${infer Head}.${infer Rest}` `` and recurse into `T[Head]`."
  - Strip `null`/`undefined` before you step into a property, and remember that you did.
---

Type a lodash-style `get(obj, 'a.b.c')`. Implement:

- `Paths<T>`: the union of every dot path into the object type `T`, at every depth.
- `PathValue<T, P>`: the type of the value at path `P`. `P` must be one of `Paths<T>`; any other string is a type error.

```ts
interface Settings {
  theme: { mode: 'light' | 'dark'; accent: { hue: number } }
  account: { billing?: { plan: 'free' | 'pro' } }
}

type P = Paths<Settings>
// 'theme' | 'theme.mode' | 'theme.accent' | 'theme.accent.hue'
// | 'account' | 'account.billing' | 'account.billing.plan'

type V = PathValue<Settings, 'theme.accent.hue'> // number
```

Rules:

- Only string keys count. Paths go into nested objects but **not** into arrays or functions: an array-valued property is a leaf (`'tags'` is a path, `'tags.length'` isn't).
- Paths continue through optional and nullable properties (`'account.billing.plan'` above).
- Like optional chaining (`a?.b?.c`), if any object *on the way* to the value can be `null` or `undefined`, the result includes `undefined`: `PathValue<Settings, 'account.billing.plan'>` is `'free' | 'pro' | undefined`.
