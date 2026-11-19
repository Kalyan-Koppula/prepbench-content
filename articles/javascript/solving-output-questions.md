---
title: Solving Output Questions
order: 9
summary: A four-pass method for "what does this log?" questions — hoisting, scope, this, then a queue walk — with six worked examples and the traps.
---

"What does this log?" questions reward a method, not memory. The snippets are built from a handful of mechanisms layered together, and candidates get them wrong by tracking everything at once. Make four passes over the code, write down what each pass tells you, and only then produce the output. The event-loop article covers the queues themselves; this one is about the procedure.

## The four passes

```text
1. Hoisting pass   Which names exist before line 1 runs, and with what value?
                   var -> undefined, function declarations -> the function,
                   let/const/class -> TDZ (ReferenceError if read early).
2. Scope pass      For each callback, which binding does each free variable
                   refer to? One shared `var`, or a fresh `let` per iteration?
3. this pass       For each call site: new? call/apply/bind? obj.method()?
                   plain call (undefined in strict, globalThis in sloppy)?
                   Arrow functions ignore all of these and use the outer this.
4. Queue walk      Run sync code top to bottom, appending to two lists:
                   microtasks and tasks. Then drain microtasks fully, take
                   one task, drain microtasks again, and repeat.
```

Write the queues on paper or in a comment as you go:

```text
log:   1 6
micro: [f-cont, then-5]
tasks: [timer-4]
```

Saying "first I'll do a hoisting pass" out loud also tells the interviewer you have a system, which earns credit even if you slip on a detail.

## The queue walk rules

- Synchronous code runs to completion first, including the bodies of `async` functions up to their first `await` and `new Promise` executors.
- `.then`, `.catch`, `.finally` callbacks, `await` continuations and `queueMicrotask` go to the microtask queue only when the promise they wait on is settled. A `.then` on a pending promise queues nothing yet.
- After every task, the whole microtask queue drains, including microtasks added while draining.
- `setTimeout`, `setInterval`, `MessageChannel` and events are tasks; they run one per loop turn in the order they were scheduled (for equal delays).
- Each `.then` in a chain only queues its successor when it runs, so two chains interleave one step at a time.

## Worked example 1: hoisting

```js
console.log(typeof foo, bar)
var bar = 1
function foo() {}
var foo = 'x'
console.log(typeof foo)
```

Hoisting pass: `bar` is `undefined`; `foo` is the function, because function declarations are initialised during hoisting and a later `var foo` declaration doesn't reset it. The assignment `foo = 'x'` happens at runtime.

Output: `function undefined`, then `string`.

## Worked example 2: `this`

```js
// in an ES module, so strict mode
const obj = {
  name: 'obj',
  getName() { return this.name },
  getArrow() { return () => this.name },
}
const { getName } = obj
const arrow = obj.getArrow()
const other = { name: 'other', getName: obj.getName, arrow }

console.log(obj.getName())
console.log(other.getName())
console.log(other.arrow())
console.log(getName.call({ name: 'call' }))
console.log(getName())
```

`this` pass, one call site at a time: `obj.getName()` is a method call on `obj`; `other.getName()` is the same function called on `other`; `other.arrow()` is an arrow created inside `getArrow` with `this === obj`, and calling it through `other` can't change that; `.call` sets `this` explicitly; the bare `getName()` has `this === undefined` in strict mode.

Output: `obj`, `other`, `obj`, `call`, then a `TypeError` (reading `name` of `undefined`).

## Worked example 3: `var` in loops

```js
for (var i = 0; i < 3; i++) setTimeout(() => console.log('var', i))
for (let j = 0; j < 3; j++) setTimeout(() => console.log('let', j))
```

Scope pass: there is one `i` for the whole function, and by the time any timer runs the loop has finished and `i === 3`. `let` creates a fresh `j` binding per iteration, copied forward on each step.

Output: `var 3`, `var 3`, `var 3`, `let 0`, `let 1`, `let 2`.

## Worked example 4: `await` of a non-promise, then a timer

```js
async function f() {
  console.log(1)
  await null
  console.log(2)
  await new Promise((r) => setTimeout(r))
  console.log(3)
}
f()
setTimeout(() => console.log(4))
Promise.resolve().then(() => console.log(5))
console.log(6)
```

