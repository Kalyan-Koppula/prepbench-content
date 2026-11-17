import { useState, useRef, useCallback, useEffect } from 'react'

export function useAsync(asyncFn) {
  const [state, setState] = useState({ status: 'idle', data: undefined, error: undefined })
  const fnRef = useRef(asyncFn)
  const latest = useRef(0)
  const mounted = useRef(false)

  useEffect(() => {
    fnRef.current = asyncFn
  })

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const run = useCallback((...args) => {
    const id = ++latest.current
    const isCurrent = () => mounted.current && id === latest.current
    setState((s) => ({ ...s, status: 'pending' }))
    let promise
    try {
      promise = Promise.resolve(fnRef.current(...args))
    } catch (err) {
      promise = Promise.reject(err) // asyncFn threw synchronously
    }
    promise.then(
      (data) => isCurrent() && setState({ status: 'success', data, error: undefined }),
      (error) => isCurrent() && setState({ status: 'error', data: undefined, error }),
    )
  }, [])

  return { run, ...state }
}
