---
title: Polyfills Cheat Sheet
order: 7
summary: Compact, correct implementations of the utilities interviewers ask for most, with the follow-up questions for each.
---

"Implement X from scratch" is the most common frontend coding question. The interviewer cares about correctness at the edges (`this`, arguments, holes, cycles, ordering), readable code, and whether you can extend it when asked. Write the simple version first, then add options.

## How to approach any "implement X" question

1. **Pin down the contract.** Ask what the real API does at the edges: does `debounce` fire on the leading edge? Does `flatten` take a depth? Should `deepClone` handle cycles? Saying the questions out loud scores points even if the answer is "keep it simple".
2. **Write the simplest correct version** for the common case.
3. **Walk through an example** by hand, including timing for anything with timers.
4. **List the edge cases** and fix the ones that matter: `this`, argument forwarding, empty input, holes in arrays, cycles, errors, ordering.
5. **Offer extensions**: options, cancellation, tests with fake timers.

Two habits apply to almost every wrapper below:

- Return a regular `function`, not an arrow, and call the original with `fn.apply(this, args)`, so the wrapper works as a method.
- Keep state (timers, caches, flags) in the closure created once per wrapped function, not in module-level variables.

## debounce

Run `fn` only after calls stop for `wait` ms. Use for search inputs and resize handlers.

```js
function debounce(fn, wait) {
  let timer
  function debounced(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), wait)
  }
  debounced.cancel = () => clearTimeout(timer)
  return debounced
}
```


How it behaves with `wait = 100`:

| Time (ms) | Event | Timer after the call | Runs `fn`? |
| --- | --- | --- | --- |
| 0 | call A | fires at 100 | – |
| 40 | call B | cleared, fires at 140 | – |
| 90 | call C | cleared, fires at 190 | – |
| 190 | timer fires | – | yes, with C's arguments |

Every call pushes the deadline back, so `fn` runs once, `wait` ms after the **last** call.

Follow-ups: a `leading` option (fire on the first call, then ignore until quiet), `flush()` to run the pending call now, `maxWait` (which turns it into a throttle hybrid), and preserving `this`/args of the **last** call.

## throttle

Run `fn` at most once per `wait` ms, with a trailing call using the latest arguments.

```js
function throttle(fn, wait) {
  let last = 0
  let timer = null
  let lastArgs, lastThis
  return function throttled(...args) {
    lastArgs = args
    lastThis = this
    const remaining = wait - (Date.now() - last)
    if (remaining <= 0) {
      clearTimeout(timer)
      timer = null
      last = Date.now()
      fn.apply(lastThis, lastArgs)
    } else if (!timer) {
      timer = setTimeout(() => {
        last = Date.now()
        timer = null
        fn.apply(lastThis, lastArgs)
      }, remaining)
    }
  }
}
```


How it behaves with `wait = 100`:

| Time (ms) | Event | What happens |
| --- | --- | --- |
| 0 | call A | 100 ms since the last run: runs A now |
| 30 | call B | 70 ms remaining: schedule a trailing run at 100 |
| 60 | call C | a trailing run is already scheduled: just remember C's arguments |
| 100 | timer fires | runs with C's arguments (the latest) |
| 150 | call D | 50 ms remaining: schedule at 200 |

Throttle guarantees a steady rate during continuous activity, unlike debounce, which waits for silence.

Follow-ups: debounce vs throttle (debounce waits for silence; throttle guarantees a steady rate), why scroll handlers often use `requestAnimationFrame` instead, `leading`/`trailing` flags.

## deepClone

```js
function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value
  if (seen.has(value)) return seen.get(value)          // handles cycles
  if (value instanceof Date) return new Date(value)
  if (value instanceof RegExp) return new RegExp(value.source, value.flags)

  if (value instanceof Map) {
    const copy = new Map()
    seen.set(value, copy)
    value.forEach((v, k) => copy.set(deepClone(k, seen), deepClone(v, seen)))
    return copy
  }
  if (value instanceof Set) {
    const copy = new Set()
    seen.set(value, copy)
    value.forEach((v) => copy.add(deepClone(v, seen)))
    return copy
  }

  const copy = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value))
  seen.set(value, copy)
  for (const key of [...Object.keys(value), ...Object.getOwnPropertySymbols(value)]) {
    copy[key] = deepClone(value[key], seen)
  }
  return copy
}
```

Follow-ups: in real code use `structuredClone` (handles cycles, Maps, Sets, Dates, typed arrays, but throws on functions and DOM nodes and drops prototypes). `JSON.parse(JSON.stringify(x))` loses `undefined`, functions, `Date` objects, `Map`/`Set`, `NaN`/`Infinity`, and throws on cycles and BigInt.

