---
title: Chunk
difficulty: Easy
order: 10
tags: [arrays, iteration]
frequency: medium
exports: [chunk]
hints:
  - Step through the array `size` items at a time.
  - "`slice` is happy to take an end index past the end of the array."
---

Implement `chunk(array, size)`, which splits an array into consecutive groups of `size` items. The last group holds whatever is left over.

```js
chunk(['a', 'b', 'c', 'd', 'e'], 2) // [['a', 'b'], ['c', 'd'], ['e']]
chunk([1, 2, 3], 5)                 // [[1, 2, 3]]
```

Handy for batching API requests or laying out a grid.

## Notes

- `size` must be a positive integer. Otherwise throw a `RangeError`.
- An empty array gives `[]`.
- Each chunk is a new array (even when the whole input fits in one chunk); the items themselves are not copied.
- Don't mutate the input.
