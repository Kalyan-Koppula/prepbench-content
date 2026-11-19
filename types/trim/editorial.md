**Key insight:** template literal types can pattern-match strings. Match "starts with whitespace" or "ends with whitespace", `infer` the rest, and recurse until the pattern stops matching.

## Approach

```ts
type Ws = ' ' | '\n' | '\t'
type TrimStart<S extends string> = S extends `${Ws}${infer Rest}` ? TrimStart<Rest> : S
type TrimEnd<S extends string> = S extends `${infer Rest}${Ws}` ? TrimEnd<Rest> : S
type Trim<S extends string> = TrimEnd<TrimStart<S>>
```

Each step removes one whitespace character, and the recursion repeats until the end is clean. Because the recursive call is in tail position, TypeScript (4.5+) evaluates it iteratively and allows around 1000 steps instead of about 50.

`S` is a naked type parameter, so unions are trimmed member by member. `string` never matches a pattern with a fixed prefix, so it falls through unchanged.

`Ws` is a union inside the template. That's fine here because it's a single character at a known end. A union in the *middle* of a pattern, between two `infer`s, is risky: TypeScript tries each member and you can get a union of several splits (see `CamelCase`).

## Step by step

`Trim<'  hi \n'>`:

| Step | Matches | Remaining |
| --- | --- | --- |
| `TrimStart` | `' '` then `' '` | `'hi \n'` |
| `TrimEnd` | `'\n'` then `' '` | `'hi'` |

Each step peels one whitespace character with a template literal pattern and recurses until nothing matches.

## Pitfalls

- Forgetting tabs and newlines in the whitespace union.

## Follow-ups

- Implement `Split<S, Sep>` that turns `'a,b,c'` into `['a', 'b', 'c']`.
- Type a runtime `trim<S extends string>(s: S): Trim<S>`. Why do you need a cast in the body?

## In the interview

Small and clear; good for showing recursive template literal patterns from both ends.
