---
title: How this Is Bound
order: 3
summary: The four binding rules plus arrows, call/apply/bind, losing this in callbacks, classes — and the puzzles that test them.
---

`this` is the most misunderstood keyword in JavaScript because it doesn't work like a variable. A variable is resolved by where the code is **written** (see [Closures and Scope](/read/closures-and-scope)). `this` is decided by how a function is **called**. The same function can see a different `this` every time it runs. Once you have a short procedure for finding the call site and applying four rules in order, every `this` puzzle becomes mechanical.

## Why `this` exists

`this` lets one function serve many objects. A method defined once on a prototype can work on whichever object it was called on:

```js
const proto = {
  describe() {
    return `${this.name} is ${this.age}`
  },
}

const ana = Object.create(proto)
ana.name = 'Ana'
ana.age = 31

const ben = Object.create(proto)
ben.name = 'Ben'
ben.age = 28

ana.describe() // 'Ana is 31'
ben.describe() // 'Ben is 28'
```

There is only one `describe` function. It can't capture "the object" lexically, because it doesn't know which object it will be called on. So the language passes the object in as a hidden argument at call time. That hidden argument is `this`.

Thinking of `this` as **an implicit parameter filled in by the call** is the most useful mental model: `ana.describe()` is roughly `describe.call(ana)`.

## The four rules, in order of precedence

To find `this` for a regular (non-arrow) function, look at the call expression and check these rules from top to bottom. The first one that applies wins.

| Rule | Call looks like | `this` is |
| --- | --- | --- |
| 1. `new` binding | `new Foo()` | The newly created object |
| 2. Explicit binding | `fn.call(obj)`, `fn.apply(obj)`, a function from `fn.bind(obj)` | `obj` |
| 3. Implicit binding | `obj.fn()` or `obj['fn']()` | `obj`, the object before the dot |
| 4. Default binding | `fn()` | `undefined` in strict mode, `globalThis` in sloppy mode |
| Arrow functions | any | The `this` of the enclosing scope, fixed when the arrow is created; the rules above don't apply |

Modules and class bodies are always in strict mode, so in modern code the default binding is almost always `undefined`.

```js
'use strict'
function show() {
  return this
}

const obj = { show }

obj.show() // obj (implicit)
show.call(42) // 42 (explicit; in sloppy mode primitives are boxed: Number {42})
show() // undefined (default, strict)
new show() // a new object (new)
show.bind(obj).call({}) // obj: a bound this can't be overridden by call
```

### Why the precedence is this order

- `new` beats a bound `this`: calling `new` on a bound function creates a fresh object and uses it. (The bound arguments are still applied.)
- Explicit beats implicit: `obj.fn.call(other)` uses `other`.
- Implicit beats default: that is the whole point of method calls.

## What `new` actually does

`new Foo(a, b)` performs four steps:

1. Create a new empty object.
2. Set its prototype to `Foo.prototype`.
3. Call `Foo` with `this` set to the new object and the given arguments.
4. If `Foo` returns an object, use that; otherwise use the new object.

```js
function Person(name) {
  this.name = name
}
Person.prototype.hello = function () {
  return `hi, ${this.name}`
}

const p = new Person('Cy')
p.hello() // 'hi, Cy'
Object.getPrototypeOf(p) === Person.prototype // true
```

Step 4 explains a classic puzzle:

```js
function Weird() {
  this.value = 1
  return { value: 2 }
}
new Weird().value // 2: an object return value replaces `this`

function Fine() {
  this.value = 1
  return 42
}
new Fine().value // 1: a primitive return value is ignored
```

## `call`, `apply` and `bind`

| Method | Calls now? | Arguments |
| --- | --- | --- |
| `fn.call(thisArg, a, b)` | Yes | Listed one by one |
| `fn.apply(thisArg, [a, b])` | Yes | As an array (or array-like) |
| `fn.bind(thisArg, a)` | No, returns a new function | Pre-filled (partial application) |

```js
function introduce(greeting, punctuation) {
  return `${greeting}, I'm ${this.name}${punctuation}`
}

const dee = { name: 'Dee' }
introduce.call(dee, 'Hello', '!') // "Hello, I'm Dee!"
introduce.apply(dee, ['Hi', '.']) // "Hi, I'm Dee."

