---
title: useDebouncedValue
difficulty: Medium
order: 1
tags: [useEffect, timers, cleanup]
frequency: high
hook: useDebouncedValue
hints:
  - Keep the debounced value in state and update it from an effect.
  - The effect should schedule a timer and return a cleanup that clears it.
  - Put both `value` and `delay` in the dependency array.
---

Implement `useDebouncedValue(value, delay)`. It returns `value`, but only after `value` has stopped changing for `delay` milliseconds. The first render returns the initial value immediately.

```jsx
function Search() {
  const [query, setQuery] = useState('')
  const debounced = useDebouncedValue(query, 300)
  useEffect(() => { if (debounced) fetchResults(debounced) }, [debounced])
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />
}
```

Requirements:

- Rapid changes restart the wait.
- Changing `delay` restarts the wait with the new delay.
- No state updates after the component unmounts.
