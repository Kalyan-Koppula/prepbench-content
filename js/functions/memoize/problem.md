---
title: Memoize
difficulty: Medium
order: 6
tags: [closures, caching, map]
frequency: high
exports: [memoize]
hints:
  - A `Map` can use any value as a key, including objects (by identity) and `NaN`.
  - Check membership with `has`, not by reading the value; a cached `undefined` is still a hit.
  - The resolver is called the same way as `fn` (same `this`, same arguments) and its return value is the key.
---

Implement `memoize(fn, resolver?)`. The returned function caches `fn`'s results so a repeated call with the same key returns the cached value without calling `fn`.

- **Default key:** the first argument. Extra arguments are passed to `fn` but don't affect the key.
- **Custom key:** if `resolver` is given, the key is `resolver.apply(this, args)`.
- **Cache access:** the returned function has a `cache` property: the `Map` (key → result) it uses. Code outside can read it, pre-fill it with `set`, or evict with `delete`/`clear`, and the memoized function must respect those changes.

```js
const slowSquare = (n) => { console.log('computing', n); return n * n }
const square = memoize(slowSquare)
square(4)          // logs "computing 4", returns 16
square(4)          // 16, no log
square.cache.get(4) // 16

const area = memoize((w, h) => w * h, (w, h) => `${w}x${h}`)
area(2, 3) // 6
area(2, 5) // 10 (different key)
```

## Notes

- `fn` is called with the same `this` and arguments as the memoized function.
- Results of `undefined` are cached like any other result.
- If `fn` throws, nothing is cached and the error propagates.
- Objects as keys are compared by identity, not by content.
