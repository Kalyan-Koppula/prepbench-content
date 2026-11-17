**Key insight:** SameValue differs from `===` in exactly two places, and each has a one-expression test: `x !== x` detects `NaN`, and `1 / x` tells `+0` (`Infinity`) from `-0` (`-Infinity`).

## Approach

1. If `a === b`, they're the same unless they are the two zeros: return `a !== 0 || 1 / a === 1 / b`.
2. Otherwise they're different unless both are `NaN`: return `a !== a && b !== b`.

## Pitfalls

- `isNaN(a) && isNaN(b)`: the global `isNaN` coerces, so `isNaN('abc')` is true and `objectIs('abc', 'xyz')` would be true. Use `Number.isNaN` or `x !== x`.
- `String(a) === String(b)`: `String(-0)` is `"0"`, and objects collapse to `"[object Object]"`.
- `Math.sign`: `Math.sign(-0)` is `-0`, which `===` still can't distinguish from `0`.

## Follow-ups interviewers add

- **Three equalities in JS:** `==`, `===`, SameValue, plus SameValueZero (used by `Map`, `Set` and `includes`: like `Object.is` but `+0` equals `-0`). Where is each used?
- **`[NaN].indexOf(NaN)` vs `[NaN].includes(NaN)`:** why do they disagree?
- **React:** why `useState` and `useEffect` deps use `Object.is`, and what that means for objects and arrays.
- **Shallow equal:** build `shallowEqual(a, b)` with `objectIs` per key.
