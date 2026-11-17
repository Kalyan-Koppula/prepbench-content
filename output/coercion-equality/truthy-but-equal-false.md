---
title: Truthy values that == false
difficulty: Medium
order: 2
tags: [truthiness, equality, coercion]
frequency: high
expected: |
  "0" true true
  "" false true
  [] true true
  [0] true true
  "false" true false
  2 true false
---

```js
const values = ['0', '', [], [0], 'false', 2]

for (const v of values) {
  console.log(JSON.stringify(v), Boolean(v), v == false)
}
```

## Explanation

Truthiness (`Boolean(v)`, `if (v)`) and `v == false` follow **different** rules.

- Truthiness: only `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined` and `NaN` are falsy. Every non-empty string and every object is truthy.
- `v == false`: the boolean becomes `0`, then `v` is converted toward a number.

Row by row:

1. `'0'`: non-empty, so truthy; `'0'` → `0`, so `== false`.
2. `''`: falsy; `''` → `0`, so `== false`.
3. `[]`: an object, truthy; `[]` → `''` → `0`, so `== false`.
4. `[0]`: truthy; `[0]` → `'0'` → `0`, so `== false`.
5. `'false'`: truthy; `'false'` → `NaN`, not equal to `0`.
6. `2`: truthy; `2 != 0`.

Rule to remember: never compare with `== true`/`== false`; test truthiness directly or use `===`.
