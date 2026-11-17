---
title: Parse a query string
difficulty: Medium
order: 3
tags: [strings, url, parsing, security]
frequency: medium
exports: [parseQuery]
hints:
  - Split on `&`, then split each piece on the first `=` only (`indexOf`, not `split('=')`).
  - Turn `+` into a space before calling `decodeURIComponent`, and wrap the decode in `try/catch`.
  - Assigning `obj['__proto__'] = value` does not create a property. Use `Object.defineProperty` or a null-prototype object.
---

Implement `parseQuery(query)`, which turns a URL query string into an object, without using `URLSearchParams`.

```js
parseQuery('?q=red+shoes&size=9&size=10&sort=')
// { q: 'red shoes', size: ['9', '10'], sort: '' }
```

Rules:

- A leading `?` is optional. Pairs are separated by `&`; empty pieces (from `&&` or a trailing `&`) are skipped.
- Each pair splits on its **first** `=`: `token=ab==` gives `'ab=='`. A piece without `=` has the value `''`. A piece with an empty key (`=x`) is skipped.
- Keys and values are decoded: `+` means a space, then percent-escapes are decoded (so `%2B` is a literal `+`). If a piece can't be decoded (for example `100%`), keep its raw text, with `+` still turned into a space.
- A key that appears once maps to a string. A key that appears more than once maps to an array of its values, in order.
- Keys are stored in first-seen order, and **any** key, including `__proto__`, must become an ordinary own property of the result.

## Notes

- All values are strings; don't convert numbers or booleans.
- `parseQuery('')` and `parseQuery('?')` return `{}`.
