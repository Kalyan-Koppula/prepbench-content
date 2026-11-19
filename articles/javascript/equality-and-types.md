---
title: Equality and Types
order: 6
summary: The coercion rules behind ==, Object.is and SameValueZero, typeof quirks, NaN, floating-point precision and BigInt.
---

Coercion puzzles are a staple of JavaScript screens. You don't need to memorise every row of the coercion table. You need the handful of conversion rules that generate it, the ability to trace an expression step by step, a few famous edge cases, and a clear stance for real code: use `===` and explicit conversions.

## The types

JavaScript has seven **primitive** types and one **object** type:

| Type | Examples | Notes |
| --- | --- | --- |
| `undefined` | `undefined` | Missing value: unassigned variables, missing properties and arguments |
| `null` | `null` | Intentional "no value" |
| `boolean` | `true`, `false` | |
| `number` | `42`, `3.14`, `NaN`, `Infinity` | 64-bit floating point |
| `bigint` | `42n` | Arbitrary-precision integers |
| `string` | `'hi'` | Immutable UTF-16 sequences |
| `symbol` | `Symbol('id')` | Unique keys |
| object | `{}`, `[]`, functions, dates, maps | Everything else |

Primitives are immutable and compared **by value**. Objects are compared **by reference**: two objects are equal only if they are the same object.

```js
'abc' === 'abc' // true: same value
{} === {} // false: two different objects
const a = [1]
const b = a
a === b // true: same reference
```

## The three conversions that power everything

Every coercion in JavaScript is built from three abstract operations. Learn their tables and you can trace any expression.

### ToBoolean (truthiness)

There are exactly eight **falsy** values: `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined` and `NaN`. Everything else is truthy, including `'0'`, `'false'`, `' '`, `[]`, `{}` and `new Boolean(false)`.

### ToNumber

| Input | Result |
| --- | --- |
| `undefined` | `NaN` |
| `null` | `0` |
| `true` / `false` | `1` / `0` |
| `''` or only whitespace | `0` |
| `'42'`, `' 42 '`, `'0x1A'`, `'1e3'` | `42`, `42`, `26`, `1000` |
| `'42px'`, `'abc'` | `NaN` |
| Symbol | TypeError |
| BigInt (via `Number()`) | The value, possibly rounded; implicit conversion throws |
| Object | ToPrimitive with hint "number", then ToNumber |

### ToPrimitive (objects to primitives)

When an object meets an operator that needs a primitive, JavaScript calls ToPrimitive with a **hint**:

1. If the object has a `[Symbol.toPrimitive]` method, call it with the hint (`'number'`, `'string'` or `'default'`).
2. Otherwise, for hint `'string'`, try `toString()` then `valueOf()`; for `'number'` or `'default'`, try `valueOf()` then `toString()`. Use the first one that returns a primitive.

For plain objects and arrays, `valueOf()` returns the object itself (not a primitive), so `toString()` decides:

| Object | `toString()` result |
| --- | --- |
| `{}` | `'[object Object]'` |
| `[]` | `''` |
| `[1, 2]` | `'1,2'` |
| `[null]`, `[undefined]` | `''` |
| `[[1], [2, 3]]` | `'1,2,3'` |
| `new Date(0)` | A date string (dates prefer string for the `'default'` hint) |
| `function f() {}` | The function's source text |

You can see the hints in action:

```js
const temperature = {
  [Symbol.toPrimitive](hint) {
    if (hint === 'number') return 21
    if (hint === 'string') return '21°C'
    return 'default'
  },
}
+temperature // 21
`${temperature}` // '21°C'
temperature + '' // 'default' (+ uses the 'default' hint)
```

## Strict equality: `===`

`===` compares type and value with no conversion. Different types are never equal. Two quirks come from the floating-point standard:

- `NaN === NaN` is `false`.
- `+0 === -0` is `true`.

## Loose equality: `==`

`==` runs a short algorithm. Apply the first rule that matches, then repeat with the converted values:

1. **Same type**: behave like `===`.
2. **`null` and `undefined`**: equal to each other and to **nothing else**.
3. **Number and string**: convert the string to a number.
4. **Boolean and anything**: convert the boolean to a number (`true → 1`, `false → 0`).
5. **Object and primitive**: convert the object with ToPrimitive (hint `'default'`).
6. **BigInt and number or string**: compare the mathematical values.
7. Anything else: `false`.

Note rule 4: booleans are converted to **numbers**, not the other way around. That is why `x == true` is a bad truthiness test.

### Worked traces

**`[] == ![]`**

| Step | Expression | Rule |
| --- | --- | --- |
| 1 | `![]` → `false` | Arrays are truthy, so `!` gives `false` |
| 2 | `[] == false` | Boolean → number |
| 3 | `[] == 0` | Object → primitive: `[].toString()` is `''` |
| 4 | `'' == 0` | String → number: `''` is `0` |
| 5 | `0 == 0` | `true` |

**`true == 'true'`**

