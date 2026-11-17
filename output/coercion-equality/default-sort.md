---
title: Sorting numbers without a comparator
difficulty: Medium
order: 15
tags: [coercion, arrays]
frequency: high
expected: |
  1,10,100,9
  B,a,b
  3,20,100
---

```js
console.log([10, 9, 1, 100].sort().join(','))
console.log(['b', 'a', 'B'].sort().join(','))
console.log([3, 20, 100].sort((a, b) => a - b).join(','))
```

## Explanation

Without a comparator, `sort` converts every element to a **string** and orders them by UTF-16 code units.

1. As strings, `'1' < '10' < '100' < '9'`, because comparison goes character by character and `'1'` sorts before `'9'`.
2. Uppercase letters have smaller code units than lowercase (`'B'` is 66, `'a'` is 97), so `B` comes first.
3. A comparator returning `a - b` compares numerically: negative means `a` first.

Rule to remember: always pass `(a, b) => a - b` to sort numbers; the default is string order.
