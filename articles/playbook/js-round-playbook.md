---
title: The JavaScript Round
order: 4
summary: How the first-round JS screen is run — the six question formats, a 45-minute timeline, and what separates "hire" from "lean hire".
---

The first frontend round is usually a 45–60 minute phone or video screen in a shared editor, often with no runner and no autocomplete. It tests whether you can write correct JavaScript fluently, reason about async code, and talk while you work. It is narrower than a DSA round but less forgiving of sloppy edges: a `debounce` that loses `this` reads as "doesn't really know the language".

## The six formats

| Format | Typical prompt | What they are really checking |
|---|---|---|
| Utility implementation | `debounce`, `throttle`, `deepClone`, `get(obj, 'a.b[0].c')`, `memoize`, `curry` | Closures, argument handling, edge cases, clean API |
| Polyfill | `Array.prototype.map`, `Function.prototype.bind`, `Promise.all`, `Object.assign` | Spec awareness: holes, `thisArg`, iterables, ordering |
| Async | Retry with backoff, concurrency pool, `promisify`, sequential runner, cancellable fetch | Promise mechanics, error propagation, no unhandled rejections |
| Output prediction | "What does this log?" with hoisting, `this`, promises and timers | A repeatable method, not memorised answers |
| Trivia | `==` vs `===`, closures, prototype chain, `var`/`let`, event delegation | Crisp definitions with one example each |
| Small UI | Star rating, tabs, autocomplete, todo list in vanilla JS or React | DOM fluency, state, events, accessibility basics |

Most screens mix two or three: one implementation question with follow-ups, and a few minutes of trivia or output prediction at the start or end.

## A 45-minute timeline

```text
0–3    Intros. Keep yours to 30 seconds.
3–8    Read the prompt, clarify the API, write 2–3 example calls.
8–25   Implement the core version. Narrate decisions, not keystrokes.
25–32  Run examples by hand or in the console; fix bugs out loud.
32–40  Follow-ups: options (leading/trailing), cancellation, edge cases.
40–45  Your questions for them.
```

If the interviewer has a second question planned, they will cut follow-ups short. Finishing the first question cleanly by minute 25 is what makes room for it, and two solved questions almost always beats one polished one.

## Clarify the API before typing

Write the signature and example calls as comments. This takes ninety seconds and removes most of the ambiguity that causes rewrites.

```js
// debounce(fn, wait, { leading = false } = {}) -> debounced
// debounced(...args): resets the timer; calls fn with the last args and this
// debounced.cancel(): drops a pending call
//
// const log = debounce(console.log, 100)
// log(1); log(2); log(3)  -> after 100ms: 3
```

Questions worth asking for most utilities:

- What should be returned, and is it sync or a promise?
- Should `this` and all arguments be forwarded?
- What happens with invalid input: throw, return `undefined`, or ignore?
- For collections: arrays only, or any iterable? Are holes or `undefined` values meaningful?
- For deep operations: cycles, `Date`, `Map`, `Set`, class instances, symbols as keys?
- For async: should failures reject immediately or be collected? Is cancellation needed?

Ask two or three that matter; don't interrogate. If they say "your call", state the choice and move on.

## Write tests as you go

You rarely get a test runner, so build a tiny harness in the first minute and keep adding cases. It signals discipline and catches the bugs before the interviewer does.

```js
const eq = (actual, expected, label) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  console.log(ok ? 'pass' : 'FAIL', label, ok ? '' : { actual, expected })
}

eq(get({ a: { b: [1, 2] } }, 'a.b[1]'), 2, 'array index')
eq(get({ a: null }, 'a.b'), undefined, 'null in the middle')
eq(get({}, 'x', 'dflt'), 'dflt', 'default value')
```

Order cases from happy path to edges: empty input, one element, duplicates, `null`/`undefined`, very large input, and anything async that rejects. See the testing-and-debugging-live article for the full harness and async assertions.

## Edge cases interviewers keep in their pocket

