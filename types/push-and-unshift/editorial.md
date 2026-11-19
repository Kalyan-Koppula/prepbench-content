**Key insight:** a tuple type literal can contain a spread of another tuple type plus any extra elements, so both helpers are one line.

## Approach

```ts
type Push<T extends readonly unknown[], U> = [...T, U]
type Unshift<T extends readonly unknown[], U> = [U, ...T]
```

`U` sits in a single slot, so `Push<[1], [2, 3]>` is `[1, [2, 3]]`. That's the difference from `Concat`, which spreads both sides. Spreading a `readonly` tuple into a new tuple literal gives a mutable tuple, and spreading a plain array (`number[]`) produces a rest element: `[...number[], 'end']`.

## Step by step

| Expression | Result |
| --- | --- |
| `Push<[1, 2], 3>` | `[1, 2, 3]` |
| `Unshift<[1, 2], 0>` | `[0, 1, 2]` |
| `Push<[], 'a'>` | `['a']` |

Spreads in tuple types (`[...T, U]`) work like array spreads in values.

## Pitfalls

- Writing `T & [U]` or other non-spread forms.

## Follow-ups

- Type a runtime `push<T extends unknown[], U>(arr: [...T], item: U): [...T, U]` that returns a new array.
- Write `Pop<T>` and `Shift<T>` using `infer` on the same patterns.

## In the interview

Short; use it to segue into variadic tuple types, which power typed `concat`, `zip` and function argument manipulation.
