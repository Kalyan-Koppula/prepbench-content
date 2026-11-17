---
title: Getters, setters and copies
difficulty: Hard
order: 11
tags: [objects, getters, spread]
frequency: low
expected: |
  68
  100
  212 32
  3
  {"celsius":0,"fahrenheit":32}
---

```js
let reads = 0
const temp = {
  celsius: 20,
  get fahrenheit() {
    reads++
    return (this.celsius * 9) / 5 + 32
  },
  set fahrenheit(f) {
    this.celsius = ((f - 32) * 5) / 9
  },
}

console.log(temp.fahrenheit)
temp.fahrenheit = 212
console.log(temp.celsius)

const copy = { ...temp }
temp.celsius = 0
console.log(copy.fahrenheit, temp.fahrenheit)
console.log(reads)
console.log(JSON.stringify(temp))
```

## Explanation

1. Reading `fahrenheit` calls the getter (read #1): 20 °C is `68`.
2. Assigning calls the setter, which sets `celsius` to `100`.
3. Spread **reads** each property, which calls the getter (read #2, giving 212), and stores the *result* as a plain data property on `copy`. The copy has no getter.
4. After `temp.celsius = 0`, `copy.fahrenheit` is still the frozen-in-time `212`, while `temp.fahrenheit` recomputes (read #3): `32`.
5. `reads` is `3` at that point.
6. `JSON.stringify` also reads through the getter (read #4) and outputs the current values.

Rule to remember: spread, `Object.assign` and `JSON.stringify` call getters and copy the values; they don't copy the accessor. Use `Object.getOwnPropertyDescriptors` to copy getters themselves.