## curry

```js
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args)
    return (...more) => curried.apply(this, [...args, ...more])
  }
}

const add3 = curry((a, b, c) => a + b + c)
add3(1)(2)(3)   // 6
add3(1, 2)(3)   // 6
```

Follow-ups: `fn.length` ignores rest and default params, so accept an explicit arity; placeholder support; infinite currying `sum(1)(2)(3)()` that terminates on an empty call.

## memoize

```js
function memoize(fn, resolver = (...args) => JSON.stringify(args)) {
  const cache = new Map()
  return function (...args) {
    const key = resolver(...args)
    if (cache.has(key)) return cache.get(key)
    const result = fn.apply(this, args)
    cache.set(key, result)
    return result
  }
}
```

Follow-ups: key collisions and cost of `JSON.stringify`, object-identity keys with a `WeakMap`, bounding the cache (LRU via `Map` insertion order), memoising async functions by caching the promise and evicting it on rejection.

## flatten

```js
function flatten(arr, depth = 1) {
  if (depth < 1) return arr.slice()
  return arr.reduce(
    (acc, item) => acc.concat(Array.isArray(item) ? flatten(item, depth - 1) : [item]),
    [],
  )
}

flatten([1, [2, [3, [4]]]], Infinity) // [1, 2, 3, 4]
```

Iterative version for very deep input (avoids stack overflow):

```js
function flattenDeep(arr) {
  const stack = [...arr]
  const out = []
  while (stack.length) {
    const item = stack.pop()
    if (Array.isArray(item)) stack.push(...item)
    else out.push(item)
  }
  return out.reverse()
}
```

Follow-ups: native `flat` skips holes, flattening objects into dotted keys (`{ a: { b: 1 } }` → `{ 'a.b': 1 }`).

## Function.prototype.bind

```js
Function.prototype.myBind = function (thisArg, ...preset) {
  const target = this
  if (typeof target !== 'function') throw new TypeError('myBind must be called on a function')
  function bound(...args) {
    // Called with `new`: ignore thisArg, construct normally
    const self = new.target ? this : thisArg
    return target.apply(self, [...preset, ...args])
  }
  if (target.prototype) bound.prototype = Object.create(target.prototype)
  return bound
}
```


### call and apply

```js
Function.prototype.myCall = function (thisArg, ...args) {
  // Primitives are boxed; null and undefined become the global object (sloppy-mode behaviour).
  const context = thisArg === null || thisArg === undefined ? globalThis : Object(thisArg)
  const key = Symbol('fn') // a unique key can't clash with existing properties
  context[key] = this // `this` is the function being called
  try {
    return context[key](...args) // a method call, so `this` inside is `context`
  } finally {
    delete context[key]
  }
}

Function.prototype.myApply = function (thisArg, args) {
  return this.myCall(thisArg, ...(args ?? []))
}
```

The trick is turning an explicit binding into an implicit one: attach the function to the object, call it as a method, then remove it.

Follow-ups: implement `call` (temporarily attach the function to `thisArg` under a `Symbol` key, invoke, delete) and `apply`; why `new` must win over the bound `this`.

## Array.prototype.map and reduce

```js
Array.prototype.myMap = function (callback, thisArg) {
  if (typeof callback !== 'function') throw new TypeError(`${callback} is not a function`)
  const arr = Object(this)
  const len = arr.length >>> 0
  const out = new Array(len)
  for (let i = 0; i < len; i++) {
    if (i in arr) out[i] = callback.call(thisArg, arr[i], i, arr) // skip holes
  }
  return out
}

Array.prototype.myReduce = function (callback, ...initial) {
  const arr = Object(this)
  const len = arr.length >>> 0
  let i = 0
  let acc
  if (initial.length) {
    acc = initial[0]
  } else {
    while (i < len && !(i in arr)) i++
    if (i === len) throw new TypeError('Reduce of empty array with no initial value')
    acc = arr[i++]
  }
  for (; i < len; i++) {
    if (i in arr) acc = callback(acc, arr[i], i, arr)
  }
  return acc
}
```

Why `...initial` instead of `initial = undefined`: `reduce(fn, undefined)` is a valid explicit initial value and must be distinguished from "no initial value".

## EventEmitter

