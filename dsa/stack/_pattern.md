---
title: Stack & Monotonic Stack
order: 4
summary: Last in, first out — match nested things, and find each element's next greater/smaller in O(n).
---

## Recognise it

- Nested or paired structure: brackets, tags, expressions, undo history.
- "Process the most recent unresolved item first" — collisions, backspaces, evaluating operators.
- "Next / previous **greater** or **smaller** element", "how many days until…", "span", "nearest taller bar".
- Sum or max over all subarrays where each element's contribution depends on how far it stays the min/max.

## Templates

```ts
// Matching pairs
const stack: string[] = []
for (const ch of s) {
  if (isOpen(ch)) stack.push(ch)
  else if (stack.pop() !== partner(ch)) return false
}
return stack.length === 0
```

```ts
// Monotonic stack: next greater element to the right
const next = new Array(n).fill(-1)
const stack: number[] = [] // indices; values decreasing bottom -> top
for (let i = 0; i < n; i++) {
  while (stack.length && nums[stack[stack.length - 1]] < nums[i]) {
    next[stack.pop()!] = nums[i] // i resolves everything smaller on top
  }
  stack.push(i)
}
```

## Interview notes

- Store **indices**, not values — you usually need distances or widths, and values are one lookup away.
- Pick the direction from the question: next greater → pop while top `<` current (decreasing stack); next smaller → pop while top `>` current (increasing stack).
- Each index is pushed and popped once, so the nested `while` is still `O(n)` overall — say this out loud.
- Circular arrays: loop `2n` times using `i % n`, pushing only in the first pass.
- Contribution technique: element `i` is the minimum of `left[i] * right[i]` subarrays, where `left`/`right` are distances to the previous/next smaller element.
- Design problems (min stack, stock span) often store extra info per entry — a running min, an accumulated count.

## Pitfalls

- Popping an empty stack: `[].pop()` is `undefined`, not an error, so bugs hide.
- Duplicates: use `<` on one side and `<=` on the other, or equal values get counted twice (or never).
- Forgetting the leftovers — whatever remains on the stack at the end has no next greater/smaller; handle it or flush with a sentinel.
- `shift()`/`unshift()` are `O(n)` in JS; use `push`/`pop` on the end.