| Step | Expression | Rule |
| --- | --- | --- |
| 1 | `1 == 'true'` | Boolean → number |
| 2 | `1 == NaN` | String → number: `'true'` is `NaN` |
| 3 | `false` | `NaN` equals nothing |

**`null == 0` versus `null >= 0`**

`null == 0` is `false` because of rule 2: `null` only equals `null` and `undefined`. But `>=` is a **relational** operator, which converts both sides to numbers: `0 >= 0` is `true`. The two operators simply use different algorithms.

### The coercion highlights

| Expression | Result | Why |
| --- | --- | --- |
| `null == undefined` | `true` | Special rule |
| `null == 0` | `false` | `null` only equals `undefined` |
| `null >= 0` | `true` | Relational operators convert `null` to `0` |
| `undefined == 0` | `false` | Special rule |
| `'' == 0` | `true` | `''` → `0` |
| `'0' == 0` | `true` | `'0'` → `0` |
| `'' == '0'` | `false` | Same type, different strings |
| `true == '1'` | `true` | `true` → `1`, `'1'` → `1` |
| `[] == false` | `true` | `false` → `0`, `[]` → `''` → `0` |
| `[0] == false` | `true` | `[0]` → `'0'` → `0` |
| `[1, 2] == '1,2'` | `true` | Arrays join with commas |
| `NaN == NaN` | `false` | `NaN` equals nothing |
| `1n == 1` | `true` | Mathematical comparison |

`if ([])` runs, yet `[] == false` is `true`: truthiness (ToBoolean) and `==` are different operations.

### When is `==` acceptable?

One idiom is widely accepted: `x == null` is true for exactly `null` and `undefined`, a compact check for "missing". Everywhere else, use `===`, so the reader doesn't have to run the algorithm in their head.

## Relational comparison: `<`, `>`, `<=`, `>=`

1. Convert both operands with ToPrimitive (hint `'number'`).
2. If **both** are strings, compare them by UTF-16 code units, character by character.
3. Otherwise convert both to numbers and compare. Any `NaN` makes the result `false`.

```js
'10' < '9' // true: string comparison, '1' < '9'
'10' < 9 // false: numeric comparison, 10 < 9
'B' < 'a' // true: 'B' is 66, 'a' is 97
[2] > 1 // true: [2] → '2' → 2
null < 1 // true: null → 0
undefined < 1 // false: undefined → NaN
```

Use `localeCompare` or `Intl.Collator` to sort human-readable text.

## The `+` operator

`+` is both addition and concatenation:

1. Convert both operands with ToPrimitive (hint `'default'`).
2. If **either** is a string, convert the other to a string and concatenate.
3. Otherwise convert both to numbers and add.

The other arithmetic operators (`-`, `*`, `/`, `%`) always convert to numbers.

```js
'5' + 2 // '52'
'5' - 2 // 3
true + true // 2
[] + [] // '': both become ''
[] + {} // '[object Object]'
1 + [2] // '12': [2] → '2', then concatenation
null + 1 // 1
undefined + 1 // NaN
'b' + 'a' + +'a' + 'a' // 'baNaNa': +'a' is NaN
```

Unary `+x` is ToNumber: `+''` is 0, `+[]` is 0, `+{}` is NaN, `+'3'` is 3.

## Three kinds of sameness

| Algorithm | Used by | `NaN` vs `NaN` | `+0` vs `-0` |
| --- | --- | --- | --- |
| Strict equality | `===`, `indexOf`, `switch` | not equal | equal |
| SameValueZero | `includes`, `Map` and `Set` keys | equal | equal |
| SameValue | `Object.is` | equal | not equal |

```js
;[NaN].indexOf(NaN) // -1
;[NaN].includes(NaN) // true
new Set([NaN, NaN]).size // 1
Object.is(-0, 0) // false
Object.is(NaN, NaN) // true
```

React uses `Object.is` to decide whether state changed, which is why setting the same object (even after mutating it) doesn't re-render.

## Deep equality

None of the built-in operators compare objects structurally. A minimal deep equal for plain data:

```js
function deepEqual(a, b) {
  if (Object.is(a, b)) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false
  }
  if (Array.isArray(a) !== Array.isArray(b)) return false
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  for (const key of keysA) {
    if (!Object.hasOwn(b, key) || !deepEqual(a[key], b[key])) return false
  }
  return true
}
```

In an interview, mention what this doesn't handle: cycles (track visited pairs in a `Map`), dates and regexes, maps and sets, prototypes and symbol keys.

## `typeof` quirks

| Expression | Result |
| --- | --- |
| `typeof null` | `'object'` (a bug kept for compatibility) |
| `typeof []` | `'object'`: use `Array.isArray` |
| `typeof function () {}`, `typeof class {}` | `'function'` |
| `typeof NaN` | `'number'` |
| `typeof 10n` | `'bigint'` |
| `typeof Symbol()` | `'symbol'` |
| `typeof undeclaredVariable` | `'undefined'` (no error) |
| `typeof letInTemporalDeadZone` | ReferenceError |

