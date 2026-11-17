**Key insight:** a tuple type literal can contain a spread of another tuple type plus any extra elements, so both helpers are one line.

## Approach

```ts
type Push<T extends readonly unknown[], U> = [...T, U]
type Unshift<T extends readonly unknown[], U> = [U, ...T]
```

`U` sits in a single slot, so `Push<[1], [2, 3]>` is `[1, [2, 3]]`. That's the difference from `Concat`, which spreads both sides. Spreading a `readonly` tuple into a new tuple literal gives a mutable tuple, and spreading a plain array (`number[]`) produces a rest element: `[...number[], 'end']`.

## Follow-ups

- Type a runtime `push<T extends unknown[], U>(arr: [...T], item: U): [...T, U]` that returns a new array.
- Write `Pop<T>` and `Shift<T>` using `infer` on the same patterns.
