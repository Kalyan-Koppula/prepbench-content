import { useEffect, useRef, useState } from 'react'

export function useDebouncedCallback(fn, delay) {
  const fnRef = useRef(fn)
  const delayRef = useRef(delay)
  const timer = useRef(null)
  const pendingArgs = useRef(null)

  useEffect(() => {
    fnRef.current = fn
    delayRef.current = delay
  })

  const [debounced] = useState(() => {
    const run = () => {
      const args = pendingArgs.current
      timer.current = null
      pendingArgs.current = null
      fnRef.current(...args)
    }
    const d = (...args) => {
      pendingArgs.current = args
      clearTimeout(timer.current)
      timer.current = setTimeout(run, delayRef.current)
    }
    d.cancel = () => {
      clearTimeout(timer.current)
      timer.current = null
      pendingArgs.current = null
    }
    d.flush = () => {
      if (timer.current === null) return
      clearTimeout(timer.current)
      run()
    }
    return d
  })

  useEffect(() => () => debounced.cancel(), [debounced])

  return debounced
}
