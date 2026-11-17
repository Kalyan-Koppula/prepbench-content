---
title: JavaScript Core
order: 21
module: javascript
summary: Types and coercion, equality, scope and closures, this, prototypes and classes, modules, iterators and generators, collections, Proxy, numbers, and the newer standard library.
---

## Why does `typeof null` return `"object"`?

It is a bug from the first implementation, where values carried a type tag and `null` shared the object tag. Fixing it would break existing sites, so it stays. Test for null with `x === null`, and for "a real object" with `x !== null && typeof x === 'object'`.

## Which values are falsy, and which surprising values are truthy?

Falsy: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined` and `NaN`. Everything else is truthy, including `[]`, `{}`, `"0"`, `"false"` and `new Boolean(false)`. That's why `if (arr)` doesn't check emptiness; use `arr.length`.

## When does `==` give a different answer than `===`?

`===` never coerces; `==` does. With `==`, `null` and `undefined` equal each other and nothing else, a string compared with a number becomes a number, a boolean becomes a number first (so `'1' == true`), and an object is converted to a primitive. The one idiom worth keeping is `x == null` to test for both null and undefined.

## What happens when you use `+` with an object operand?

Both sides go through ToPrimitive, which calls `valueOf` and then `toString` (or `Symbol.toPrimitive` if defined). If either result is a string, `+` concatenates; otherwise it adds numerically. So `[] + {}` is `"[object Object]"` and `[1] + [2]` is `"12"`, while `-`, `*` and `/` always convert to numbers.

## How do `===`, `Object.is` and SameValueZero differ?

They disagree only on `NaN` and signed zero. `===` says `NaN !== NaN` and `0 === -0`; `Object.is` says the opposite on both. SameValueZero, used by `includes`, `Map` keys and `Set`, treats `NaN` as equal to itself and `+0` equal to `-0`, which is why `[NaN].includes(NaN)` is true but `[NaN].indexOf(NaN)` is `-1`.

## Why is `0.1 + 0.2 !== 0.3`?

Numbers are IEEE 754 doubles, and 0.1 and 0.2 have no exact binary representation, so the sum is `0.30000000000000004`. Compare with a tolerance (`Math.abs(a - b) < Number.EPSILON` for values near 1), and represent money as integer minor units or use a decimal library.

## When do you need `BigInt`?

When integers exceed `Number.MAX_SAFE_INTEGER` (2^53 − 1); beyond that, adjacent integers collapse (`2 ** 53 + 1 === 2 ** 53`). BigInts (`123n`) are arbitrary precision but can't be mixed with numbers in arithmetic, have no fractional part, and `JSON.stringify` throws on them. For 64-bit IDs from an API, keeping them as strings is usually simpler.

## Why does `['1', '2', '3'].map(parseInt)` return `[1, NaN, NaN]`?

`map` passes `(value, index)`, and `parseInt` treats its second argument as the radix. Radix 0 means "default", so `'1'` parses; radix 1 is invalid, so `NaN`; `'3'` isn't a digit in base 2, so `NaN`. Write `.map(Number)` or `.map((s) => parseInt(s, 10))`.

## Why does `[10, 9, 1].sort()` return `[1, 10, 9]`?

The default comparator converts elements to strings and compares UTF-16 code units, so `"10"` sorts before `"9"`. Pass `(a, b) => a - b` for numbers. `sort` also mutates in place; `toSorted`, `toReversed`, `toSpliced` and `with` (ES2023) return copies instead.

## What actually gets hoisted for `var`, `let`, `const`, functions and classes?

All declarations are registered when their scope is created. `var` is initialised to `undefined`, function declarations are initialised with the whole function, and `let`, `const` and `class` stay uninitialised until the declaration line runs. Function expressions assigned to a variable follow the variable's rules, not the function's.

## What is the temporal dead zone, and why does it exist?

The span between entering a scope and reaching a `let`, `const` or `class` declaration, during which touching the binding throws `ReferenceError`. Even `typeof x` throws there, unlike for an undeclared name. It exists so that use-before-initialisation is a loud error rather than a silent `undefined`, and so `const` never has an observable "unset" value.

## Why does a `for (var i …)` loop with `setTimeout` log the same number every time, and why does `let` fix it?

`var` creates one function-scoped binding shared by every iteration, so every callback reads its final value. `let` in a `for` head creates a fresh binding per iteration, copying the previous value forward, so each closure captures its own `i`.

## How can a closure keep memory alive longer than you expect?

A closure keeps its captured variables reachable for as long as the function itself is reachable, and engines typically share one context object between all closures created in the same scope, so a large value captured by one closure can be retained by a sibling that never uses it. Long-lived listeners, timers and caches holding such closures are the usual leaks.

## How is `this` determined for a normal function call?

By the call site, in precedence order: `new` binds the fresh object; `call`, `apply` or `bind` set it explicitly; a method call `obj.fn()` binds `obj`; otherwise it's `undefined` in strict mode (or `globalThis` in sloppy mode). Arrow functions ignore all of this and use the `this` of their enclosing scope.

## Why does passing `obj.method` as a callback lose `this`?

`obj.method` evaluates to a plain function reference; the link to `obj` exists only in the call expression `obj.method()`. When something else later calls it as `fn()`, the default binding applies. Fix with `obj.method.bind(obj)`, a wrapper arrow `() => obj.method()`, or a class field arrow function.

## Why shouldn't you use an arrow function as an object method or a constructor?

Arrows have no own `this`, `arguments`, `prototype` or `[[Construct]]`. As an object-literal method, `this` is whatever it was where the literal was written (often `undefined` in a module), not the object; and `new` on an arrow throws `TypeError`. They shine as callbacks precisely because they capture the outer `this`.

## Can you change `this` on a function that has already been bound?

No. `bind` returns a bound function whose `this` is fixed; calling `bind`, `call` or `apply` on it again can't override it, though extra arguments are still prepended. The one exception is `new`, which ignores the bound `this` and constructs a fresh object.

## How does property lookup walk the prototype chain, and what happens on assignment?

A read checks the object's own properties, then its `[[Prototype]]`, and so on up to `Object.prototype` and finally `null`, returning `undefined` if nothing matches. An assignment normally creates or updates an own property and shadows the inherited one, unless the inherited property is a setter or is non-writable.

## What does the `new` operator do, step by step?

It creates an empty object whose `[[Prototype]]` is the constructor's `prototype`, calls the constructor with `this` set to that object, and returns it, unless the constructor explicitly returns a different object, which then wins. Returning a primitive is ignored.

## What's the difference between a function's `prototype` property and an object's `[[Prototype]]`?

`prototype` is an ordinary property on constructor functions; it becomes the `[[Prototype]]` of instances created with `new`. `[[Prototype]]` is the internal link every object has, read with `Object.getPrototypeOf` (or the legacy `__proto__` accessor). So `Object.getPrototypeOf(new Foo()) === Foo.prototype`.

## Are JavaScript classes just syntactic sugar over prototypes?

Mostly, but not entirely. Class bodies are always strict, classes throw if called without `new`, they sit in the TDZ until defined, their methods are non-enumerable, derived constructors must call `super()` before touching `this`, and `#private` fields have no prototype-based equivalent.