`typeof null` dates from the first implementation, where values carried a type tag and `null` was the null pointer, whose tag happened to match objects. Fixing it would have broken existing websites.

A precise type tag: `Object.prototype.toString.call(value)` returns `'[object Array]'`, `'[object Date]'`, `'[object Null]'` and so on.

## NaN

- Produced by failed numeric conversions and invalid maths: `0 / 0`, `Math.sqrt(-1)`, `Number('abc')`, `undefined + 1`.
- It is the only value not equal to itself, so `x !== x` is a NaN test.
- `isNaN(x)` converts first (`isNaN('abc')` is `true`). `Number.isNaN(x)` checks for the actual `NaN` value. Prefer the latter.
- `NaN` spreads: any arithmetic with it gives `NaN`, so it often surfaces far from its cause.

## Numbers and precision

Every `number` is an IEEE 754 double: 52 bits of fraction, an exponent and a sign. Integers are exact up to `2^53 − 1`; most decimal fractions are not exact at all, because they have no finite binary expansion (just as 1/3 has no finite decimal one).

```js
0.1 + 0.2 // 0.30000000000000004
0.1 + 0.2 === 0.3 // false
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON // true: compare with a tolerance
Number.MAX_SAFE_INTEGER // 9007199254740991 (2^53 − 1)
9007199254740993 // prints 9007199254740992: precision lost
;(1.005).toFixed(2) // '1.00': 1.005 is stored slightly below 1.005
```

Practical rules:

- Represent money as integer minor units (cents) or use a decimal library; format with `Intl.NumberFormat`.
- Validate integers with `Number.isInteger` and `Number.isSafeInteger`.
- Division by zero gives `Infinity` or `-Infinity`, not an error. `Math.max()` is `-Infinity`.
- 64-bit IDs from other systems (database keys, tweet IDs) lose precision as numbers. Keep them as strings or `BigInt`.

### Parsing traps

```js
;['1', '2', '3'].map(parseInt) // [1, NaN, NaN]: map passes the index as the radix
parseInt(0.0000005) // 5: the number becomes the string '5e-7'
parseInt('42px') // 42, but Number('42px') is NaN
Number('') // 0; Number(' ') is 0 too
;[10, 1, 2].sort() // [1, 10, 2]: the default sort compares strings
```

## BigInt

Arbitrary-precision integers, written with an `n` suffix.

```js
2n ** 64n // 18446744073709551616n
7n / 2n // 3n: division truncates toward zero
1n + 1 // TypeError: can't mix BigInt and number implicitly
1n == 1 // true
1n === 1 // false: different types
BigInt(2 ** 53) + 1n // exact: 9007199254740993n
```

- No implicit mixing with `number`; convert with `BigInt(n)` or `Number(b)`.
- `Math` functions don't accept BigInt, and unary `+10n` throws.
- `JSON.stringify` throws on BigInt; serialise as a string.
- Use it for 64-bit IDs, cryptography and exact large-integer arithmetic.

## Interview questions

**Why is `[] == ![]` true?**
`![]` is `false` because arrays are truthy. Then `[] == false` converts `false` to 0 and `[]` to `''` and then 0, so it's `0 == 0`.

**When is `==` acceptable?**
`x == null` checks for both `null` and `undefined`. Elsewhere use `===`.

**How does `Object.is` differ from `===`?**
It treats `NaN` as equal to itself and distinguishes `+0` from `-0`.

**Why is `0.1 + 0.2 !== 0.3`?**
Neither 0.1 nor 0.2 is exactly representable in binary floating point; the rounding errors add up to slightly more than 0.3.

**What's the difference between `null` and `undefined`?**
`undefined` means no value has been assigned (missing arguments, properties, uninitialised `var`). `null` is an explicit empty value set by code. JSON has `null` but drops `undefined` properties.

**How do you check for an array or a plain object?**
`Array.isArray(x)` works across realms. For plain objects, check `Object.prototype.toString.call(x) === '[object Object]'` and that the prototype is `Object.prototype` or `null`.

**Why does `'10' < '9'` return true?**
Both are strings, so they are compared character by character, and `'1'` comes before `'9'`.

## Pitfalls

- Using `||` for defaults when `0` or `''` is valid; use `??`.
- Comparing objects or arrays with `===` and expecting structural equality.
- Sorting numbers without a comparator.
- Trusting `isNaN` with non-number input.
- Writing `if (x == true)` instead of `if (x)`.
- Storing 64-bit IDs as numbers.

## Key takeaways

- Three conversions explain all coercion: ToBoolean, ToNumber and ToPrimitive.
- `==` converts booleans to numbers, strings to numbers, and objects to primitives; `null` only equals `undefined`.
- Relational operators compare strings as strings and everything else as numbers.
- `+` concatenates if either side becomes a string.
- `===`, SameValueZero and `Object.is` differ only on `NaN` and `±0`.
- Floating point is inexact for most decimals; use integers or decimal libraries for money.
