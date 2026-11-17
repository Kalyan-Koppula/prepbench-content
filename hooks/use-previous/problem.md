---
title: usePrevious
difficulty: Easy
order: 2
tags: [useState, useRef, render-phase]
frequency: high
hook: usePrevious
hints:
  - You need to remember two things between renders - the value you saw last time and the one before it.
  - Only shift them when the incoming value is actually different (`Object.is`), so unrelated re-renders leave the answer alone.
  - Storing both in one `useState` object and updating it during render (when the value changed) is the pattern the React docs recommend.
---

Implement `usePrevious(value)`. It returns the value that `value` held **before its most recent change**, or `undefined` if it has never changed.

```jsx
function Price({ amount }) {
  const before = usePrevious(amount)
  const trend = before === undefined ? '' : amount > before ? '▲' : amount < before ? '▼' : ''
  return <span>{amount} {trend}</span>
}
```

| Renders with | Returns |
|---|---|
| `5` | `undefined` |
| `8` | `5` |
| `8` (parent re-rendered for another reason) | `5` |
| `3` | `8` |

Requirements:

- Compare with `Object.is`, so `0`, `''`, `null` and `NaN` are tracked like any other value.
- A re-render where `value` is unchanged must not overwrite the previous value. (The classic `useRef` + `useEffect` version gets this wrong.)
- The answer must be correct during the render itself, not one render late.
