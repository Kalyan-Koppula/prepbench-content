**Key insight:** the wrapper is a tiny adapter: it builds the Node callback that the original function expects, and that callback is wired to the `resolve`/`reject` of a fresh promise.

## Approach

1. Return a regular `function (...args)` so it receives the caller's `this`.
2. Inside, return `new Promise((resolve, reject) => fn.call(this, ...args, (err, value) => err ? reject(err) : resolve(value)))`.
3. Calling `fn` inside the executor gives two behaviours for free: a synchronous throw becomes a rejection, and repeated callback calls are ignored because a promise settles once.

## Walkthrough

Wrapping Node's `fs.readFile`:

```js
const readFile = promisify(fs.readFile)
await readFile('notes.txt', 'utf8')
```

| Step | What happens |
| --- | --- |
| 1 | The wrapper returns a new promise |
| 2 | It calls `fs.readFile('notes.txt', 'utf8', callback)`, appending the callback |
| 3a | Node calls `callback(null, contents)` → resolve with `contents` |
| 3b | Node calls `callback(err)` → reject with `err` |
| 4 | If `fs.readFile` throws synchronously, the executor's throw rejects the promise |

`this` is forwarded with `fn.call(this, …)`, so promisified methods (`promisify(obj.method).call(obj)`) still work.

## Complexity

`O(1)` overhead per call.

## Edge cases to test

- Success and error callbacks.
- A falsy-but-not-null error value (only `null`/`undefined` should mean success in strict versions).
- A synchronous throw from `fn`.
- Several arguments before the callback.
- `this` forwarding.

## Pitfalls

- Returning an arrow function from `promisify`: `this` becomes whatever it was where `promisify` was called.
- Calling `fn(...args, cb)` instead of `fn.call(this, ...args, cb)` breaks methods that rely on their object.
- Calling `fn` outside the executor; a synchronous throw then escapes as an exception instead of a rejected promise.
- Checking `err !== null` instead of truthiness; many callbacks pass `undefined` on success.

## Follow-ups interviewers add

- **Multiple success values:** some callbacks pass `(err, a, b)`; resolve with an array or an object (Node's `fs.read` uses `util.promisify.custom` for this).
- **`promisify.custom`:** let a function provide its own promise version via a symbol.
- **The reverse:** `callbackify(asyncFn)`, including what to pass as the error when a promise rejects with a falsy value.
- **`promisifyAll(obj)`:** add `fooAsync` for every method.

## In the interview

Explain the error-first callback convention, then mention edge variations: callbacks with several result values, and the `util.promisify.custom` symbol Node uses for functions with non-standard callbacks.