const deeSays = introduce.bind(dee, 'Hey')
deeSays('?') // "Hey, I'm Dee?"
```

Rules worth stating in an interview:

- A bound function's `this` can't be changed by `call`, `apply` or another `bind`. Binding twice keeps the first `this`.
- `new` on a bound function ignores the bound `this` but keeps the pre-filled arguments.
- Arrow functions ignore the `thisArg` of `call`, `apply` and `bind`.
- `apply` was the standard way to spread an array into arguments before spread syntax (`Math.max.apply(null, numbers)`).

## Arrow functions

Arrows don't have their own `this`. Inside an arrow, `this` is looked up in the enclosing scope, exactly like a variable. That makes arrows ideal for callbacks inside methods and wrong as methods themselves.

```js
const timer = {
  seconds: 0,
  start() {
    setInterval(() => {
      this.seconds += 1 // `this` is timer, inherited from start()
    }, 1000)
  },
}

const broken = {
  name: 'box',
  getName: () => this, // `this` is the module's top-level `this` (undefined), not `broken`
}
broken.getName() // undefined
```

Before arrows, the same problem was solved with `const self = this` or `.bind(this)`:

```js
const legacyTimer = {
  seconds: 0,
  start() {
    const self = this
    setInterval(function () {
      self.seconds += 1
    }, 1000)
  },
}
```

Arrows also have no `arguments` object, no `prototype` property, and can't be called with `new`.

## Losing `this`

Implicit binding exists only at the moment of the call `obj.fn()`. As soon as the function is detached from the object and called some other way, the binding is gone.

```js
'use strict'
const counter = {
  count: 0,
  increment() {
    this.count += 1
  },
}

const inc = counter.increment
inc() // TypeError: Cannot read properties of undefined (reading 'count')

setTimeout(counter.increment, 0) // the timer calls it as a plain function
button.addEventListener('click', counter.increment) // `this` is the button
promise.then(counter.increment) // called as a plain function: undefined
;[1, 2].forEach(counter.increment) // undefined (unless a thisArg is passed)
```

In all of these, what is passed is just the function value. The receiver calls it however it likes.

Fixes:

```js
setTimeout(() => counter.increment(), 0) // keep the method call
setTimeout(counter.increment.bind(counter), 0) // fix this ahead of time
;[1, 2].forEach(counter.increment, counter) // many array methods accept a thisArg
```

### DOM event listeners

For a listener registered with a regular function, `this` is the element the listener is attached to, the same as `event.currentTarget`. For an arrow listener, it's the enclosing scope's `this`. Prefer `event.currentTarget` in either case; it is explicit and survives refactoring.

## Classes

Class bodies are strict, and ordinary methods live on the prototype. A detached class method gets `this === undefined`.

```js
class Toggle {
  on = false

  // Arrow class field: one function per instance, `this` bound to the instance.
  flip = () => {
    this.on = !this.on
  }

  // Prototype method: shared by all instances, loses `this` when detached.
  log() {
    console.log(this.on)
  }
}