```text
sync:  log 1; await null -> micro [f-cont]
       timer-4 -> tasks [timer-4]; then-5 -> micro [f-cont, then-5]; log 6
micro: f-cont logs 2, creates timer-r -> tasks [timer-4, timer-r]
       then-5 logs 5
task:  timer-4 logs 4
task:  timer-r resolves the promise -> micro [f-cont2] -> logs 3
```

Output: `1 6 2 5 4 3`. `await null` still yields for one microtask; the second `await` waits for a timer queued after `timer-4`.

## Worked example 5: `finally` costs extra ticks

```js
Promise.resolve(1)
  .finally(() => { console.log('f'); return 2 })
  .then((v) => console.log('then', v))
Promise.resolve()
  .then(() => console.log('a'))
  .then(() => console.log('b'))
  .then(() => console.log('c'))
  .then(() => console.log('d'))
```

Two facts: `finally` ignores its callback's return value and passes `1` through (unless the callback throws or returns a rejected promise), and internally it chains through an extra promise, which adds microtask hops.

Output: `f a b c then 1 d`. Don't try to count every internal hop in an interview; say "`finally` passes the value through and takes a few extra microtasks, so the plain chain gets ahead".

## Worked example 6: microtasks between tasks

```js
setTimeout(() => {
  console.log('t1')
  Promise.resolve().then(() => console.log('m1'))
  setTimeout(() => console.log('t3'))
}, 0)
setTimeout(() => {
  console.log('t2')
  queueMicrotask(() => console.log('m2'))
}, 0)
Promise.resolve().then(() => {
  console.log('m0')
  setTimeout(() => console.log('t4'))
})
```

```text
sync:  tasks [t1, t2]; micro [m0]
micro: m0 -> tasks [t1, t2, t4]
task:  t1 -> micro [m1], tasks [t2, t4, t3]; drain: m1
task:  t2 -> micro [m2]; drain: m2
task:  t4
task:  t3
```

Output: `m0 t1 m1 t2 m2 t4 t3`. The key move is re-entering the microtask queue after each task, and appending new timers to the back.

## Worked example 7: closures, `let` and timers together

```js
for (var i = 0; i < 2; i++) {
  setTimeout(() => console.log('var', i))
}
for (let j = 0; j < 2; j++) {
  setTimeout(() => console.log('let', j))
}
Promise.resolve().then(() => console.log('micro', i))
```

```text
sync:  tasks [var-cb, var-cb, let-cb(0), let-cb(1)]; micro [micro]; i is now 2
micro: micro 2
tasks: var 2, var 2, let 0, let 1
```

Output: `micro 2`, `var 2`, `var 2`, `let 0`, `let 1`. Scope decides **which value** each callback sees (one shared `i`, a fresh `j` per iteration); the queues decide **when** it prints.

## Worked example 8: async functions calling each other

```js
async function inner() {
  console.log('inner start')
  await null
  console.log('inner end')
}
async function outer() {
  console.log('outer start')
  await inner()
  console.log('outer end')
}
outer()
console.log('sync')
```

```text
sync:  outer start, inner start (both run until their first await)
       inner pauses: micro [inner-resume]; outer pauses on inner's promise
       sync
micro: inner end -> inner's promise fulfils -> micro [outer-resume]
micro: outer end
```

Output: `outer start`, `inner start`, `sync`, `inner end`, `outer end`. Calling an async function runs it synchronously up to its first `await`; the caller then waits for the returned promise.

## Worked example 9: an error in the middle of a chain

```js
Promise.resolve(1)
  .then((v) => {
    console.log('a', v)
    throw new Error('boom')
  })
  .then(() => console.log('b'))
  .catch((e) => {
    console.log('c', e.message)
    return 2
  })
  .then((v) => console.log('d', v))
console.log('e')
```

Output: `e`, `a 1`, `c boom`, `d 2`. The throw rejects the promise returned by the first `then`; `b` is skipped; `catch` recovers with 2, so the chain continues fulfilled.

## Practice set

Try these before reading the answers.

