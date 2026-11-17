---
title: A hand-written iterable
difficulty: Medium
order: 6
tags: [iterables, iterators]
frequency: medium
expected: |
  1,2,3
  loop 1
  loop 2
  loop 3
  1 2
  10,20,30
---

```js
const range = {
  from: 1,
  to: 3,
  [Symbol.iterator]() {
    let cur = this.from
    const last = this.to
    return {
      next: () =>
        cur <= last ? { value: cur++, done: false } : { value: 'end', done: true },
    }
  },
}

console.log([...range].join(','))
for (const n of range) console.log('loop', n)

const [first, ...rest] = range
console.log(first, rest.length)
console.log(Array.from(range, (n) => n * 10).join(','))
```

## Explanation

1. Every consumer (spread, `for...of`, destructuring, `Array.from`) calls `range[Symbol.iterator]()` to get a **fresh** iterator, so the object can be iterated again and again. Each starts at 1.
2. Consumers stop as soon as they see `done: true` and **ignore** the `value` on that result, so `'end'` never shows up anywhere.
3. Destructuring takes `1` for `first` and collects the remaining `[2, 3]` into `rest`.
4. `Array.from` accepts a map function as its second argument: `10,20,30`.

Rule to remember: an iterable is an object with `[Symbol.iterator]()` returning `{ next }`; the value next to `done: true` is thrown away by every built-in consumer.