## How do `#private` fields differ from an underscore convention or closure-based privacy?

They are enforced by the language: the field doesn't exist as a property, so `Object.keys`, `JSON.stringify` and Proxies can't see it, and access from outside the class body is a syntax error. Unlike closure privacy, methods live on the prototype and other instances of the same class can read each other's fields. `#field in obj` is a clean brand check.

## How do ES modules differ from CommonJS?

ESM `import`/`export` are static, resolved before any code runs, which enables tree-shaking and early errors; CommonJS `require` is a synchronous runtime call returning `module.exports`. ESM exports are live bindings rather than copied values, modules are strict by default, loading is asynchronous, and top-level `await` is allowed.

## What does it mean that ES module exports are live bindings?

An importer sees the exporting module's variable itself, not a snapshot: if the module later reassigns `export let count`, every importer reads the new value. Importers can't assign to the binding (it throws), only the owning module can. In CommonJS you get whatever value was on `module.exports` when you read it.

## What makes an object iterable?

A `[Symbol.iterator]()` method that returns an iterator: an object whose `next()` returns `{ value, done }`. Anything iterable works with `for...of`, spread, array destructuring, `Array.from`, `new Map(...)` and `Promise.all`. Plain objects aren't iterable; use `Object.entries(obj)`.

## What's the difference between `for...in` and `for...of`?

`for...in` iterates enumerable string keys, including inherited ones, in property order; it's meant for objects and is a trap on arrays. `for...of` iterates values from an iterable's iterator, so it works on arrays, strings, Maps, Sets and generators but not plain objects.

## When would you reach for a generator function?

When you want an iterator without writing the `next()` state machine by hand: lazy or infinite sequences, tree traversal, pagination, or pipelines that produce values on demand. `yield` pauses the function; `next(value)` resumes it and passes a value in. `async function*` plus `for await...of` does the same for asynchronous sources.

## What happens to a generator's `finally` block when a `for...of` loop breaks early?

The loop calls the iterator's `return()` method on `break`, `return` or a thrown error, which resumes the generator as if a `return` happened at the paused `yield`, so its `finally` blocks run. That's how generators release resources such as locks or open handles when the consumer stops early.

## Why do Symbols exist?

To create property keys that can't collide with anyone else's, and to expose language hooks: well-known symbols like `Symbol.iterator`, `Symbol.asyncIterator`, `Symbol.toPrimitive` and `Symbol.hasInstance` let objects customise built-in behaviour. Symbol keys are skipped by `for...in`, `Object.keys` and `JSON.stringify`. `Symbol.for('x')` returns a shared, registry-wide symbol instead of a unique one.

## When would you choose a `Map` over a plain object?

When keys aren't strings (objects, numbers kept as numbers), when keys come from user input (no prototype collisions with `__proto__` or `constructor`), when you need `size` and guaranteed insertion-order iteration, or when entries are added and removed frequently. Plain objects remain the right choice for fixed-shape records and anything you serialise to JSON.

## Why can't you iterate a `WeakMap` or read its size?