1. `console.log(typeof hoisted); var hoisted = () => {}`
2. `const o = { n: 1, f() { return () => this.n } }; console.log(o.f()())`
3. `setTimeout(() => console.log(1)); (async () => { console.log(2); await 0; console.log(3) })(); console.log(4)`
4. `console.log([1, 2, 3] + [4])`
5. `new Promise((r) => { console.log('x'); r() }).then(() => console.log('y')); console.log('z')`

Answers: (1) `'undefined'`: the `var` exists but holds `undefined` until assigned. (2) `1`: the arrow takes `this` from `f`, called on `o`. (3) `2 4 3 1`. (4) `'1,2,34'`: both arrays become strings. (5) `x z y`: the executor is synchronous, the `then` is a microtask.

## The traps

### `await` of a non-promise still yields

`await 42` wraps the value and resumes in a microtask. Code after it never runs synchronously.

### Returning a promise adds ticks

Returning a thenable from a `.then` callback, or from an `async` function, costs two extra microtask hops because the engine must call its `then` and wait for it. `return await p` in an `async` function is actually one hop faster than `return p`.

```js
async function a() { return 'a' }
async function b() { return Promise.resolve('b') }
async function c() { return await Promise.resolve('c') }
b().then(console.log); c().then(console.log); a().then(console.log)
// a, c, b
```

### `setTimeout(fn, 0)` never beats a microtask

Any microtask queued during the current task runs before any timer, no matter the order of the lines. Between `setTimeout` and `requestAnimationFrame` there is no guaranteed order; say so.

### The executor is synchronous

```js
new Promise((resolve) => { console.log('A'); resolve(); console.log('B') })
  .then(() => console.log('C'))
console.log('D')
// A B D C
```

`resolve()` doesn't stop the executor, and calling `resolve` twice does nothing the second time.

### Errors skip `then` until a `catch`

A rejection travels down the chain skipping fulfilment handlers, and after a `.catch` handles it the chain continues fulfilled with the catch's return value. Each skipped handler still costs a microtask hop, which matters when two chains interleave.

### `var` vs function in the same block

Function declarations inside blocks behave differently in sloppy vs strict mode. If the snippet relies on that, say which mode you assume; interviewers rarely want the Annex B rules.

## Common interview questions

**Why does `await` on an already-resolved promise still delay the code after it?**
`await` always schedules the continuation as a microtask, even for settled promises or plain values. That guarantees async functions behave the same regardless of whether a value is ready.

**What's the order of `process.nextTick`, promises and `setImmediate` in Node?**
`nextTick` callbacks run before promise microtasks, both before any timer or immediate. `setImmediate` runs in the check phase after I/O; its order relative to `setTimeout(fn, 0)` from the main module isn't deterministic.

**Why do two `.then` chains alternate?**
Each handler only queues the next handler in its chain when it runs. Two chains started in the same task therefore take turns, one step each, as the microtask queue drains.

**What does `Promise.resolve().then(() => setTimeout(log, 0))` versus `setTimeout(log, 0)` change?**
The first queues the timer later, from inside a microtask, so it lands behind any timers already scheduled in the current task. Timers with equal delays run in the order they were created.

**How do you approach a snippet you can't fully trace?**
Split it: give the certain parts (sync output first, all microtasks before timers) and name the uncertain point explicitly, such as the exact tick count after a `finally`. Interviewers accept "this part depends on extra hops" when the rest is right.

**Does `typeof` an undeclared variable throw?**
No, it returns `"undefined"`. But `typeof` on a `let` or `const` in its temporal dead zone throws a `ReferenceError`.

**What changes if the snippet isn't in strict mode?**
Plain function calls get `this === globalThis` instead of `undefined`, and assigning to an undeclared name creates a global instead of throwing. Classes and ES modules are always strict.

## Key takeaways

- Solve in passes: hoisting and scope, then synchronous output, then microtasks, then tasks.
- Drain the whole microtask queue after the script and after every task.
- Scope decides which value a callback sees; the queues decide when it runs.
- Async functions run synchronously until their first `await`; even `await` of a plain value yields.
- Explain each step as you go: interviewers grade the reasoning, not just the final line.
