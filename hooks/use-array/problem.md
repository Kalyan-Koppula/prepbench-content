---
title: useArray
difficulty: Easy
order: 13
tags: [useState, immutability, useCallback]
frequency: medium
hook: useArray
hints:
  - Every helper should call the setter with an updater, `setArray((prev) => ...)`, and build a new array from `prev`.
  - Use non-mutating methods (`[...prev, x]`, `filter`, `map`, `slice`) instead of `push` / `splice` on the state array.
  - Helpers that only use the updater form need no dependencies, so `useCallback(..., [])` keeps them stable.
---

Implement `useArray(initial = [])`. It returns `{ array, set, push, remove, update, clear }`.

| Helper | Does |
|---|---|
| `set(next)` | replaces the array |
| `push(...items)` | appends one or more items |
| `remove(index)` | removes the item at `index` |
| `update(index, item)` | replaces the item at `index` |
| `clear()` | empties the array |

```jsx
function TodoList() {
  const { array: todos, push, remove, update } = useArray([])
  return (
    <>
      <button onClick={() => push({ text: 'New', done: false })}>Add</button>
      {todos.map((t, i) => (
        <Todo key={i} todo={t} onToggle={() => update(i, { ...t, done: !t.done })} onDelete={() => remove(i)} />
      ))}
    </>
  )
}
```

Requirements:

- Never mutate: every change produces a new array, and arrays you got earlier stay untouched.
- Helpers called several times in one event all apply (two `push` calls add two items).
- `remove` / `update` with an index outside the array do nothing and keep the same array reference (no re-render).
- All helpers keep the same identity across renders, so memoised rows don't re-render.
