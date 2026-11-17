import { useState, useCallback } from 'react'

const inRange = (arr, i) => Number.isInteger(i) && i >= 0 && i < arr.length

export function useArray(initial = []) {
  const [array, setArray] = useState(initial)

  const set = useCallback((next) => setArray(next), [])
  const push = useCallback((...items) => setArray((prev) => [...prev, ...items]), [])
  const remove = useCallback(
    (index) => setArray((prev) => (inRange(prev, index) ? prev.filter((_, i) => i !== index) : prev)),
    [],
  )
  const update = useCallback(
    (index, item) => setArray((prev) => (inRange(prev, index) ? prev.map((x, i) => (i === index ? item : x)) : prev)),
    [],
  )
  const clear = useCallback(() => setArray([]), [])

  return { array, set, push, remove, update, clear }
}
