---
title: Closures and Scope
order: 2
summary: Lexical scope, hoisting and the TDZ, the var-in-loop trap, the module pattern, and what closures keep alive.
---

A closure is a function together with the scope it was created in. Interviewers use closures to check whether you understand scope resolution, hoisting, and why the classic `var` loop prints the same number three times. They also lead into memory: what a closure keeps alive.

## Lexical scope

Scope is decided by where code is **written**, not where it is called. Variable lookup walks outward through enclosing scopes to the global scope.

```js
const x = 'global'
function outer() {
  const x = 'outer'
  return function inner() {
    return x // resolved lexically: 'outer'
  }
}
const fn = outer()
fn() // 'outer', even though called from global scope
```

| Scope | Created by |
|---|---|
| Global | Top-level classic script (`var` and function declarations become `globalThis` properties) |
| Module | Each ES module file; top-level bindings are private to the module |
| Function | Every function call |
| Block | `{ }`, `if`, `for`, `try`, `switch` — for `let`, `const`, `class` |

## Hoisting and the TDZ

All declarations are hoisted — the binding exists from the start of its scope — but they are initialised differently.

| Declaration | Hoisted | Initial value before declaration line |
|---|---|---|
| `var` | To function scope | `undefined` |
| `function` declaration | To scope, with body | The full function |
| `let` / `const` | To block scope | Uninitialised: access throws (TDZ) |
| `class` | To block scope | Uninitialised: access throws (TDZ) |
| `import` | To module scope | Bound before any module code runs |

The **temporal dead zone** is the span between entering the scope and the declaration line.

```js
console.log(a) // undefined
var a = 1

console.log(b) // ReferenceError: Cannot access 'b' before initialization
let b = 2

typeof c // ReferenceError too — typeof is not safe inside the TDZ
let c = 3

function f(x = y, y = 1) {} // default params have their own TDZ
f() // ReferenceError
```

The TDZ also explains shadowing surprises:

```js
let value = 1
function g() {
  console.log(value) // ReferenceError: inner `value` shadows and is in its TDZ
  let value = 2
}
```

## The `var` in a loop

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i))
}
// 3 3 3 — one function-scoped `i`, read after the loop ends

for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i))
}
// 0 1 2 — `let` creates a fresh binding per iteration
```

Pre-ES2015 fixes, still asked about:

```js
for (var i = 0; i < 3; i++) {
  ;((j) => setTimeout(() => console.log(j)))(i) // IIFE captures a copy
}
for (var i = 0; i < 3; i++) {
  setTimeout(console.log, 0, i) // pass as timer argument
}
```

## Closures in practice

### Private state

```js
function createCounter() {
  let count = 0
  return {
    increment: () => ++count,
    reset: () => { count = 0 },
    get value() { return count },
  }
}
const c = createCounter()
c.increment()
c.value // 1; `count` itself is unreachable from outside
```

### Function factories and partial application

```js
const multiplier = (factor) => (n) => n * factor
const double = multiplier(2)
double(5) // 10
```

### The module pattern

Before ES modules, an IIFE created a private scope and returned a public API. ES modules give the same privacy per file.

```js
const store = (() => {
  const items = new Map()
  const notify = () => {}
  return {
    add(id, item) { items.set(id, item); notify() },
    get: (id) => items.get(id),
  }
})()
```

### Once

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
```

## Closures and memory

A closure keeps its outer scope reachable for as long as the closure itself is reachable.

- Engines like V8 only retain variables that some inner function actually references, but all closures created in the same scope share one context object. A large value referenced by one closure is kept alive by every sibling closure from that scope.
- Long-lived closures (event listeners, timers, caches, subscriptions) are the usual leak vector: the listener holds the scope, and the scope holds large data or DOM nodes.

```js
function attach(el) {
  const bigData = new Array(1e6).fill('*')
  const onClick = () => console.log(bigData.length)
  el.addEventListener('click', onClick)
  return () => el.removeEventListener('click', onClick) // call this to release bigData
}
```

Fixes: remove listeners, clear timers, copy only the primitive you need into the closure, or use `AbortController` signals to remove listeners in bulk.

## Stale closures in React

A closure captures the variables of the render it was created in. An effect or callback that doesn't list a value in its dependencies keeps seeing the old one.

```jsx
useEffect(() => {
  const id = setInterval(() => setCount(count + 1), 1000) // always uses the first `count`
  return () => clearInterval(id)
}, [])
// Fix: setCount((c) => c + 1)
```

## Common interview questions

**What is a closure?**
A function bundled with references to the variables of the scope where it was defined, so it can still read and update them after that scope has returned.

**Why does the `var` loop print 3 three times?**
`var` is function-scoped, so all callbacks share one `i`; by the time the timers fire the loop has set it to 3. `let` creates a new binding for each iteration.

**Are `let` and `const` hoisted?**
Yes, but they are not initialised. Accessing them before the declaration throws a ReferenceError; that window is the temporal dead zone.

**Do closures copy values?**
No, they capture bindings. If the variable changes later, the closure sees the new value.

**How can closures cause memory leaks?**
A long-lived function (listener, timer, cache entry) keeps its outer scope alive. If that scope references large objects or DOM nodes, they can't be collected until the function is released.

**Difference between scope and context?**
Scope is about variable visibility and is lexical. Context usually means the value of `this`, which is decided by how a function is called.

## Pitfalls

- Assuming `typeof` never throws: it throws for a `let`/`const` binding in its TDZ.
- Accidentally creating globals by assigning to an undeclared name in sloppy mode; modules and classes are always strict, so this throws there.
- Function declarations inside blocks have inconsistent legacy semantics in sloppy mode; use `const fn = () => {}` instead.
- Capturing a large object when only one field is needed.
