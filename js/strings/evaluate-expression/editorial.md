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

## Walkthrough

`evaluate('2 + 3 * (4 - 1)')` with recursive descent (`expression → term (+|- term)*`, `term → factor (*|/ factor)*`, `factor → number | (expression) | -factor`):

| Call | Consumes | Returns |
| --- | --- | --- |
| expression | `2` via term | 2 |
| sees `+` | term: `3 * (4 - 1)` | – |
| term | factor `3`, sees `*`, factor `( … )` | – |
| factor `( … )` | expression `4 - 1` | 3 |
| term | `3 * 3` | 9 |
| expression | `2 + 9` | **11** |

Precedence comes from the grammar's layers: multiplication is handled one level deeper than addition, so it binds tighter. Left-to-right loops inside each level give left associativity (`8 - 3 - 2 = 3`).

## Complexity

`O(n)` for tokenising and parsing; recursion depth grows with parenthesis nesting.

## Edge cases to test

- Precedence and associativity (`2 + 3 * 4`, `8 / 4 / 2`).
- Parentheses, nested.
- Unary minus (`-(2 + 3)`, `3 * -2`).
- Decimals and whitespace.
- Errors: unbalanced parentheses, trailing operators, unknown characters.
- Division by zero (returns `Infinity`, or throw if specified).

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

## In the interview

State the grammar first; it makes the code mechanical. Mention the alternative (shunting-yard to postfix, then evaluate with a stack) and never use `eval` (a code injection risk).
