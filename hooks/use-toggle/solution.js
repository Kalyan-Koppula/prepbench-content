import { useState, useCallback } from 'react'

export function useToggle(initial = false) {
  const [on, setOn] = useState(initial)

  const toggle = useCallback((next) => {
    setOn((prev) => (typeof next === 'boolean' ? next : !prev))
  }, [])

  return [on, toggle]
}