```js
class EventEmitter {
  #events = new Map()

  on(name, listener) {
    if (!this.#events.has(name)) this.#events.set(name, [])
    this.#events.get(name).push(listener)
    return () => this.off(name, listener) // unsubscribe handle
  }

  off(name, listener) {
    const list = this.#events.get(name)
    if (!list) return
    const i = list.findIndex((l) => l === listener || l.original === listener)
    if (i !== -1) list.splice(i, 1)
  }

  once(name, listener) {
    const wrapper = (...args) => {
      this.off(name, wrapper)
      listener.apply(this, args)
    }
    wrapper.original = listener // so off(name, listener) still works
    return this.on(name, wrapper)
  }

  emit(name, ...args) {
    const list = this.#events.get(name)
    if (!list?.length) return false
    for (const listener of [...list]) listener.apply(this, args) // copy: listeners may unsubscribe
    return true
  }
}
```

Follow-ups: why copy before iterating, error isolation (one throwing listener shouldn't block others), max-listener warnings, wildcard events.

## Promise.all

```js
function promiseAll(iterable) {
  return new Promise((resolve, reject) => {
    const items = Array.from(iterable)
    const results = new Array(items.length)
    let remaining = items.length
    if (remaining === 0) return resolve(results)
    items.forEach((item, i) => {
      Promise.resolve(item).then((value) => {
        results[i] = value
        if (--remaining === 0) resolve(results)
      }, reject)
    })
  })
}
```

Follow-ups: `allSettled`, `any` with `AggregateError`, `race`, and a concurrency-limited version. See the promises article for details.

## compose and pipe

```js
const pipe = (...fns) => (input) => fns.reduce((value, fn) => fn(value), input)
const compose = (...fns) => (input) => fns.reduceRight((value, fn) => fn(value), input)

const slugify = pipe(
  (s) => s.trim(),
  (s) => s.toLowerCase(),
  (s) => s.replace(/\s+/g, '-'),
)
slugify('  Hello World ') // 'hello-world'
```

`pipe` runs left to right (reads like a data flow); `compose` runs right to left (matches mathematical notation). Follow-up: an async pipe that awaits each step.

## get (safe nested access)

```js
function get(obj, path, fallback) {
  const keys = Array.isArray(path) ? path : path.replace(/\[(\w+)\]/g, '.$1').split('.')
  let current = obj
  for (const key of keys) {
    if (current === null || current === undefined) return fallback
    current = current[key]
  }
  return current === undefined ? fallback : current
}

get({ a: { b: [{ c: 3 }] } }, 'a.b[0].c') // 3
get({ a: null }, 'a.b.c', 'none') // 'none'
```

Follow-ups: the matching `set` that creates missing objects or arrays along the path, and why optional chaining (`a?.b?.[0]?.c`) replaced most uses.

## promisify and sleep

```js
function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, (err, result) => {
        if (err) reject(err)
        else resolve(result)
      })
    })
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
```

`promisify` adapts Node-style "error-first" callbacks. Follow-up: callbacks that pass several results (resolve with an array).

## setInterval with setTimeout

```js
function interval(fn, ms) {
  let timer = null
  let active = true
  function tick() {
    if (!active) return
    fn()
    timer = setTimeout(tick, ms) // schedule the next run after this one finishes
  }
  timer = setTimeout(tick, ms)
  return () => {
    active = false
    clearTimeout(timer)
  }
}
```

Unlike `setInterval`, a chained timeout never stacks runs when `fn` is slow, and the gap between runs is at least `ms`.

## Common interview questions

**Why `fn.apply(this, args)` instead of `fn(...args)`?**
So the wrapper is transparent: when used as a method, the original function still sees the right `this`.

**Why use a `WeakMap` for cycle tracking in `deepClone`?**
It maps each source object to its copy, so a repeated reference returns the same copy and cycles terminate; weak keys mean nothing leaks after the call.

**What's wrong with `arr.forEach` inside a polyfill?**
Nothing functionally, but interviewers may expect a plain loop to show you handle holes, `length >>> 0`, and array-likes yourself.

**How would you test these?**
Cover `this` preservation, argument passing, edge cases (empty arrays, holes, cycles), and timing with fake timers (`vi.useFakeTimers()` / `jest.useFakeTimers()`).

## Pitfalls

- Arrow function as the returned wrapper in `debounce`/`memoize`, losing the caller's `this`.
- Mutating the listener array while iterating in `emit`.
- `Promise.all` that pushes results in completion order instead of input order.
- `curry` that relies on `fn.length` for functions with default parameters.
- Extending built-in prototypes outside an interview; in production, prefer standalone functions.

## Key takeaways

- Clarify the contract and edge cases before coding; interviewers grade the questions as much as the code.
- Wrappers should forward `this` and arguments with `fn.apply(this, args)`.
- Debounce waits for silence; throttle limits the rate; both keep their timer in a closure.
- `deepClone` needs a `WeakMap` for cycles; `structuredClone` is the production answer.
- `Promise.all` keeps input order and rejects on the first failure; `call` works by temporarily making the function a method.
