**Key insight:** map over the *values* of the tuple (`T[number]`), not its keys. Each value becomes a property name and, because `K` is the literal being visited, also its value type.

## Approach

```ts
type TupleToObject<T extends readonly PropertyKey[]> = {
  [K in T[number]]: K
}
```

`PropertyKey` is the built-in alias for `string | number | symbol`, everything a mapped type can use as a key. Constraining the elements to it rejects objects, arrays and booleans at the call site instead of producing a confusing result. `readonly` in the constraint lets `as const` tuples through.

`[K in keyof T]` would be wrong here: for a tuple, `keyof T` holds index keys (`'0'`, `'1'`) and array members (`'length'`, `'map'`, …). Homomorphic mapping over a tuple also gives back a tuple, not an object.

## Follow-ups

- Build `{ [K in T[number]]: Handler<K> }` for an event map keyed by a constant list.
- How would you build the same object at runtime with a correctly-typed `Object.fromEntries`?
