**Key insight:** recursion over the tuple handles the structure, and a counter tuple handles the depth, since the type system has no `+ 1` but tuples know their `length`.

## Approach

```ts
type Flatten<T extends readonly unknown[]> = T extends readonly [infer H, ...infer R]
  ? H extends readonly unknown[] ? [...Flatten<H>, ...Flatten<R>] : [H, ...Flatten<R>]
  : []
```

Take the head. If it's a tuple, flatten it and spread it in; otherwise keep it as one element. Then do the same for the tail. An empty tuple ends the recursion with `[]`, which is also why empty nested tuples vanish. The `readonly` in the constraint and both patterns lets `as const` data through.

For a fixed depth, write a one-level version (`FlattenOnce`, which spreads `H` without recursing into it) and apply it `D` times:

```ts
type FlattenDepth<T extends readonly unknown[], D extends number = 1, Count extends unknown[] = []> =
  Count['length'] extends D ? T : FlattenDepth<FlattenOnce<T>, D, [...Count, unknown]>
```

`Count` starts empty and gains one element per level, so `Count['length']` is `0, 1, 2, …`. When it reaches `D` we stop. Large depths are fine: once everything is flat, `FlattenOnce` changes nothing, and the extra passes are cheap. (You could also stop early when `FlattenOnce<T>` equals `T`.)

## Follow-ups

- Make `Flatten` handle open-ended arrays too: `Flatten<[1, string[]]>` → `[1, ...string[]]`.
- Type `flat<T extends readonly unknown[], D extends number = 1>(arr: T, depth?: D): FlattenDepth<T, D>`. Why does `FlattenDepth<T, number>` recurse forever, and how would you guard against it?
