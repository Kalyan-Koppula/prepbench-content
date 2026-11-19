---
title: Closures and Scope
order: 2
summary: Lexical scope, hoisting and the TDZ, the var-in-loop trap, the module pattern, and what closures keep alive.
---

A closure is a function together with the scope it was created in. Interviewers use closures to check three things at once: whether you understand how variable lookup works, whether you can predict the output of the classic `var` loop, and whether you know what a long-lived function keeps in memory. This article builds the mental model first, then applies it to every pattern you are likely to be asked about.

## Why closures exist

JavaScript functions are values. You can return them, store them in objects, pass them to `setTimeout` or `addEventListener`, and call them long after the code that created them has finished. That raises a question: when such a function runs later and mentions a variable, which variable does it mean?

JavaScript's answer is **lexical scope**: the variable that was visible where the function was **written**. To make that possible, a function keeps a reference to the scope it was created in. That pairing, the function plus its captured scope, is the closure. Every JavaScript function is a closure in this sense; the term only becomes interesting when the function outlives the scope it came from.

## The mental model: environments and the scope chain

The specification describes scopes as **environment records**: tables that map names to values. Each one has a pointer to its parent (the "outer" environment). Looking up a name means checking the current environment, then its parent, and so on, up to the global environment. If the name isn't found anywhere, you get a `ReferenceError`.

```js
const x = 'global'

function outer() {
  const x = 'outer'
  return function inner() {
    return x
  }
}

const fn = outer()
fn() // 'outer', even though fn is called from the global scope
```

What happens, step by step:

| Step | What exists |
| --- | --- |
| Script starts | Global environment: `x = 'global'`, `outer`, `fn` (uninitialised) |
| `outer()` runs | New environment E1: `x = 'outer'`, parent = global |
| `inner` is created | The function object stores a reference to E1 |
| `outer` returns | E1 would normally be discarded, but `inner` still references it, so it stays alive |
| `fn()` runs | New environment E2 for this call, parent = **E1** (from the function, not from the caller) |
| Lookup of `x` | Not in E2, found in E1: `'outer'` |

Two points to take away:

1. The parent of a call's environment comes from **where the function was defined**, stored on the function object. Where it is called from doesn't matter.
2. An environment lives as long as something references it. Returning `inner` keeps E1 alive. That is all a closure is.

### Kinds of scope

| Scope | Created by |
| --- | --- |
| Global | A classic (non-module) script. `var` and function declarations here also become properties of `globalThis`. |
| Module | Each ES module file. Top-level bindings are private to the module. |
| Function | Every function call. |
| Block | `{ }`, `if`, `for`, `while`, `try`, `switch`, for `let`, `const` and `class`. |

`var` ignores blocks: it belongs to the nearest function (or the global scope). `let`, `const` and `class` belong to the nearest block. Most of the surprises in this topic come from that one difference.

## Hoisting and the temporal dead zone

Before any code in a scope runs, the engine creates bindings for every declaration in it. That is "hoisting": the binding exists from the very start of the scope. The declarations differ in what the binding holds before its line runs.

| Declaration | Scope | Before its line runs |
| --- | --- | --- |
| `var` | Function | `undefined` |
| `function` declaration | Function or block | The complete function |
| `let`, `const` | Block | Uninitialised: any access throws |
| `class` | Block | Uninitialised: any access throws |
| `import` | Module | Bound before any module code runs |

The span between entering the scope and reaching the declaration is the **temporal dead zone** (TDZ). The binding exists (it shadows outer variables of the same name) but can't be read or written.

```js
console.log(a) // undefined
var a = 1

console.log(b) // ReferenceError: Cannot access 'b' before initialization
let b = 2

typeof c // ReferenceError: typeof is not safe in the TDZ
let c = 3

hello() // works: function declarations are hoisted with their body
function hello() {}

greet() // TypeError: greet is not a function (the var is undefined)
var greet = function () {}
```

The TDZ is about **time**, not position in the source. Code that appears earlier in the file may run later:

```js
function readLater() {
  return value // fine if called after the declaration below has run
}
const value = 42
readLater() // 42
```

Shadowing makes the TDZ visible in a confusing way:

```js
let value = 1
function g() {
  console.log(value) // ReferenceError, not 1
  let value = 2
}
```

