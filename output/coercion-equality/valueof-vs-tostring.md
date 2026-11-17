---
title: valueOf or toString first?
difficulty: Hard
order: 11
tags: [to-primitive, coercion]
frequency: medium
expected: |
  valueOf
  43
  toString
  price
  valueOf
  true
  toString
  valueOf
  price true
---

```js
const price = {
  valueOf() {
    console.log('valueOf')
    return 42
  },
  toString() {
    console.log('toString')
    return 'price'
  },
}

console.log(price + 1)
console.log(`${price}`)
console.log(price > 41)
console.log(String(price), price == 42)
```

## Explanation

Converting an object to a primitive takes a **hint**. With the `'string'` hint, `toString` is tried first; with `'number'` or `'default'`, `valueOf` is tried first. The first one that returns a primitive wins, so the other isn't called.

1. `price + 1`: `+` uses the default hint → `valueOf` logs, returns `42`, and the sum is `43`.
2. A template literal uses the string hint → `toString` logs, giving `price`.
3. `>` uses the number hint → `valueOf` logs, `42 > 41` is `true`.
4. Arguments are evaluated before `console.log` runs: `String(price)` (string hint) logs `toString`, then `price == 42` (default hint) logs `valueOf`. Finally the line itself prints `price true`.

Rule to remember: string contexts (template literals, `String()`, property keys) call `toString` first; everything else, including `+` and `==`, calls `valueOf` first.
