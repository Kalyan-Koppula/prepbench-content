---
title: MyAwaited
difficulty: Medium
order: 10
tags: [infer, recursion, promises]
frequency: high
hints:
  - "`await` doesn't check for `Promise` specifically; anything with a `then` method is awaited. Match on that shape."
  - A promise can resolve to another promise, so unwrap recursively.
  - Union members should each be unwrapped on their own.
---

Implement `MyAwaited<T>` without using the built-in `Awaited`. It's the type you get from `await`ing a value of type `T`:

```ts
type A = MyAwaited<Promise<string>>              // string
type B = MyAwaited<Promise<Promise<number[]>>>   // number[]
type C = MyAwaited<number>                       // number (not a promise: unchanged)
```

- Unwrap nested promises all the way down.
- Any *thenable* counts, not just `Promise`: an object with a `then(onfulfilled)` method whose callback receives the resolved value.
- Unions unwrap member by member: `Promise<string> | null` gives `string | null`.
- Only the awaited value is unwrapped; promises nested inside object properties stay as they are.
