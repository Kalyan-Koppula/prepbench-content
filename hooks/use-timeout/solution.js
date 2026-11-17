import { useEffect, useRef, useCallback } from 'react'

export function useTimeout(callback, delay) {
  const saved = useRef(callback)
  const timer = useRef(null)

  useEffect(() => {
    saved.current = callback
  }, [callback])

  const clear = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }, [])

  const reset = useCallback(() => {
    clear()
    if (delay === null || delay === undefined) return
    timer.current = setTimeout(() => {
      timer.current = null
      saved.current()
    }, delay)
  }, [delay, clear])

  useEffect(() => {
    reset()
    return clear
  }, [reset, clear])

  return { reset, clear }
}