const t = new Toggle()
const flip = t.flip
const log = t.log
flip() // works
log() // TypeError
```

The trade-offs:

| Approach | Shared? | Survives detaching? | Overridable with `super`? |
| --- | --- | --- | --- |
| Prototype method | Yes, one function | No | Yes |
| Arrow class field | No, one per instance | Yes | No (it isn't on the prototype) |
| `this.log = this.log.bind(this)` in the constructor | No, one per instance | Yes | Partly (the original is still on the prototype) |

React class components were the classic place this mattered: handlers passed as `onClick={this.handleClick}` needed binding. Function components and hooks removed the problem, because handlers there are closures, not methods.

## Getters, setters and prototype methods

Implicit binding applies to accessors too, and `this` is the object the property was **accessed on**, even if the getter is defined on a prototype:

```js
const base = {
  get label() {
    return `item ${this.id}`
  },
}
const item = Object.create(base)
item.id = 7
item.label // 'item 7': `this` is item, not base
```

That is what makes prototype inheritance work: shared code, per-object data.

## A procedure for any `this` question

1. Is it an arrow function? Find the nearest enclosing regular function (or the module/script top level) and answer the question for that.
2. Find the **call site**, the exact expression that calls the function. Ignore where it was defined.
3. Apply the four rules in order: `new`, then `call`/`apply`/`bind`, then `obj.` before the call, then default.
4. For the default rule, check strict mode: modules, classes and `'use strict'` mean `undefined`.

## Puzzles

### Puzzle 1: grouping and the comma operator

```js
'use strict'
const user = {
  name: 'Ana',
  greet() {
    return `hi ${this.name}`
  },
}
console.log(user.greet()) // ?
console.log((user.greet)()) // ?
console.log((0, user.greet)()) // ?
```

Answers: `hi Ana`, `hi Ana`, then a TypeError. Grouping parentheses keep the property reference, so the call is still a method call. The comma operator evaluates to the plain function value, so the default rule applies. In sloppy mode the last line would print `hi ` plus `globalThis.name`.

### Puzzle 2: arrow versus nested function

```js
'use strict'
const obj = {
  name: 'outer',
  regular() {
    const viaArrow = (() => this.name)()
    const viaFunction = (function () {
      return this
    })()
    return [viaArrow, viaFunction]
  },
}
obj.regular() // ?
```

Answer: `['outer', undefined]`. The arrow inherits `this` from `regular`. The inner function expression is called plainly, so strict mode gives `undefined`.

### Puzzle 3: binding twice

```js
const a = {
  x: 1,
  getX() {
    return this.x
  },
}
const b = { x: 2 }
const bound = a.getX.bind(b)
console.log(bound(), bound.call(a), bound.bind(a)()) // ?
```

Answer: `2 2 2`. Once bound, `this` stays `b`.

### Puzzle 4: a method stored in a variable inside a method

```js
'use strict'
const team = {
  name: 'core',
  members: ['ana', 'ben'],
  list() {
    return this.members.map(function (m) {
      return `${m}@${this.name}`
    })
  },
}
team.list() // ?
```

Answer: a TypeError. The `map` callback is a regular function called plainly, so `this` is `undefined` and `this.name` throws. Fix with an arrow callback, or pass `this` as `map`'s second argument.

### Puzzle 5: `new` against `bind`

```js
function Box(size) {
  this.size = size
}
const BoundBox = Box.bind({ size: 'ignored' }, 10)
const box = new BoundBox()
box.size // ?
```

Answer: `10`. `new` creates a fresh object and ignores the bound `this`, but the pre-filled argument 10 is still passed.

## Top-level `this`

| Environment | Top-level `this` |
| --- | --- |
| ES module (browser or Node) | `undefined` |
| Classic browser script | `window` (`globalThis`) |
| CommonJS module in Node | `module.exports` |
| Inside a class body's static block | The class itself |

## Interview questions

**What determines `this`?**
The call site, checked in order: `new`, explicit `call`/`apply`/`bind`, a method call on an object, then a plain call. Arrow functions take `this` from their enclosing scope instead.

**Why use arrow functions for callbacks?**
They inherit `this` from the surrounding method, so you don't need `bind` or `const self = this`.

**Why not use arrows as object methods?**
They don't receive the object as `this`; they see the outer scope's `this`, which is usually `undefined` in a module.

**What is `this` inside an event listener?**
With a regular function, the element the listener is attached to (`event.currentTarget`). With an arrow, the enclosing scope's `this`.

**Can you rebind a bound function?**
No. Its `this` is fixed; only `new` overrides it.

**What's the difference between `call`, `apply` and `bind`?**
`call` and `apply` invoke immediately, taking arguments as a list or an array. `bind` returns a new function with `this` (and optionally some arguments) fixed.

**Implement `bind`.**
Return a function that calls the original with `apply`, combining pre-filled and new arguments, and handles `new` by checking whether `this` is an instance of the bound function. See the [Polyfills Cheatsheet](/read/polyfills-cheatsheet).

## Pitfalls

- Passing `obj.method` as a callback to timers, event listeners, promise handlers or array methods.
- Using `this` inside a nested regular function within a method.
- Defining object methods as arrows.
- Assuming top-level `this` is `window` in module code.
- Relying on `this` in DOM listeners when `event.currentTarget` is clearer.

## Key takeaways

- `this` is an implicit argument decided by the call, not by where the function is defined.
- Precedence: `new` > explicit > implicit > default.
- Arrows have no `this`; they use the enclosing scope's, like a variable.
- Detaching a method loses its `this`; fix with an arrow wrapper or `bind`.
- In strict code (modules, classes), the default binding is `undefined`.
