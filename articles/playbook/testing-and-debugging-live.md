---
title: Testing and Debugging Live
order: 5
summary: Quick in-interview tests with console asserts and a tiny expect, debugging without a debugger, and the four classic bugs to check first.
---

In a coding screen, "it works" means "I showed it works". Candidates who test as they go find their own bugs, which interviewers score far higher than bugs the interviewer has to point out. You need a harness you can type in under a minute and a short list of bugs to suspect first.

## The one-line assert

`console.assert` is built in and prints only on failure, which keeps the output readable.

```js
console.assert(sum([1, 2, 3]) === 6, 'sums positives')
console.assert(sum([]) === 0, 'empty array is 0')
```

Its limits: it compares with whatever expression you write, so objects need a deep comparison, and in some environments a failed assert doesn't show the actual value. That's why a slightly bigger helper pays off.

## A tiny `expect`

```js
function expect(actual) {
  const show = (v) => JSON.stringify(v)
  const fail = (msg) => { throw new Error(msg) }
  return {
    toBe: (exp) => Object.is(actual, exp) || fail(`${show(actual)} !== ${show(exp)}`),
    toEqual: (exp) => show(actual) === show(exp) || fail(`${show(actual)} != ${show(exp)}`),
    toThrow: () => {
      try { actual() } catch { return true }
      fail('expected function to throw')
    },
  }
}

function test(name, fn) {
  try { fn(); console.log('ok  ', name) }
  catch (e) { console.log('fail', name, '-', e.message) }
}

test('flattens one level', () => expect(flat([1, [2, [3]]], 1)).toEqual([1, 2, [3]]))
test('rejects negative depth', () => expect(() => flat([], -1)).toThrow())
```

`JSON.stringify` equality is a deliberate shortcut: it is sensitive to key order, drops `undefined` and functions, and turns `NaN` into `null`. Say so if the data could trip it, and swap in a `deepEqual` only if needed.

### Async tests

```js
async function testAsync(name, fn) {
  try { await fn(); console.log('ok  ', name) }
  catch (e) { console.log('fail', name, '-', e.message) }
}

await testAsync('retries then succeeds', async () => {
  let calls = 0
  const flaky = async () => { if (++calls < 3) throw new Error('boom'); return 'ok' }
  expect(await retry(flaky, { retries: 3, delay: 0 })).toBe('ok')
  expect(calls).toBe(3)
})

await testAsync('rejects after exhausting retries', async () => {
  const always = async () => { throw new Error('nope') }
  let caught
  try { await retry(always, { retries: 2, delay: 0 }) } catch (e) { caught = e }
  expect(caught?.message).toBe('nope')
})
```

For timing-based utilities (`debounce`, `throttle`), use small real delays and a recorder instead of fake timers:

```js
const calls = []
const d = debounce((x) => calls.push(x), 20)
d(1); d(2); d(3)
setTimeout(() => console.log(calls), 50) // expect [3]
```

## Choosing test cases

Write cases in this order and say why each exists:

1. The example from the prompt.
2. Empty input (`[]`, `''`, `{}`), and a single element.
3. Boundaries: first and last index, zero, negative, exactly-at-limit values.
4. Duplicates and ordering (stable sort, insertion order of keys).
5. Wrong types or `null`/`undefined` if the API should handle them.
6. For async: rejection, mixed resolved and pending values, and an empty input.

Five well-chosen cases beat twenty random ones. Interviewers listen for whether you know which inputs are dangerous.

## Debugging without a debugger

Most interview editors have no breakpoints. Use these instead, in this order:

- **Trace by hand.** Pick the smallest failing input and walk the code line by line, writing variable values as comments. Most bugs show up within three lines of the trace.
- **Log state, not messages.** `console.log({ i, lo, hi, mid })` prints names with values; `console.log('here')` tells you nothing.
- **Bisect.** Comment out half of the logic or return early with an intermediate value, check it, then move the cut.
- **Check assumptions explicitly.** `console.assert(Array.isArray(items), items)` at the top of a function catches the "it was a NodeList" class of bugs.
- **Label async logs.** Prefix logs with the call index or a timestamp to see interleaving: `console.log(performance.now().toFixed(0), 'start', id)`.
- **`console.table`** for arrays of objects, when the environment supports it.

## Narrating while you debug

Say the hypothesis before you test it: "I think `count` is being read before the promise resolves, so I'll log it inside the `then`." If the log disproves it, say that too and form the next hypothesis. Interviewers are scoring the method; a calm, systematic hunt often earns more credit than a first-time pass.

Avoid random edits. Changing `<` to `<=` "to see if it helps" without a reason signals guessing.

## The classic bugs to suspect first

### Off-by-one

```js
// Bug: misses the last chunk when length isn't a multiple of size
for (let i = 0; i + size < arr.length; i += size) out.push(arr.slice(i, i + size))

// Fix: loop while i < length; slice clamps the end for you
for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
```

Check loop bounds against an input of length 0, 1 and exactly `size`.

### Lost `this`

```js
const counter = {
  n: 0,
  inc() { this.n++ },
}
const btn = document.querySelector('button')
btn.addEventListener('click', counter.inc) // this === btn; counter.n never changes

btn.addEventListener('click', () => counter.inc()) // fix: call it as a method
```

In wrappers like `debounce`, the bug is using an arrow for the returned function and then `fn.apply(this, args)`: the arrow's `this` is the outer scope's, not the caller's.

### Stale closure

```js
function Timer() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setCount(count + 1), 1000) // always 0 + 1
    return () => clearInterval(id)
  }, [])
  return count
}
// Fix: setCount((c) => c + 1), or include count in the deps
```

Outside React, the same bug appears when a callback captures a variable that is later reassigned, or with `var` in a loop.

### Unhandled rejection

```js
async function loadAll(ids) {
  const promises = ids.map(fetchUser)
  const first = await promises[0]           // if promises[1] rejects meanwhile,
  return [first, ...(await Promise.all(promises.slice(1)))] // it's briefly unhandled
}
```

Symptoms: an "Uncaught (in promise)" error or a silent failure when an `async` function is called without `await` or `.catch`. Fixes: attach handlers immediately (`Promise.all` over the whole array), never fire-and-forget without a `.catch`, and remember `forEach(async …)` drops every returned promise.

## Before you say "done"

- Rerun every test after the last change.
- Read the function top to bottom once more, checking each early return.
- Remove debug logs or say you'd remove them.
- State complexity and the cases you deliberately didn't handle.

## Common interview questions

**Why not just use Jest-style syntax in the editor?**
There is usually no test runner, so `describe`/`it` won't exist. A ten-line `test`/`expect` gives the same readability and works anywhere.

**How many tests should I write?**
Enough to cover the example, empty input, one boundary and one failure path, typically four to six. Add more only when a case exercises a branch you haven't hit.

**What if my tests pass but the interviewer finds a bug?**
Add their case as a test first, watch it fail, then fix. That shows you treat tests as the spec rather than as decoration.

**How do you debug async ordering issues without breakpoints?**
Log with labels and timestamps at each await boundary, then compare against the expected queue order. Often the fix is attaching a handler earlier or awaiting the right promise.

**When is `JSON.stringify` comparison wrong?**
When values include `undefined`, functions, symbols, `NaN`, `Infinity`, `Map`/`Set`, or when key order differs between objects that are otherwise equal. For those, use a recursive `deepEqual`.

**How do you test a debounce without fake timers?**
Call it several times synchronously, then check the recorder inside a `setTimeout` longer than the wait. Mention that in a real suite you'd use fake timers to make the test fast and deterministic.
