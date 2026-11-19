**Key insight:** `bind` is a closure over `(target, thisArg, presets)` that forwards with `apply`, plus one branch: when the bound function is called with `new`, behave like `new target(...)` instead.

## Approach

1. In `myBind`, `this` is the target. Throw a `TypeError` if it isn't a function.
2. Return a regular `function bound(...args)`:
   - Combine `[...presets, ...args]` into a fresh array each call.
   - If `new.target` is set (called with `new`), create `instance = Object.create(target.prototype)`, run `target.apply(instance, allArgs)`, and return the target's result if it's an object or function, otherwise `instance`.
   - Otherwise return `target.apply(thisArg, allArgs)`.
3. Re-binding works automatically: the outer bound function ignores any `this` it receives.

A pre-ES2015 alternative to `new.target`: set `bound.prototype = Object.create(target.prototype)` and check `this instanceof bound`.

## Walkthrough

```js
function Point(x, y) { this.x = x; this.y = y }
const PointAt1 = Point.myBind({ ignored: true }, 1)
```

| Call | `new.target`? | Behaviour | Result |
| --- | --- | --- | --- |
| `PointAt1(2)` | no | `Point.apply({ ignored: true }, [1, 2])` | sets `x`, `y` on the bound object |
| `new PointAt1(2)` | yes | create an instance of `Point.prototype`, call `Point` on it | a `Point` with `x = 1`, `y = 2` |

Preset arguments are always applied first. When called with `new`, the bound `this` is ignored, matching native `bind`.

## Complexity

`O(p + a)` per call to combine arguments.

## Edge cases to test

- `this` is fixed for normal calls.
- Presets come before call arguments.
- `new` on the bound function creates an instance of the original constructor.
- A constructor returning an object overrides the instance.
- Binding a non-function throws.

## Pitfalls

- Returning an arrow function: you can't call it with `new` at all.
- Ignoring `new`: `new Bound()` then writes properties onto the bound `thisArg` object and returns a plain object that isn't `instanceof Target`.
- `bound.prototype = target.prototype` (sharing instead of inheriting): adding methods to one adds them to the other.
- Pushing call arguments onto `presets`, so they accumulate across calls.

## Follow-ups interviewers add

- **`name` and `length`:** native bound functions are named `"bound fn"` and have `length = max(0, fn.length - presets.length)`. Set them with `Object.defineProperty`.
- **`instanceof Bound`:** natively `new Bound() instanceof Bound` is true; which of the two implementations above gets that right?
- **Classes:** `target.apply` throws for `class` constructors; `Reflect.construct(target, args, new.target)` fixes it.
- **Arrow functions:** what does `arrow.bind(obj)` do (nothing to `this`, presets still apply)?

## In the interview

Write the simple version first (`return (...args) => fn.apply(thisArg, [...presets, ...args])`), then add `new` support, which is what interviewers check for the senior answer. Mention `name` (`'bound fn'`) and `length` as details native `bind` also sets.
