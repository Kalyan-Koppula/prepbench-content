---
title: Stringify a query string
difficulty: Medium
order: 4
tags: [strings, url, recursion]
frequency: medium
exports: [stringifyQuery]
hints:
  - Write a recursive `add(key, value)` that pushes `key=value` strings into an array, and join with `&` at the end.
  - Arrays call `add` with the same key for each item; plain objects call it with `key[child]`.
  - Check `undefined`, `null`, arrays and Dates before the generic object case.
---

Implement `stringifyQuery(params)`, which turns an object into a URL query string (without a leading `?`), without using `URLSearchParams`.

```js
stringifyQuery({
  q: 'red shoes',
  size: [9, 10],
  inStock: true,
  filter: { brand: 'Acme & Co' },
  cursor: undefined,
})
// 'q=red%20shoes&size=9&size=10&inStock=true&filter[brand]=Acme%20%26%20Co'
```

Rules:

- Keys and values are encoded with `encodeURIComponent` (so a space becomes `%20`).
- Pairs appear in the object's key order.
- **Arrays** repeat the key once per item, in order (nested arrays are flattened). An empty array adds nothing.
- **Plain objects** nest with brackets: `{ a: { b: 1 } }` gives `a[b]=1`, to any depth. The brackets are written literally; each key inside them is encoded.
- `undefined` (anywhere) is skipped. `null` gives `key=` with an empty value.
- Numbers and booleans use `String(value)`. **Dates** use `toISOString()`.
- An empty object gives `''`.
