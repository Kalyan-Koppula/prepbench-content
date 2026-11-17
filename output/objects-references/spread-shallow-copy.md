---
title: Spread makes a shallow copy
difficulty: Easy
order: 2
tags: [references, spread, copying]
frequency: high
expected: |
  Ada 2 London
  true
  2 3
---

```js
const original = {
  name: 'Ada',
  tags: ['math'],
  address: { city: 'London' },
}

const copy = { ...original }
copy.name = 'Grace'
copy.tags.push('code')
copy.address = { city: 'Paris' }

console.log(original.name, original.tags.length, original.address.city)
console.log(copy.tags === original.tags)

const deep = structuredClone(original)
deep.tags.push('x')
console.log(original.tags.length, deep.tags.length)
```

## Explanation

`{ ...original }` creates a new object and copies each top-level property. For object values, it copies the **reference**.

1. `copy.name = 'Grace'` replaces a primitive on the copy only. The original keeps `Ada`.
2. `copy.tags.push('code')` mutates the array that **both** objects share, so the original has 2 tags.
3. `copy.address = {...}` reassigns the copy's property to a new object. The original's `address` is untouched: `London`.
4. `copy.tags === original.tags` is `true`: same array.
5. `structuredClone` copies deeply, so pushing onto `deep.tags` leaves the original at 2 while the clone has 3.

Rule to remember: spread and `Object.assign` copy one level deep. Nested objects stay shared unless you clone them.