- `this` forwarding in wrappers (`debounce`, `memoize`, `once`): use a `function`, not an arrow, for the returned wrapper and call `fn.apply(this, args)`.
- Arguments: forward all of them with rest/spread, not just the first.
- Sparse arrays in array polyfills: check `i in arr` before calling the callback.
- `reduce` with no initial value on an empty array throws `TypeError`.
- Promise utilities with an empty input should resolve (`all`) or reject (`any`) immediately.
- Non-promise values in promise utilities: wrap with `Promise.resolve`.
- Cycles in `deepClone`/`deepEqual`: track seen objects in a `WeakMap`.
- Keys that are numbers vs strings, `NaN` as a `Map` key, `-0` vs `0`.

## Talking through complexity

For utilities, complexity is short but expected. Say it once at the end, unprompted:

- `memoize` with `JSON.stringify` keys: O(size of args) per call to build the key, unbounded memory unless you add an LRU.
- `deepClone`: O(n) time and space in the number of reachable values; the `WeakMap` adds O(n) space.
- Concurrency pool: O(n) total work, at most `limit` promises in flight.
- `flatten` recursive: O(total elements), but recursion depth equals nesting depth; mention an iterative stack version for very deep input.

## Recovering when stuck

1. Say what you know: "I need the last arguments available when the timer fires, so they have to live in the closure."
2. Shrink the problem. Solve without options, without `this`, or for arrays only, then extend.
3. Write the example trace by hand: the state after each call usually reveals the missing variable.
4. Ask a targeted question: "Is it acceptable if `leading` and `trailing` both fire for a single call?" Interviewers give hints to people who ask precise questions.
5. If a bug resists for more than two minutes, add a `console.log` of the state at the suspicious line and move on reasoning from the output.

Silence is the expensive failure mode. A wrong idea spoken aloud gets corrected; a right idea kept silent earns nothing.

## What earns "hire" vs "lean hire"

| Signal | Hire | Lean hire |
|---|---|---|
| Correctness | Core version works on first run or after one self-found fix | Works after the interviewer points out bugs |
| Edges | Raises `this`, empty input, errors before being asked | Handles them when prompted |
| Code quality | Small named helpers, clear variable names, no dead code | Works but tangled; one giant function |
| Communication | Explains trade-offs ("I use a `WeakMap` so clones don't leak") | Narrates keystrokes or goes quiet |
| Follow-ups | Extends cleanly (cancel, flush, options) without rewriting | Needs a rewrite or runs out of time |
| Language depth | Knows why, e.g. why `forEach` doesn't await | Knows the idiom but not the reason |

"Lean hire" usually means the code worked but the interviewer had to drive. The fix is almost always the same: clarify early, test before saying "done", and name edge cases yourself.

## Common interview questions

**Should I use TypeScript in a JS round?**
Only if the interviewer says it's fine and you're fast with it. Type annotations cost time and can distract from the logic; plain JS with a JSDoc-style signature comment is usually the safer choice.

**What if I've seen the question before?**
Say so briefly and offer to solve it anyway or take a different one. Most interviewers appreciate the honesty and will either continue or swap; pretending usually shows when you skip the reasoning.

**How much should I optimise a utility?**
Get a correct, readable version first and state its complexity. Optimise only when the interviewer asks or when the naive version is obviously wrong for the use case, such as unbounded memoize caches.

**Is it OK to look things up?**
Ask first. Many screens allow MDN for an API signature, but searching for the whole solution is usually disallowed. Knowing the common signatures (`addEventListener` options, `Promise.allSettled` result shape) avoids the question.

**How do I handle a question I can't finish?**
Describe the remaining steps precisely and leave the code in a state that runs for the cases you handled. A clear plan for the rest plus a working subset scores better than a broken complete attempt.

**What do I do when the interviewer says "this has a bug"?**
Don't guess-edit. Ask for or construct the failing input, trace it line by line out loud, then fix. Thanking them and explaining the root cause turns the bug into a positive signal.

**How important is code style?**
Moderately. Consistent naming, early returns and small helpers help the interviewer follow you. Formatting nitpicks rarely matter; unreadable nesting does.
