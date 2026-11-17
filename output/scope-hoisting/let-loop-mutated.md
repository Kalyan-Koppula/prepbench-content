---
title: Mutating the counter inside a let loop
difficulty: Hard
order: 7
tags: [closures, let-const, loops]
frequency: low
expected: |
  1,3
---

```js
const readers = []

for (let i = 0; i < 4; i++) {
  readers.push(() => i)
  i++
}

console.log(readers.map((read) => read()).join(','))
```

## Explanation

A `for (let …)` loop creates a fresh `i` for every iteration. Each new binding starts as a **copy** of the previous one, then the update expression (`i++` in the header) runs on the new copy.

1. Iteration 1: `i` is `0`. The arrow captures this iteration's binding. The body's `i++` changes that same binding to `1`.
2. Before iteration 2, the loop copies `1` into a new binding and the header's `i++` makes it `2`. `2 < 4`, so the body runs: capture, then `i++` makes it `3`.
3. Next copy is `3`, the header makes it `4`, and `4 < 4` is false. The loop ends.

The first closure sees its binding's final value `1`; the second sees `3`. Output `1,3`.

Rule to remember: `let` gives each iteration its own binding, but the closure still captures a variable, so changes made later in that same iteration are visible.
