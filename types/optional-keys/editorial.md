**Key insight:** "optional" is a property of the *key*, so test the key in isolation: `{}` is assignable to `Pick<T, K>` exactly when `K` is optional in `T`.

## Approach

```ts
type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T]

type RequiredKeys<T> = Exclude<keyof T, OptionalKeys<T>>
```

1. Map every key to itself if it's optional, or to `never` if it isn't.
2. Index the mapped type with `keyof T` to collect the values into a union; `never` members disappear.

`Pick<T, K>` keeps the `?` modifier, so `Pick<Props, 'label'>` is `{ label?: string }`, and an empty object is assignable to it. `Pick<Props, 'onClose'>` is `{ onClose: (() => void) | undefined }`, which `{}` is not assignable to, since the key is missing.

**The `-?`.** The mapped type is homomorphic, so without `-?` every optional key stays optional in the helper object, and reading it with `[keyof T]` adds `| undefined` to the result.

**Why not check the value?** `undefined extends T[K]` can't tell `label?: string` from `onClose: X | undefined`; both include `undefined` when read.

## Follow-ups

- Write `GetOptional<T>` that returns the object of only the optional properties.
- How does `exactOptionalPropertyTypes` change `T[K]` for an optional key, and does this solution still work?
