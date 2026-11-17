import { useState, useCallback } from 'react'

export function useCounter(initial = 0, { min = -Infinity, max = Infinity, step = 1 } = {}) {
  const clamp = useCallback((n) => Math.min(max, Math.max(min, n)), [min, max])
  const [count, setCount] = useState(() => clamp(initial))

  const increment = useCallback(() => setCount((c) => clamp(c + step)), [clamp, step])
  const decrement = useCallback(() => setCount((c) => clamp(c - step)), [clamp, step])
  const set = useCallback((n) => setCount(clamp(n)), [clamp])
  const reset = useCallback(() => setCount(clamp(initial)), [clamp, initial])

  return { count, increment, decrement, set, reset }
}
