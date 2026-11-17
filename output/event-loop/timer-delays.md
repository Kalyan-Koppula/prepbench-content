---
title: Timers sorted by delay
difficulty: Easy
order: 4
tags: [timers]
frequency: medium
expected: |
  e
  b
  d
  c
  a
---

```js
setTimeout(() => console.log('a'), 50)
setTimeout(() => console.log('b'), 0)
setTimeout(() => console.log('c'), 20)
setTimeout(() => console.log('d'), 0)

console.log('e')
```

## Explanation

1. All four timers are registered during the sync pass; `e` logs.
2. A timer becomes runnable when its delay has elapsed. Timers that become due at the same time run in the order they were created.
3. `b` and `d` (0 ms) are due first, in creation order: `b`, then `d`.
4. `c` (20 ms) comes next, then `a` (50 ms).

Rule to remember: timers run in order of *due time*, and ties go to whichever `setTimeout` was called first. Source order alone doesn't decide it.
