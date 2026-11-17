---
title: sort() without a comparator
difficulty: Easy
order: 6
tags: [arrays, sorting]
frequency: high
expected: |
  1,10,100,25,9
  1,9,10,25,100
  B,C,a,b
---

```js
const nums = [10, 9, 1, 100, 25]
console.log(nums.sort().join(','))

console.log([10, 9, 1, 100, 25].sort((a, b) => a - b).join(','))

console.log(['b', 'a', 'C', 'B'].sort().join(','))
```

## Explanation

1. With no comparator, `sort` converts every element to a **string** and compares UTF-16 code units. As strings, `'1' < '10' < '100' < '25' < '9'`, because comparison goes character by character and `'2' < '9'`.
2. `(a, b) => a - b` compares numerically: negative means `a` first, positive means `b` first.
3. Strings compare by code unit too, and every uppercase letter (`A`–`Z`, 65–90) comes before every lowercase one (97–122). For human ordering use `a.localeCompare(b)`.

Rule to remember: always pass a comparator to sort numbers. The default sort is lexicographic, even for numbers.
