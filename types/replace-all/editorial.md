**Key insight:** a template literal pattern with `From` between two `infer`s splits the string at the first occurrence of `From`. `ReplaceAll` is that split plus recursion on the *remainder only*.

## Approach

```ts
type Replace<S extends string, From extends string, To extends string> = From extends ''
  ? S
  : S extends `${infer Before}${From}${infer After}` ? `${Before}${To}${After}` : S

type ReplaceAll<S extends string, From extends string, To extends string> = From extends ''
  ? S
  : S extends `${infer Before}${From}${infer After}`
    ? `${Before}${To}${ReplaceAll<After, From, To>}`
    : S
```

- When matching, the first `infer` takes the shortest possible text, so `Before` ends at the first occurrence of `From`.
- `ReplaceAll` recurses on `After` and puts `To` in front of it. Recursing on the whole result (`` ReplaceAll<`${Before}${To}${After}`, From, To> ``) rescans inserted text: `'aaaa'` collapses to `'a'`, and `ReplaceAll<'a.b', '.', '..'>` never terminates.
- `''` matches at position 0 with `Before = ''` and `After = S`, so without the guard `ReplaceAll` would loop forever. TypeScript stops it with "Type instantiation is excessively deep".

## Follow-ups

- Write `Split<S, Sep>` and `Join<T, Sep>`, and express `ReplaceAll` as `Join<Split<S, From>, To>`.
- Extract route params: `RouteParams<'/users/:id/posts/:postId'>` → `'id' | 'postId'`.
