import { useState, useEffect, useRef } from 'react'

export function useThrottledValue(value, interval) {
  const [throttled, setThrottled] = useState(value)
  const shown = useRef(value)
  const lastShown = useRef(Date.now())

  useEffect(() => {
    if (Object.is(value, shown.current)) return // nothing new to show (e.g. on mount)
    const show = () => {
      lastShown.current = Date.now()
      shown.current = value
      setThrottled(value)
    }
    const elapsed = Date.now() - lastShown.current
    if (elapsed >= interval) {
      show()
      return
    }
    const id = setTimeout(show, interval - elapsed)
    return () => clearTimeout(id)
  }, [value, interval])

  return throttled
}
