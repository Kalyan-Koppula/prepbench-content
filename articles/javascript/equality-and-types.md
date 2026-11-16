---
title: Equality and Types
order: 6
summary: The coercion rules behind ==, Object.is and SameValueZero, typeof quirks, NaN, floating-point precision and BigInt.
---

Coercion puzzles are a staple of JavaScript screens. You don't need to memorise every row of the table; you need the few rules that generate it, the famous edge cases, and a clear stance: use `===` and explicit conversion in real code.

## Types

Seven primitives — `undefined`, `null`, `boolean`, `number`, `bigint`, `string`, `symbol` — plus objects (including arrays and functions). Primitives are immutable and compared by value; objects are compared by reference.

```js
{} === {}         // false: different references
const a = [1]
a === a           // true
```

## Strict vs loose equality

`===` compares type and value with no conversion (only quirks: `NaN !== NaN`, `+0 === -0`).

`==` follows a short algorithm:

1. Same type → behave like `===`.
2. `null == undefined` is true; `null` and `undefined` equal nothing else.
3. Number vs string → convert the string to a number.
4. Boolean vs anything → convert the boolean to a number first (`true → 1`).
5. Object vs primitive → convert the object with `ToPrimitive` (`valueOf`, then `toString`) and retry.
6. BigInt vs number or string → compare mathematical values.

## Coercion highlights

| Expression | Result | Why |
|---|---|---|
| `null == undefined` | `true` | Special rule |
| `null == 0` | `false` | `null` only equals `undefined` |
| `null >= 0` | `true` | Relational operators convert `null` to `0` |
| `undefined == 0` | `false` | Special rule |
| `'' == 0` | `true` | `''` → `0` |
| `'0' == 0` | `true` | `'0'` → `0` |
| `'' == '0'` | `false` | Same type, different strings |
| `true == '1'` | `true` | `true` → `1`, `'1'` → `1` |
| `true == 'true'` | `false` | `true` → `1`, `'true'` → `NaN` |
| `[] == false` | `true` | `false` → `0`, `[]` → `''` → `0` |
| `[] == ![]` | `true` | `![]` is `false` (objects are truthy) |
| `[0] == false` | `true` | `[0]` → `'0'` → `0` |
| `[1, 2] == '1,2'` | `true` | Array `toString` joins with commas |
| `NaN == NaN` | `false` | `NaN` is never equal to anything |
| `1n == 1` | `true` | Mathematical comparison |

`if ([])` runs, yet `[] == false` is true: truthiness and `==` are different operations.

### The `+` operator

If either operand is a string after `ToPrimitive`, `+` concatenates; otherwise it adds numerically.

```js
'5' + 2       // '52'
'5' - 2       // 3
true + true   // 2
[] + []       // ''
[] + {}       // '[object Object]'
+[]           // 0
null + 1      // 1
undefined + 1 // NaN
'b' + 'a' + +'a' + 'a' // 'baNaNa'
```

Falsy values: `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined`, `NaN`. Everything else is truthy, including `'0'`, `'false'`, `[]` and `{}`.

## Three kinds of sameness

| Algorithm | Used by | `NaN` vs `NaN` | `+0` vs `-0` |
|---|---|---|---|
| Strict equality | `===`, `indexOf`, `switch` | not equal | equal |
| SameValueZero | `includes`, `Map`/`Set` keys | equal | equal |
| SameValue | `Object.is` | equal | not equal |

```js
[NaN].indexOf(NaN)   // -1
[NaN].includes(NaN)  // true
Object.is(-0, 0)     // false
```

## typeof quirks

| Expression | Result |
|---|---|
| `typeof null` | `'object'` (historical bug) |
| `typeof []` | `'object'` — use `Array.isArray` |
| `typeof function () {}` / `typeof class {}` | `'function'` |
| `typeof NaN` | `'number'` |
| `typeof 10n` | `'bigint'` |
| `typeof Symbol()` | `'symbol'` |
| `typeof undeclaredVar` | `'undefined'` (no error) |
| `typeof letInTdz` | ReferenceError |

