---
title: Intersection and Difference
difficulty: Easy
order: 15
tags: [arrays, set]
frequency: medium
exports: [intersection, difference]
hints:
  - Turn the "other" arrays into `Set`s once, then make a single pass over the first array.
  - "`Set` already compares values the way the notes ask for."
---

Implement two set operations on arrays. Both keep the order of the **first** array.

- `intersection(...arrays)`: the values that appear in **every** array, without duplicates.
- `difference(array, ...others)`: the items of `array` that appear in **none** of the others.

```js
intersection(['a', 'b', 'c', 'b'], ['b', 'c', 'd'], ['c', 'b']) // ['b', 'c']
difference([1, 2, 3, 2, 4], [2], [4, 5])                        // [1, 3]
```

## Notes

- Values are compared with SameValueZero (the `Set` rule): `NaN` matches `NaN`, `1` does not match `'1'`, objects match only the same reference.
- `intersection` removes duplicates; each value appears once, at the position of its first occurrence in the first array. With one array it returns that array's unique values; with no arrays it returns `[]`.
- `difference` is a filter: it keeps duplicates from `array` (`difference([1, 1, 2], [2])` is `[1, 1]`). With no other arrays it returns a copy of `array`.
- Always return a new array; never mutate the inputs.
- Aim for linear time in the total number of items.
