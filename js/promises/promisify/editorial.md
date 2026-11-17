**Key insight:** the wrapper is a tiny adapter: it builds the Node callback that the original function expects, and that callback is wired to the `resolve`/`reject` of a fresh promise.

## Approach

1. Return a regular `function (...args)` so it receives the caller's `this`.
2. Inside, return `new Promise((resolve, reject) => fn.call(this, ...args, (err, value) => err ? reject(err) : resolve(value)))`.
3. Calling `fn` inside the executor gives two behaviours for free: a synchronous throw becomes a rejection, and repeated callback calls are ignored because a promise settles once.

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
