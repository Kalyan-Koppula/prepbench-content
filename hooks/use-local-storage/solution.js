import { useState, useEffect, useCallback, useRef } from 'react'

// Instances in this tab. Browsers only send `storage` events to *other* tabs,
// so writers notify these directly.
const subscribers = new Set()

function parse(raw, fallback) {
  if (raw === null || raw === undefined) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function read(key, fallback) {
  try {
    return parse(window.localStorage.getItem(key), fallback)
  } catch {
    return fallback // storage can be unavailable (privacy mode, sandboxed iframe)
  }
}

export function useLocalStorage(key, initialValue) {
  const initialRef = useRef(initialValue)
  initialRef.current = initialValue

  const [value, setState] = useState(() => read(key, initialValue))

  const setValue = useCallback(
    (next) => {
      // Storage is the source of truth, so chained updaters and other instances agree.
      const prev = read(key, initialRef.current)
      const resolved = typeof next === 'function' ? next(prev) : next
      try {
        window.localStorage.setItem(key, JSON.stringify(resolved))
      } catch {
        // quota exceeded or storage disabled: keep the in-memory value anyway
      }
      setState(resolved)
      for (const notify of subscribers) notify(key, resolved)
    },
    [key],
  )

  useEffect(() => {
    const onLocal = (changedKey, next) => {
      if (changedKey === key) setState(next)
    }
    const onStorage = (e) => {
      if (e.key !== null && e.key !== key) return
      // key === null means another tab called localStorage.clear()
      setState(e.key === null ? initialRef.current : parse(e.newValue, initialRef.current))
    }
    subscribers.add(onLocal)
    window.addEventListener('storage', onStorage)
    return () => {
      subscribers.delete(onLocal)
      window.removeEventListener('storage', onStorage)
    }
  }, [key])

  return [value, setValue]
}