The inner `let value` is hoisted to the top of `g`'s scope, so the lookup finds the inner binding, which is still in its TDZ. It never gets as far as the outer `value`.

Default parameters have their own scope, evaluated left to right, with the same rule:

```js
function f(x = y, y = 1) {}
f() // ReferenceError: y is in its TDZ when x's default is evaluated
```

### Why the TDZ exists

Reading a variable before it is set is almost always a bug. With `var`, it silently produces `undefined`. The TDZ turns that bug into an immediate error, and it makes `const` meaningful: a `const` could otherwise be observed as `undefined` and then as its real value, which would make it not constant at all.

## The `var` in a loop

The most asked closure question:

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i))
}
// 3 3 3
```

Trace it with the model:

| Moment | Environment state |
| --- | --- |
| Loop starts | One function-level binding `i` |
| Iteration 0 | A callback is created; it references the single `i` |
| Iteration 1, 2 | Two more callbacks, all referencing the same `i` |
| Loop ends | `i` is 3 (the value that failed the test) |
| Timers fire | Each callback looks up `i` and finds 3 |

The callbacks don't copy `i`; they capture the **binding**, and there is only one.

With `let`, the specification creates a **new binding for each iteration**, copying the current value into it before the increment:

```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i))
}
// 0 1 2
```

Each callback captures its own iteration's `i`. This per-iteration copying is special behaviour of `for` loops with `let`; it's what makes the obvious code work.

The pre-2015 fixes are still asked about because they show you understand why the bug happens:

```js
// 1. An IIFE creates a new function scope per iteration
for (var i = 0; i < 3; i++) {
  ;(function (j) {
    setTimeout(() => console.log(j))
  })(i)
}

// 2. Pass the value as an argument to setTimeout
for (var i = 0; i < 3; i++) {
  setTimeout((j) => console.log(j), 0, i)
}

// 3. Bind it
for (var i = 0; i < 3; i++) {
  setTimeout(console.log.bind(console, i))
}
```

All three work by giving each callback a value captured at creation time instead of a reference to the shared binding.

A variant interviewers like: what if the loop variable is `let` but declared outside the loop?

```js
let i
for (i = 0; i < 3; i++) {
  setTimeout(() => console.log(i))
}
// 3 3 3: one binding again, because the declaration isn't part of the for head
```

## Closures in practice

### Private state

```js
function createCounter() {
  let count = 0
  return {
    increment() {
      count += 1
      return count
    },
    reset() {
      count = 0
    },
    get value() {
      return count
    },
  }
}

const counter = createCounter()
counter.increment()
counter.value // 1
// `count` can't be reached from outside: only these three functions see it.
```

Each call to `createCounter` creates a fresh environment, so two counters don't share state. Classes now offer `#private` fields for the same purpose, but closures remain the idiomatic way to hide state in factory functions and hooks.

### Function factories and partial application

```js
function multiplier(factor) {
  return function (n) {
    return n * factor
  }
}

const double = multiplier(2)
const triple = multiplier(3)
double(5) // 10
triple(5) // 15
```

`double` and `triple` share the same code but each closes over its own `factor`.

### The module pattern

Before ES modules, an immediately invoked function created a private scope and returned only the public API:

```js
const store = (function () {
  const items = new Map()
  function notify() {
    // private helper
  }
  return {
    add(id, item) {
      items.set(id, item)
      notify()
    },
    get(id) {
      return items.get(id)
    },
  }
})()
```

ES modules give the same privacy at file level: anything not exported is invisible to other modules.

### Once, memoize, debounce

These utilities are all "a function that remembers something between calls", which is exactly what a closure is for.

```js
function once(fn) {
  let called = false
  let result
  return function (...args) {
    if (!called) {
      called = true
      result = fn.apply(this, args)
    }
    return result
  }
}

function memoize(fn) {
  const cache = new Map()
  return function (arg) {
    if (!cache.has(arg)) {
      cache.set(arg, fn(arg))
    }
    return cache.get(arg)
  }
}

function debounce(fn, wait) {
  let timer = null
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), wait)
  }
}
```

In each, the remembered state (`called`, `cache`, `timer`) lives in the closure's environment, created once per wrapped function. Note `fn.apply(this, args)`: a regular `function` wrapper forwards the caller's `this`, which an arrow wrapper could not do.

## Closures and memory

