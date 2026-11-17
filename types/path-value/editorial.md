**Key insight:** both halves are recursion over the object. `Paths` builds strings with template literal types on the way down; `PathValue` takes the string apart on the way down.

## Approach

**Collecting paths.**

```ts
type Paths<T> = T extends readonly unknown[] | ((...args: any[]) => any)
  ? never
  : T extends object
    ? { [K in keyof T]-?: K extends string ? K | `${K}.${Paths<NonNullable<T[K]>>}` : never }[keyof T]
    : never
```

Each string key contributes itself plus itself joined to every path below it. Primitives, arrays and functions have no paths, so `` `${K}.${never}` `` is `never` and only `K` survives. `NonNullable` lets paths continue through `billing?:` and `| null`. The `-?` stops optional keys from adding `undefined` to the union when the mapped type is indexed with `[keyof T]`.

**Reading a path.**

```ts
type Nullish<T> = T extends null | undefined ? undefined : never

type Get<T, P extends string> = P extends `${infer Head}.${infer Rest}`
  ? Head extends keyof NonNullable<T> ? Get<NonNullable<T>[Head], Rest> | Nullish<T> : never
  : P extends keyof NonNullable<T> ? NonNullable<T>[P] | Nullish<T> : never

type PathValue<T, P extends Paths<T>> = Get<T, P>
```

`` `${infer Head}.${infer Rest}` `` splits at the first dot. At each step we strip `null`/`undefined` to read the property, and `Nullish<T>` adds `undefined` back if the object we stepped through could be missing: the type-level version of `?.`. The final property's own type is returned as declared, so `PathValue<Settings, 'owner'>` keeps its `| null`.

Putting `P extends Paths<T>` on `PathValue` and on `get` is what turns a typo into an error. It also gives editor autocomplete for the path string.

## Follow-ups

- Support array indices: `'items.0.name'` or `` `items.${number}.name` ``.
- Very large or recursive types (e.g. a tree node that references itself) make `Paths` hit the instantiation depth limit. Add a depth counter that stops after, say, 5 levels.
- Type the matching `set(obj, path, value)` so `value` must be `PathValue<T, P>`.
