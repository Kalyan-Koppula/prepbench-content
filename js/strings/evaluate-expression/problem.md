---
title: Evaluate an arithmetic expression
difficulty: Hard
order: 9
tags: [strings, parsing, recursion]
frequency: medium
exports: [evaluate]
hints:
  - "Tokenize first: numbers, the four operators, parentheses. Anything else is an error."
  - "Use recursive descent with one function per precedence level: `expression` handles `+ -`, `term` handles `* /`, `factor` handles numbers, parentheses and unary minus."
  - Loop (rather than recurse) inside `expression` and `term` to get left associativity. After parsing, check that every token was used.
---

Implement `evaluate(expression)`, which computes the value of an arithmetic expression given as a string. **Don't** use `eval`, `new Function` or similar.

Supported syntax:

- numbers such as `12`, `3.75` and `.5` (a leading zero is plain decimal: `010` is ten);
- the binary operators `+ - * /` with the usual precedence (`*` and `/` before `+` and `-`), all **left-associative**;
- parentheses, nested to any depth;
- unary minus and plus, which can stack: `-3`, `2 * -4`, `-(1 + 2)`, `--5`;
- whitespace anywhere between tokens.

```js
evaluate('2 + 3 * 4')        // 14
evaluate('(2 + 3) * 4')      // 20
evaluate('10 - 4 - 3')       // 3, not 9
evaluate('-(1.5 + .5) * -3') // 6
```

Division follows JavaScript: `1 / 0` is `Infinity`.

## Notes

- Throw a `SyntaxError` for anything invalid: an empty input, an unknown character, a missing operand (`2 +`), unbalanced parentheses, two numbers in a row (`1 2`), or syntax this grammar doesn't have (`2 ** 3`, `0x10`, `1e3`).
