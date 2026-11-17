---
title: Array methods that mutate vs copy
difficulty: Medium
order: 5
tags: [arrays, references]
frequency: medium
expected: |
  true 1,2,3
  false 1,2,3
  3,2,1 1,2,3
  [2] 1,3
  1 2
---

```js
const nums = [3, 1, 2]

const sorted = nums.sort()
console.log(sorted === nums, nums.join(','))

const mapped = nums.map((n) => n * 2)
console.log(mapped === nums, nums.join(','))

const rev = nums.toReversed()
console.log(rev.join(','), nums.join(','))

const removed = nums.splice(1, 1)
console.log(JSON.stringify(removed), nums.join(','))

const sliced = nums.slice(0, 1)
console.log(sliced.join(','), nums.length)
```

## Explanation

1. `sort` sorts **in place** and returns the same array, so `sorted === nums` and `nums` is now `1,2,3`.
2. `map` always returns a new array and leaves the original alone.
3. `toReversed` (ES2023) is the copying version of `reverse`: a new reversed array, original unchanged. Its siblings are `toSorted`, `toSpliced` and `with`.
4. `splice(1, 1)` mutates: it removes one item at index 1 and returns the removed items as an array, `[2]`. `nums` is now `1,3`.
5. `slice` copies a range without mutating: `1`, and `nums` still has 2 items.

Rule to remember: `sort`, `reverse`, `splice`, `push`/`pop`/`shift`/`unshift` and `fill` mutate. `map`, `filter`, `slice`, `concat` and the `to*` methods return new arrays.
