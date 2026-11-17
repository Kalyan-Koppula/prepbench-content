---
title: Observable
difficulty: Hard
order: 2
tags: [classes, streams, closures, cleanup]
frequency: medium
exports: [Observable]
hints:
  - "In `subscribe`, wrap the user's observer in a guarded observer with a `closed` flag; hand the guarded one to the producer."
  - The teardown may arrive after the producer has already completed synchronously, so check again once the producer returns.
  - "`map` and `filter` return a new Observable whose producer subscribes to the source and forwards transformed values."
---

Implement a minimal `Observable`, the push-based stream type behind RxJS and many event APIs.

```js
const ticks = new Observable((observer) => {
  let n = 0
  const id = setInterval(() => observer.next(n++), 1000)
  return () => clearInterval(id) // teardown
})

const sub = ticks
  .filter((n) => n % 2 === 0)
  .map((n) => n * 10)
  .subscribe({ next: (v) => console.log(v), complete: () => console.log('done') })
// logs 0, 20, 40, ... until:
sub.unsubscribe() // clears the interval
```

## Notes

- `new Observable(producer)` stores `producer(observer)`. Nothing runs until `subscribe`, and **every** `subscribe` calls the producer again (each subscriber gets its own run).
- The producer may return a **teardown** function.
- `subscribe(observer)` takes an object with optional `next(value)`, `error(err)` and `complete()`, or just a function used as `next`. It returns `{ unsubscribe() }`.
- The contract the observer can rely on:
  - after `error` or `complete`, nothing else is delivered (later `next`/`error`/`complete` calls are ignored);
  - if the producer throws while subscribing, the error goes to `error`;
  - the teardown runs **exactly once**: on `unsubscribe()`, or right after `error`/`complete` (even when the producer completes synchronously before returning its teardown);
  - after `unsubscribe()`, nothing else is delivered.
- `map(fn)` and `filter(predicate)` return new Observables. If `fn` or `predicate` throws, the error is sent to `error` and the stream stops. Unsubscribing from the result unsubscribes from the source.
