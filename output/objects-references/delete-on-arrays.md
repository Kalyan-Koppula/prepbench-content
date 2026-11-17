---
title: delete on an array element
difficulty: Medium
order: 8
tags: [arrays, delete]
frequency: medium
expected: |
  3 undefined false
  ["a",null,"c"]
  2
  ["a"] undefined
---

```js
const arr = ['a', 'b', 'c']

delete arr[1]
console.log(arr.length, arr[1], 1 in arr)
console.log(JSON.stringify(arr))

let visits = 0
arr.forEach(() => visits++)
console.log(visits)

arr.length = 1
console.log(JSON.stringify(arr), arr[2])
```

## Explanation

1. `delete arr[1]` removes the property `'1'` but doesn't shift elements or change `length`. It leaves a **hole**. Reading the hole gives `undefined`, but `1 in arr` is `false` because the index doesn't exist.
2. `JSON.stringify` writes holes (and `undefined` elements) as `null`.
3. `forEach`, `map`, `filter` and friends **skip** holes, so the callback runs only twice.
4. Setting `length` smaller truncates the array, deleting every element past the new length.

Rule to remember: use `splice(i, 1)` to remove an element; `delete` leaves a hole and keeps the length.
