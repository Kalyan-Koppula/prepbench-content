**Key insight:** precedence becomes structure. With one parsing function per precedence level, each calling the next-tighter level for its operands, `2 + 3 * 4` parses correctly without any precedence table. Looping inside each level (instead of recursing on the right) gives left associativity.

## Approach

1. **Tokenize** with a sticky regex: optional whitespace, then a number (`\d+(\.\d+)?|\.\d+`) or one of `+-*/()`. Anything else throws.
2. **Grammar:**
   - `expression := term (('+' | '-') term)*`
   - `term := factor (('*' | '/') factor)*`
   - `factor := ('-' | '+') factor | number | '(' expression ')'`
3. Each function consumes tokens from a shared `pos`. `factor` throws on a missing token, a stray operator, or a missing `)`.
4. After `expression()` returns, any leftover token (like the `2` in `1 2` or a stray `)`) is an error.

An alternative is Dijkstra's **shunting-yard** algorithm: two stacks (values, operators) and a precedence table. Unary minus is its awkward part: you have to tell it apart from binary minus by looking at the previous token.

## Pitfalls

- Right recursion (`expression := term '-' expression`) evaluates `10 - 4 - 3` as `10 - (4 - 3) = 9`.
- Treating `-` as part of the number in the tokenizer: `3-2` then tokenizes as `3` and `-2`.
- Forgetting the final "all tokens consumed" check, so `1 + 2)` quietly returns `3`.
- `parseFloat` on the rest of the string: it happily accepts `1e3` and `1.2.3` prefixes.
- `eval` with a character whitelist: still turns `010` into 8 in sloppy mode and accepts `2 ** 3`.

## Follow-ups interviewers add

- **Exponent `^`:** right-associative and tighter than unary minus (`-2^2` is `-4`); add a level between `term` and `factor`.
- **Variables and functions:** `evaluate('max(a, 3) * 2', { a: 5 })`.
- **Build an AST** first, then evaluate or pretty-print it.
- **Error positions:** report the column of the bad token for a better UI.
