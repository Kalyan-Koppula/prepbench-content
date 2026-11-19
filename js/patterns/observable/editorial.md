**Key insight:** an Observable is just a function that is called once per subscriber. All the real work is in `subscribe`, which wraps the user's observer in a **guarded** one that enforces the contract (nothing after `error`/`complete`/`unsubscribe`, teardown exactly once).

## Approach

1. Normalise the argument into an observer object.
2. Create the guarded observer with a `closed` flag. `next` forwards only while open. `error` and `complete` close, forward, then run the teardown.
3. Call the producer inside `try/catch`; send a thrown error to `guarded.error`. Store the returned teardown.
4. If the producer already closed the stream synchronously, the teardown arrived too late for step 2, so run it now.
5. `unsubscribe` closes and runs the teardown. `runTeardown` clears the stored function before calling it, which makes it idempotent.
6. `map`/`filter`: return `new Observable(observer => { const sub = this.subscribe({...}); return () => sub.unsubscribe() })`, catching errors from the user function and routing them to `observer.error`.

## Walkthrough

```js
const ticks = new Observable((observer) => {
  let n = 0
  const id = setInterval(() => observer.next(n++), 100)
  return () => clearInterval(id) // teardown
})
const sub = ticks.subscribe((n) => console.log(n))
setTimeout(() => sub.unsubscribe(), 350)
```

| Time | Event | Output |
| --- | --- | --- |
| 0 | subscribe: the producer runs, the interval starts | – |
| 100, 200, 300 | `next(0)`, `next(1)`, `next(2)` | 0, 1, 2 |
| 350 | unsubscribe: closed, teardown clears the interval | – |

Observables are **lazy** (nothing runs until `subscribe`) and **unicast** (each subscription runs the producer separately). After `error`, `complete` or `unsubscribe`, no more values are delivered and the teardown runs exactly once.

## Complexity

`O(1)` per emitted value.

## Edge cases to test

- Nothing runs before `subscribe`.
- Each subscriber gets its own producer run.
- Teardown runs on unsubscribe, complete and error, once.
- No values after `complete` or `error`.
- A function or an observer object can be passed to `subscribe`.

## Pitfalls

- Passing the raw user observer to the producer: nothing stops `next` after `complete`, and `subscribe(fn)` crashes on `observer.next`.
- Running the producer in the constructor makes the Observable eager and shared, which is a different type (closer to a Subject or a Promise).
- Missing the synchronous-complete case: `of(1, 2, 3)`-style sources call `complete()` before returning their teardown, so resources leak.
- Letting an exception from the `map` function escape into the producer, which may be inside a `setInterval` callback where nobody catches it.

## Follow-ups interviewers add

- **`Observable.from(promise | iterable)`, `of`, `interval`, `fromEvent(el, 'click')`.**
- **`take(n)`**, which must complete and unsubscribe from the source after `n` values.
- **`Subject`:** a multicast observable that is also an observer.
- **`switchMap`** for type-ahead search: cancel the previous inner subscription on every new value.
- **Compare with Promises and async iterators:** push vs pull, one value vs many, eager vs lazy, cancellable or not.

## In the interview

Compare with promises (one value, eager, not cancellable) and mention operators (`map`, `filter`, `switchMap`) as pure functions from observable to observable. RxJS is the production library.
