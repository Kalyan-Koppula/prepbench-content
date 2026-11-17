**Key insight:** `` `${infer First}${infer Rest}` `` peels off exactly one character, because when an `infer` is followed directly by another, TypeScript gives the first one a single character. That's all you need to walk a string.

## Approach

```ts
type MyCapitalize<S extends string> =
  S extends `${infer First}${infer Rest}` ? `${Uppercase<First>}${Rest}` : S

type CamelCase<S extends string> = S extends `${infer C}${infer Rest}`
  ? C extends '-' | '_'
    ? CamelCase<MyCapitalize<Rest>>
    : `${C}${CamelCase<Rest>}`
  : S
```

`MyCapitalize` uppercases the first character; the empty string doesn't match and is returned as is.

`CamelCase` looks at one character at a time. A separator is dropped and the *rest* is capitalised before recursing, so `'a--b'` goes `'a' + CamelCase<'-b'>` → `CamelCase<'B'>` → `'aB'`. Since `Uppercase<'2'>` is `'2'`, digits pass through.

**The tempting shortcut.** ``S extends `${infer H}${'-' | '_'}${infer R}` `` looks shorter, but a union between two `infer`s is matched once per member and per possible split. For `'get-user_by-id'` that produces a union of ten different strings. Walking character by character avoids the ambiguity.

## Follow-ups

- Write `KebabCase<S>` (the reverse): `'backgroundColor'` → `'background-color'`. How do you detect an uppercase letter? (`C extends Lowercase<C> ? ... : ...`)
- Write `CamelCaseKeys<T>`, which renames every key of an object with key remapping: `[K in keyof T as CamelCase<K & string>]`.
