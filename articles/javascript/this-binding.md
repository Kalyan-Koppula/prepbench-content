---
title: How this Is Bound
order: 3
summary: The four binding rules plus arrows, call/apply/bind, losing this in callbacks, classes — and the puzzles that test them.
---

`this` is decided by **how a function is called**, not where it's written (arrow functions are the exception). Interviewers ask you to predict `this` in tricky call sites and to fix "lost `this`" bugs in callbacks and React class components.

## The rules, in precedence order

| Rule | Call site | `this` is |
|---|---|---|
| 1. `new` binding | `new Foo()` | The newly created object |
| 2. Explicit binding | `fn.call(obj)`, `fn.apply(obj)`, `fn.bind(obj)()` | `obj` |
| 3. Implicit binding | `obj.fn()` | `obj` (the object before the dot) |
| 4. Default binding | `fn()` | `undefined` in strict mode, `globalThis` in sloppy mode |
| Arrow functions | any | `this` of the enclosing scope, fixed at creation; the rules above don't apply |

Modules and class bodies are always strict, so in modern code the default binding is almost always `undefined`.

```js
function show() { return this }

const obj = { show }
obj.show()            // obj (implicit)
show.call(42)         // 42 in strict mode (primitives are boxed in sloppy mode)
show()                // undefined (strict)
new show()            // a new object
show.bind(obj).call({}) // obj — a bound this can't be overridden by call
```

## `call`, `apply`, `bind`

| Method | Invokes now? | Arguments |
|---|---|---|
| `fn.call(thisArg, a, b)` | Yes | Listed individually |
| `fn.apply(thisArg, [a, b])` | Yes | As an array (or array-like) |
| `fn.bind(thisArg, a)` | No, returns a new function | Pre-filled (partial application) |

- A bound function's `this` can't be changed again by `call`, `apply` or another `bind`.
- `new` on a bound function ignores the bound `this` but keeps the pre-filled arguments.
- Arrow functions ignore the `thisArg` of `call`/`apply`/`bind` entirely.

## Arrow functions

Arrows capture `this` lexically. That's why they fix callbacks, and why they make poor object methods.

```js
const timer = {
  seconds: 0,
  start() {
    setInterval(() => { this.seconds++ }, 1000) // `this` is timer: inherited from start()
  },
}

const broken = {
  name: 'box',
  getName: () => this?.name, // `this` is the module's `this` (undefined), not `broken`
}
broken.getName() // undefined
```

Arrows also have no `arguments`, no `prototype`, and can't be used with `new`.

## Losing `this`

Implicit binding only exists at the call site. Detaching the method loses it.

```js
'use strict'
const counter = {
  count: 0,
  inc() { this.count++ },
}

const inc = counter.inc
inc() // TypeError: Cannot read properties of undefined

setTimeout(counter.inc, 0)            // same problem: called as a plain function
button.addEventListener('click', counter.inc) // `this` is the button element
```

Fixes:

```js
setTimeout(() => counter.inc(), 0)
setTimeout(counter.inc.bind(counter), 0)
```

Note: for DOM listeners registered with a regular function, `this` is `event.currentTarget`.

## Classes

Class bodies are strict, and methods live on the prototype, so a detached method gets `this === undefined`.

```js
class Toggle {
  on = false
  // Arrow class field: one function per instance, `this` bound to the instance
  flip = () => { this.on = !this.on }
  // Prototype method: shared, but loses `this` when detached
  log() { console.log(this.on) }
}

const t = new Toggle()
const { flip, log } = t
flip()  // works
log()   // TypeError
```

Trade-off: arrow fields cost memory per instance and aren't on the prototype (can't be overridden via `super.method()` or easily mocked on the prototype). Binding in the constructor (`this.log = this.log.bind(this)`) has the same per-instance cost.

## Puzzles

### Puzzle 1

```js
const user = {
  name: 'Ana',
  greet() { return `hi ${this.name}` },
}
const fn = user.greet
console.log(user.greet())        // ?
console.log((user.greet)())      // ?
console.log((0, user.greet)())   // ?
```

Answers: `hi Ana`, `hi Ana` (grouping parentheses keep the reference), then in strict mode a TypeError (the comma operator yields a plain function value, so default binding applies). In sloppy mode it prints `hi ` plus `globalThis.name` (in browsers, the window's name, usually an empty string).

### Puzzle 2

```js
const obj = {
  name: 'outer',
  regular() {
    return [
      (() => this.name)(),
      function () { return this?.name }(),
    ]
  },
}
obj.regular() // ?
```

Answer: `['outer', undefined]`. The arrow inherits `this` from `regular`; the inner function expression is called plainly, so in strict mode `this` is `undefined`.

### Puzzle 3

```js
function Person(name) {
  this.name = name
  return { name: 'override' }
}
new Person('Ben').name // ?
```

Answer: `'override'`. If a constructor returns an object, `new` returns that object instead of `this`. Returning a primitive is ignored.

### Puzzle 4

```js
const a = { x: 1, getX() { return this.x } }
const b = { x: 2 }
const bound = a.getX.bind(b)
console.log(bound(), bound.call(a), bound.bind(a)())
```

Answer: `2 2 2`. Once bound, `this` stays `b` no matter how it's called or re-bound afterwards.

## Common interview questions

**What determines `this`?**
The call site: `new`, explicit `call`/`apply`/`bind`, a method call on an object, or a plain call — checked in that order. Arrow functions take `this` from their enclosing scope instead.

**Why use arrow functions for callbacks?**
They inherit `this` from the surrounding method, so you don't need `bind` or `const self = this`.

**Why not use arrows as object methods?**
They don't get the object as `this`; they see the outer scope's `this`, which is usually `undefined` in a module.

**What's `this` inside an event listener?**
With a regular function, the element the listener is attached to (`event.currentTarget`). With an arrow, the enclosing scope's `this`.

**Can you rebind a bound function?**
No. `bind` creates a function whose `this` is fixed; only `new` overrides it.

## Pitfalls

- Passing `obj.method` as a callback (timers, event listeners, promise `.then`, array methods).
- Using `this` in a nested `function` inside a method; use an arrow.
- Forgetting that `Array.prototype.forEach(fn, thisArg)` and similar accept a `thisArg` — but it's ignored for arrows.
- Top-level `this` differs: `undefined` in ES modules, `globalThis` in classic scripts, `module.exports` in CommonJS.