Its keys are held weakly, so an entry disappears whenever the garbage collector reclaims the key, at a time the program can't observe. Exposing iteration or `size` would make GC timing visible. Keys must be objects or non-registered symbols. Typical uses are per-object metadata and caches keyed by DOM nodes or class instances.

## When are `WeakRef` and `FinalizationRegistry` appropriate?

Rarely: for caches of large, re-creatable objects where losing an entry is acceptable. `deref()` may return `undefined` at any point, and finalisation callbacks may run late or never, so they must not drive program correctness or release critical resources. Prefer `WeakMap` or explicit cleanup first.

## What do the new `Set` methods give you, and what do they accept?

`union`, `intersection`, `difference`, `symmetricDifference`, `isSubsetOf`, `isSupersetOf` and `isDisjointFrom` (Baseline 2024). The operations return new Sets without mutating the receiver. The argument must be set-like (have `size`, `has` and `keys`), so a Map works but a plain array throws; wrap it with `new Set(arr)`.

## What does `Object.groupBy` return, and when would you use `Map.groupBy` instead?

`Object.groupBy(items, fn)` returns a null-prototype object whose keys are the callback's results (coerced to strings or symbols) and whose values are arrays of items. `Map.groupBy` returns a `Map`, so keys can be any value, including objects, without coercion. Both are ES2024.

## Why use `structuredClone` instead of `JSON.parse(JSON.stringify(x))`?

It handles what JSON mangles: `Date`, `Map`, `Set`, `RegExp`, typed arrays, `BigInt`, `undefined` values and circular references. It still has limits: functions and DOM nodes throw a `DataCloneError`, class instances come back as plain objects, and symbol-keyed properties are dropped. Spread and `Object.assign` copy only one level deep.

## What does `Array.prototype.at` add over bracket indexing?

Negative indices count from the end, so `arr.at(-1)` is the last element without `arr[arr.length - 1]`. It exists on arrays, strings and typed arrays. Brackets can't do this because `arr[-1]` is simply a property named `"-1"`.

## Why can `count || 10` be a bug where `count ?? 10` isn't?

`||` falls back on any falsy value, so a legitimate `0` or `''` gets replaced by the default. `??` falls back only on `null` or `undefined`. Mixing `??` with `||` or `&&` without parentheses is a syntax error, and `??=` assigns only when the target is nullish.

## How far does optional chaining short-circuit?

If the value before `?.` is `null` or `undefined`, the whole rest of that chain is skipped and evaluates to `undefined`, so `a?.b.c.d()` doesn't throw when `a` is nullish, but does throw if `a.b` is nullish. It also works for calls (`fn?.()`) and dynamic keys (`obj?.[key]`). It can't be used on the left side of an assignment.

## When would you use a getter or setter instead of a plain property?

For derived values (`get fullName()`), validation or normalisation on write, lazy initialisation, or keeping an API stable while the backing storage changes. Watch that getters run silently on every read, and that class accessors live on the prototype, so `JSON.stringify` and spread don't include them.

## What can a `Proxy` intercept, and why pair its traps with `Reflect`?

Fundamental operations: `get`, `set`, `has`, `deleteProperty`, `ownKeys`, `defineProperty`, `apply`, `construct` and more. `Reflect` provides the default behaviour for each trap with matching signatures, so a trap can do its extra work and then `return Reflect.get(target, key, receiver)`, which keeps inherited getters' `this` correct. Vue 3 reactivity and validation layers are built this way.

## Why does wrapping a `Map` or a class with `#private` fields in a Proxy throw?

Their methods rely on internal slots or private fields that exist on the target, not the proxy. When `proxy.get('k')` runs, `this` is the proxy, so `Map.prototype.get` throws "incompatible receiver" and `this.#x` throws `TypeError`. The usual fix is a `get` trap that binds functions to the target.

## What does strict mode change?

Assigning to an undeclared variable throws instead of creating a global, plain function calls get `this === undefined`, writes to read-only properties throw instead of failing silently, `with` and duplicate parameter names are syntax errors, and `arguments` no longer aliases parameters. Modules and class bodies are strict automatically.

## Which built-in error types should you recognise, and what usually throws each?

`TypeError`: wrong kind of value, such as calling a non-function or reading a property of `undefined`. `ReferenceError`: an undeclared name or a TDZ access. `SyntaxError`: unparseable code or bad `JSON.parse` input. `RangeError`: an invalid array length or out-of-range argument, and in V8 a blown call stack. `AggregateError` bundles several, as from `Promise.any`.

## Does a circular reference between two objects cause a memory leak?

Not in JavaScript. Collectors are tracing (mark-and-sweep, generational in practice): anything not reachable from the roots, such as globals, the stack and live closures, is reclaimed, cycles included. Real leaks are reachability bugs: forgotten listeners or timers, unbounded caches, detached DOM nodes still referenced from JS.

## What does `Object.freeze` guarantee, and what doesn't it?

It makes the object's own properties non-writable and non-configurable and stops new ones being added, so writes fail silently, or throw in strict mode. It's shallow: nested objects stay mutable unless you freeze them recursively. `const` is unrelated; it only stops the binding being reassigned.