A closure keeps its environment reachable as long as the closure itself is reachable. Usually that is exactly what you want. It becomes a leak when a long-lived function holds an environment that references something large.

```js
function attach(el) {
  const bigData = new Array(1e6).fill('*')
  const onClick = () => console.log(bigData.length)
  el.addEventListener('click', onClick)
  return () => el.removeEventListener('click', onClick) // call this to release bigData
}
```

As long as the listener is registered, `bigData` can't be collected.

Engine details worth knowing:

- Engines like V8 keep only the variables that some inner function actually references, not the whole scope.
- But all closures created in the same scope share **one** context object. If one closure references a large value, every sibling closure from that scope keeps it alive, even closures that never mention it.

```js
function setup() {
  const huge = loadHugeThing()
  const small = 1
  const useHuge = () => huge.size // makes `huge` part of the shared context
  window.onresize = () => small // also keeps `huge` alive, through the shared context
  useHuge()
}
```

Common leak sources: event listeners never removed, intervals never cleared, subscriptions never unsubscribed, caches that only grow. Fixes: remove listeners (an `AbortController` signal can remove many at once), clear timers, copy only the field you need into the closure, and bound caches or key them with a `WeakMap`.

## Stale closures in React

React function components run on every render, and every function they create closes over that render's props and state. A callback that outlives its render keeps seeing old values.

```jsx
function Ticker() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1) // `count` is always 0 here: captured from the first render
    }, 1000)
    return () => clearInterval(id)
  }, [])
  return <p>{count}</p>
}
```

The counter goes from 0 to 1 and stops. Fixes, in order of preference:

1. **Functional update:** `setCount((c) => c + 1)` doesn't need the captured value at all.
2. **Correct dependencies:** list `count` so the effect re-subscribes with the new value (and the interval restarts each time).
3. **A ref:** store the latest value in `useRef` when you need to read it from a long-lived callback without re-subscribing.

## Scope versus `this`

These are often confused. **Scope** decides which variables a function can see, and is fixed when the function is written. **`this`** is decided by how a function is called (see [this binding](/read/this-binding)). Arrow functions are the bridge: they have no `this` of their own, so they look `this` up lexically, exactly like a variable.

## Interview questions

**What is a closure?**
A function together with references to the variables of the scope where it was defined. It can read and update them after that scope has returned, because the function keeps the scope alive.

**Why does the `var` loop print 3 three times?**
`var` is function-scoped, so all the callbacks share one `i`. By the time the timers run, the loop has finished and set `i` to 3. `let` in the loop head creates a new binding for each iteration.

**Are `let` and `const` hoisted?**
Yes, their bindings are created at the start of the block, but they are not initialised. Accessing them before the declaration throws a `ReferenceError`. That window is the temporal dead zone.

**Do closures copy values?**
No, they capture bindings. If the variable changes later, the closure sees the new value. That's why the `var` loop prints the final value.

**How can closures cause memory leaks?**
A long-lived function (a listener, timer or cache entry) keeps its outer scope alive. If that scope references large objects or DOM nodes, they can't be collected until the function is released. Sibling closures share a context, so one closure can keep another's data alive.

**What's the difference between scope and context?**
Scope is about variable visibility and is lexical. Context usually means `this`, which is decided at call time.

**Write a function that can only be called once.**
The `once` helper above: a closure holds a `called` flag and the cached result.

## Pitfalls

- Assuming `typeof` is always safe: it throws for a `let` or `const` in its TDZ.
- Assigning to an undeclared name in sloppy mode creates a global. Modules and classes are strict, so it throws there instead.
- Function declarations inside blocks have inconsistent legacy behaviour in sloppy mode; prefer `const fn = () => {}` inside blocks.
- Capturing a large object in a long-lived callback when only one field is needed.
- Writing utilities like `debounce` with an arrow wrapper, which loses the caller's `this`.

## Key takeaways

- Lookup follows the scope chain of where a function was **defined**; that chain is stored on the function.
- An environment stays alive while any closure references it.
- `var` is function-scoped and initialised to `undefined`; `let`, `const` and `class` are block-scoped and throw before initialisation.
- `for (let …)` creates a fresh binding per iteration, which is why it fixes the loop bug.
- Closures capture bindings, not values.
- Long-lived closures are the most common source of JavaScript memory leaks; release listeners and timers.
