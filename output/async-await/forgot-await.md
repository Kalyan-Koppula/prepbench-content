---
title: Forgetting await
difficulty: Easy
order: 3
tags: [async-await, bugs]
frequency: high
expected: |
  object
  [object Promise]1
  6
---

```js
async function loadCount() {
  return 5
}

async function main() {
  const count = loadCount()
  console.log(typeof count)
  console.log(count + 1)

  const real = await loadCount()
  console.log(real + 1)
}

main()
```

## Explanation

1. Without `await`, `count` is the promise returned by `loadCount()`, not `5`. `typeof count` is `'object'`.
2. `count + 1`: `+` with an object converts it to a primitive. A promise has no useful `valueOf`, so it becomes the string `'[object Promise]'`, and `+ 1` concatenates: `[object Promise]1`.
3. With `await`, `real` is `5`, so `real + 1` is `6`.

Rule to remember: if you see `[object Promise]` in output, someone forgot an `await`.