A robust type tag: `Object.prototype.toString.call(value)` returns `'[object Date]'`, `'[object Null]'`, etc.

## NaN

- Produced by failed numeric conversions and invalid maths (`0 / 0`, `Math.sqrt(-1)`, `Number('abc')`).
- `isNaN(x)` coerces first (`isNaN('abc')` is `true`); `Number.isNaN(x)` checks for the actual value. Prefer the latter.
- `x !== x` is true only for `NaN`.

## Numbers and precision

All `number`s are IEEE 754 doubles.

```js
0.1 + 0.2                    // 0.30000000000000004
0.1 + 0.2 === 0.3            // false
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON // true — tolerance compare
Number.MAX_SAFE_INTEGER      // 9007199254740991 (2^53 - 1)
9007199254740993             // 9007199254740992: precision lost
(1.005).toFixed(2)           // '1.00': 1.005 is stored slightly below
```

- Represent money as integer minor units (cents) or use a decimal library; format with `Intl.NumberFormat`.
- `Number.isInteger`, `Number.isSafeInteger` validate integers.
- `Math.max()` is `-Infinity`; `Math.min()` is `Infinity`.
- Division by zero gives `Infinity` or `-Infinity`, not an error.

### Parsing traps

```js
['1', '2', '3'].map(parseInt) // [1, NaN, NaN]: index is passed as the radix
parseInt(0.0000005)           // 5: the number stringifies to '5e-7'
parseInt('42px')              // 42; Number('42px') is NaN
Number('')                    // 0; Number(' ') is 0 too
[10, 1, 2].sort()             // [1, 10, 2]: default sort compares strings
```

## BigInt

Arbitrary-precision integers, written with an `n` suffix.

```js
2n ** 64n      // 18446744073709551616n
7n / 2n        // 3n: division truncates toward zero
1n + 1         // TypeError: can't mix BigInt and Number
1n == 1        // true
1n === 1       // false: different types
BigInt(2 ** 53) + 1n // exact
```

- No implicit mixing with `number`; convert explicitly with `BigInt(n)` or `Number(b)`.
- `Math.*` functions don't accept BigInt; unary `+10n` throws.
- `JSON.stringify` throws on BigInt; add a `toJSON` or serialise as a string.
- Use for IDs from 64-bit systems, cryptography, or exact large-integer arithmetic.

## Common interview questions

**Why does `[] == ![]` evaluate to true?**
`![]` is `false` because arrays are truthy. Then `[] == false` converts `false` to `0` and `[]` to `''` then `0`, so `0 == 0`.

**When is `==` acceptable?**
The common idiom `x == null` checks for both `null` and `undefined` in one go. Elsewhere, use `===`.

**How does `Object.is` differ from `===`?**
It treats `NaN` as equal to itself and distinguishes `+0` from `-0`. Otherwise identical.

**Why is `0.1 + 0.2 !== 0.3`?**
Neither 0.1 nor 0.2 is exactly representable in binary floating point; the rounding errors add up to a value slightly above 0.3.

**How do you reliably check for an array or plain object?**
`Array.isArray(x)` for arrays (works across realms). For plain objects, check `Object.prototype.toString.call(x) === '[object Object]'` and that its prototype is `Object.prototype` or `null`.

**What's the difference between `null` and `undefined`?**
`undefined` means "no value assigned" (missing args, missing properties, uninitialised `var`). `null` is an intentional empty value set by code. JSON has `null` but drops `undefined` properties.

## Pitfalls

- Using `||` for defaults when `0` or `''` is valid; use `??`.
- Comparing objects or arrays with `===` expecting deep equality.
- Sorting numbers without `(a, b) => a - b`.
- Trusting `isNaN` with non-number input.
- Storing 64-bit IDs from an API as numbers and silently losing precision.
