---
title: What JSON.stringify drops
difficulty: Hard
order: 12
tags: [json, objects]
frequency: high
expected: |
  {"id":1,"nan":null,"inf":null,"date":"1970-01-01T00:00:00.000Z","list":[null,null,null],"nested":"custom"}
  undefined undefined
  {} {}
---

```js
const data = {
  id: 1,
  fn() {},
  missing: undefined,
  sym: Symbol('s'),
  nan: NaN,
  inf: -Infinity,
  date: new Date(0),
  list: [undefined, () => 1, Symbol('x')],
  nested: { toJSON() { return 'custom' } },
}
console.log(JSON.stringify(data))

console.log(JSON.stringify(undefined), JSON.stringify(() => 1))

const m = new Map([['a', 1]])
const s = new Set([1])
console.log(JSON.stringify(m), JSON.stringify(s))
```

## Explanation

**As object properties,** functions, `undefined` and symbols have no JSON form, so the property is **omitted** entirely (`fn`, `missing`, `sym`).

**`NaN` and `±Infinity`** become `null`.

**`Date`** has a `toJSON` method that returns its ISO string. Any object with `toJSON` is replaced by what it returns, which is why `nested` becomes `"custom"`.

**Inside arrays,** a value can't be dropped without shifting the indexes, so functions, `undefined` and symbols become `null` instead.

**At the top level,** there's nothing to serialise, so `JSON.stringify` returns `undefined` itself (not the string `"undefined"`).

**`Map` and `Set`** have no own enumerable properties, so they serialise as `{}`. Convert them first, e.g. `Object.fromEntries(m)` or `[...s]`.

Rule to remember: drop in objects, `null` in arrays, `undefined` at the top level; non-finite numbers become `null` and `toJSON` wins.
