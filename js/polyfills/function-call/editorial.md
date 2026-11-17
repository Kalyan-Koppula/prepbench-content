**Key insight:** JavaScript sets `this` from the call site. If you put the function on the context object and call it as `ctx[key](...args)`, `this` is `ctx`; that is all `call` needs.

## Approach

1. `this` inside `myCall` is the function being called; check that it's a function.
2. Normalize the context: `null`/`undefined` → `globalThis`, anything else → `Object(thisArg)` (boxes primitives, returns objects unchanged).
3. Create a fresh `Symbol` and define the function under it, non-enumerable, so it can't collide with or show up as a real key.
4. Call `ctx[key](...args)` and return the result; delete the key in `finally` so a throw still cleans up.

## Pitfalls

- A string key like `ctx.fn = this`: overwrites and then deletes a real `fn` property, and `Object.keys(this)` inside the function shows it.
- Forgetting `finally`: a throwing function leaves the temporary key behind.
- `thisArg || globalThis`: turns `0`, `''` and `false` into the global object.
- Assigning a property to a primitive (`'abc'[key] = fn`) silently does nothing; box it first.

## Follow-ups interviewers add

- **Frozen or sealed objects:** `Object.defineProperty` throws on them, but the real `call` works. Can a polyfill handle that at all? (Not without `apply`/`Reflect`; that's the honest answer.)
- **Strict mode:** natively, strict functions receive primitives and `null` unboxed. Why can't this approach reproduce that?
- **`apply` and `bind`:** build them on the same trick, or on top of `myCall`.
- **Spread-free ES3 version:** without `...args`, people used `eval` to build the call; why is that a bad idea?
